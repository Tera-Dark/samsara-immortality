/**
 * EventValidator — 事件验证器
 * 
 * 作为 AI 事件注入的安全层，验证事件数据的结构和内容完整性。
 * 拒绝格式错误、包含非法字段或不安全内容的事件。
 */

import type { GameEvent, ConditionType, ConditionOp } from '../types';
import { CONDITION_TYPES, CONDITION_OPS } from '../types';

// ═══ Validation Types ═══

export interface ValidationError {
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    /** Sanitized event (with fixes applied for warnings) */
    event?: GameEvent;
}

// ═══ Validator Config ═══

export interface ValidatorConfig {
    /** Registered stat IDs from ModuleConfig (e.g. ['STR','INT','POT',...]) */
    registeredStats: string[];
    /** Registered resource IDs (e.g. ['L_SPIRIT','GOLD',...]) */
    registeredResources: string[];
    /** Maximum content length (防止超长文本) */
    maxContentLength: number;
    /** Maximum title length */
    maxTitleLength: number;
    /** Maximum number of choices per event */
    maxChoices: number;
    /** Maximum number of conditions per event */
    maxConditions: number;
    /** Whether to allow unknown stat keys in effects (lenient mode) */
    allowUnknownStats: boolean;
}

const DEFAULT_CONFIG: ValidatorConfig = {
    registeredStats: [],
    registeredResources: [],
    maxContentLength: 2000,
    maxTitleLength: 50,
    maxChoices: 8,
    maxConditions: 20,
    allowUnknownStats: false,
};

// ═══ Reserved keys in Effect that are NOT attribute modifiers ═══
const EFFECT_RESERVED_KEYS = new Set([
    'flags', 'history', 'stats', 'per_turn', 'items', 'item'
]);

// ═══ EventValidator ═══

export class EventValidator {
    private config: ValidatorConfig;
    private validStatSet: Set<string>;

    constructor(config?: Partial<ValidatorConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.validStatSet = new Set(this.config.registeredStats);
    }

    /**
     * Validate a raw event object. Returns a ValidationResult.
     * - `valid: true` = event is safe to inject
     * - `valid: false` = event has errors and must be rejected
     */
    validate(raw: unknown): ValidationResult {
        const errors: ValidationError[] = [];
        const warnings: ValidationError[] = [];

        // ── 1. Basic Type Check ──
        if (raw === null || raw === undefined || typeof raw !== 'object') {
            errors.push({ field: 'root', message: '事件必须是非空对象', severity: 'error' });
            return { valid: false, errors, warnings };
        }

        const evt = raw as Record<string, unknown>;

        // ── 2. Required Fields ──
        if (typeof evt.id !== 'string' || evt.id.trim() === '') {
            errors.push({ field: 'id', message: '事件必须有非空字符串 id', severity: 'error' });
        }

        if (typeof evt.content !== 'string' || evt.content.trim() === '') {
            errors.push({ field: 'content', message: '事件必须有非空字符串 content', severity: 'error' });
        }

        // ── 3. String Length Checks ──
        if (typeof evt.content === 'string' && evt.content.length > this.config.maxContentLength) {
            warnings.push({ field: 'content', message: `内容过长 (${evt.content.length} > ${this.config.maxContentLength})`, severity: 'warning' });
        }

        if (typeof evt.title === 'string' && evt.title.length > this.config.maxTitleLength) {
            warnings.push({ field: 'title', message: `标题过长 (${evt.title.length} > ${this.config.maxTitleLength})`, severity: 'warning' });
        }

        // ── 4. Forbidden Legacy Fields ──
        const FORBIDDEN_FIELDS = ['trigger', 'age', 'reqGender', 'reqRace', 'reqRealm', 'reqStats', 'reqFlags', 'forbidFlags', 'reqEra', 'minWorldLuck'];
        for (const field of FORBIDDEN_FIELDS) {
            if (field in evt) {
                errors.push({ field, message: `禁止使用已废弃字段 "${field}"，请使用 conditions 替代`, severity: 'error' });
            }
        }

        // ── 5. Conditions Validation ──
        if (evt.conditions !== undefined) {
            if (!Array.isArray(evt.conditions)) {
                errors.push({ field: 'conditions', message: 'conditions 必须是数组', severity: 'error' });
            } else {
                if (evt.conditions.length > this.config.maxConditions) {
                    warnings.push({ field: 'conditions', message: `条件过多 (${evt.conditions.length} > ${this.config.maxConditions})`, severity: 'warning' });
                }
                (evt.conditions as unknown[]).forEach((c, i) => {
                    this.validateCondition(c, `conditions[${i}]`, errors);
                });
            }
        }

        // ── 6. Probability Check ──
        if (evt.probability !== undefined) {
            if (typeof evt.probability !== 'number' || evt.probability < 0 || evt.probability > 1) {
                errors.push({ field: 'probability', message: 'probability 必须是 0-1 之间的数字', severity: 'error' });
            }
        }

        // ── 7. Effect Validation ──
        if (evt.effect !== undefined) {
            this.validateEffect(evt.effect, 'effect', errors, warnings);
        }

        // ── 8. Choices Validation ──
        if (evt.choices !== undefined) {
            if (!Array.isArray(evt.choices)) {
                errors.push({ field: 'choices', message: 'choices 必须是数组', severity: 'error' });
            } else {
                if (evt.choices.length > this.config.maxChoices) {
                    warnings.push({ field: 'choices', message: `选项过多 (${evt.choices.length} > ${this.config.maxChoices})`, severity: 'warning' });
                }
                (evt.choices as unknown[]).forEach((ch, i) => {
                    this.validateChoice(ch, `choices[${i}]`, errors, warnings);
                });
            }
        }

        // ── 9. Branches Validation ──
        if (evt.branches !== undefined) {
            if (!Array.isArray(evt.branches)) {
                errors.push({ field: 'branches', message: 'branches 必须是数组', severity: 'error' });
            } else {
                (evt.branches as unknown[]).forEach((b, i) => {
                    this.validateBranch(b, `branches[${i}]`, errors, warnings);
                });
            }
        }

        // ── 10. Security Check — No code injection ──
        this.checkInjection(evt, errors);

        const valid = errors.length === 0;
        return {
            valid,
            errors,
            warnings,
            event: valid ? (evt as unknown as GameEvent) : undefined,
        };
    }

    /**
     * Batch validate an array of events. Returns per-event results.
     */
    validateBatch(events: unknown[]): { results: ValidationResult[]; validEvents: GameEvent[]; rejectedCount: number } {
        const results = events.map(e => this.validate(e));
        const validEvents = results
            .filter(r => r.valid && r.event)
            .map(r => r.event!);
        const rejectedCount = results.filter(r => !r.valid).length;
        return { results, validEvents, rejectedCount };
    }

    // ═══ Sub-Validators ═══

    private validateCondition(raw: unknown, path: string, errors: ValidationError[]) {
        if (!raw || typeof raw !== 'object') {
            errors.push({ field: path, message: '条件必须是对象', severity: 'error' });
            return;
        }
        const cond = raw as Record<string, unknown>;

        // type
        if (typeof cond.type !== 'string' || !CONDITION_TYPES.includes(cond.type as ConditionType)) {
            errors.push({ field: `${path}.type`, message: `无效的条件类型 "${cond.type}"，允许: ${CONDITION_TYPES.join(', ')}`, severity: 'error' });
        }

        // op
        if (typeof cond.op !== 'string' || !CONDITION_OPS.includes(cond.op as ConditionOp)) {
            errors.push({ field: `${path}.op`, message: `无效的操作符 "${cond.op}"，允许: ${CONDITION_OPS.join(', ')}`, severity: 'error' });
        }

        // value must exist
        if (cond.value === undefined && cond.value === null) {
            errors.push({ field: `${path}.value`, message: '条件必须有 value', severity: 'error' });
        }
    }

    private validateEffect(raw: unknown, path: string, errors: ValidationError[], warnings: ValidationError[]) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
            errors.push({ field: path, message: 'effect 必须是非数组对象', severity: 'error' });
            return;
        }
        const eff = raw as Record<string, unknown>;

        for (const key of Object.keys(eff)) {
            if (EFFECT_RESERVED_KEYS.has(key)) continue; // Reserved keys handled separately

            const val = eff[key];
            if (typeof val === 'number') {
                // This is a stat modifier (e.g. STR: 5)
                if (!this.config.allowUnknownStats && this.validStatSet.size > 0 && !this.validStatSet.has(key)) {
                    warnings.push({ field: `${path}.${key}`, message: `未注册的属性键 "${key}"`, severity: 'warning' });
                }
            } else if (typeof val !== 'string' && !Array.isArray(val) && typeof val !== 'object') {
                errors.push({ field: `${path}.${key}`, message: `effect 中 "${key}" 值类型无效 (${typeof val})`, severity: 'error' });
            }
        }

        // Validate nested stats
        if (eff.stats !== undefined) {
            if (typeof eff.stats !== 'object' || Array.isArray(eff.stats)) {
                errors.push({ field: `${path}.stats`, message: 'stats 必须是对象', severity: 'error' });
            } else {
                for (const [k, v] of Object.entries(eff.stats as Record<string, unknown>)) {
                    if (typeof v !== 'number') {
                        errors.push({ field: `${path}.stats.${k}`, message: `stats.${k} 必须是数字`, severity: 'error' });
                    }
                }
            }
        }

        // Validate flags
        if (eff.flags !== undefined) {
            if (!Array.isArray(eff.flags)) {
                errors.push({ field: `${path}.flags`, message: 'flags 必须是字符串数组', severity: 'error' });
            } else {
                (eff.flags as unknown[]).forEach((f, i) => {
                    if (typeof f !== 'string') {
                        errors.push({ field: `${path}.flags[${i}]`, message: 'flag 必须是字符串', severity: 'error' });
                    }
                });
            }
        }

        // Validate items
        if (eff.items !== undefined) {
            if (!Array.isArray(eff.items)) {
                errors.push({ field: `${path}.items`, message: 'items 必须是字符串数组', severity: 'error' });
            }
        }
    }

    private validateChoice(raw: unknown, path: string, errors: ValidationError[], warnings: ValidationError[]) {
        if (!raw || typeof raw !== 'object') {
            errors.push({ field: path, message: '选项必须是对象', severity: 'error' });
            return;
        }
        const ch = raw as Record<string, unknown>;

        if (typeof ch.text !== 'string' || ch.text.trim() === '') {
            errors.push({ field: `${path}.text`, message: '选项必须有非空 text', severity: 'error' });
        }

        // Reject legacy condition string
        if ('condition' in ch && typeof ch.condition === 'string') {
            errors.push({ field: `${path}.condition`, message: '禁止使用字符串 condition，请使用 conditions 数组', severity: 'error' });
        }

        if (ch.conditions !== undefined) {
            if (!Array.isArray(ch.conditions)) {
                errors.push({ field: `${path}.conditions`, message: 'conditions 必须是数组', severity: 'error' });
            } else {
                (ch.conditions as unknown[]).forEach((c, i) => {
                    this.validateCondition(c, `${path}.conditions[${i}]`, errors);
                });
            }
        }

        if (ch.effect !== undefined) {
            this.validateEffect(ch.effect, `${path}.effect`, errors, warnings);
        }
    }

    private validateBranch(raw: unknown, path: string, errors: ValidationError[], warnings: ValidationError[]) {
        if (!raw || typeof raw !== 'object') {
            errors.push({ field: path, message: 'branch 必须是对象', severity: 'error' });
            return;
        }
        const b = raw as Record<string, unknown>;

        if (!Array.isArray(b.check)) {
            errors.push({ field: `${path}.check`, message: 'branch.check 必须是 Condition 数组', severity: 'error' });
        } else {
            (b.check as unknown[]).forEach((c, i) => {
                this.validateCondition(c, `${path}.check[${i}]`, errors);
            });
        }

        if (b.success !== undefined && typeof b.success === 'object') {
            const s = b.success as Record<string, unknown>;
            if (s.effect) this.validateEffect(s.effect, `${path}.success.effect`, errors, warnings);
        } else {
            errors.push({ field: `${path}.success`, message: 'branch 必须有 success 结果', severity: 'error' });
        }

        if (b.failure !== undefined && typeof b.failure === 'object') {
            const f = b.failure as Record<string, unknown>;
            if (f.effect) this.validateEffect(f.effect, `${path}.failure.effect`, errors, warnings);
        } else {
            errors.push({ field: `${path}.failure`, message: 'branch 必须有 failure 结果', severity: 'error' });
        }
    }

    // ═══ Security ═══

    private checkInjection(evt: Record<string, unknown>, errors: ValidationError[]) {
        const jsonStr = JSON.stringify(evt);

        // Check for JavaScript code patterns
        const DANGEROUS_PATTERNS = [
            /\bnew\s+Function\b/i,
            /\beval\s*\(/i,
            /\bsetTimeout\s*\(/i,
            /\bsetInterval\s*\(/i,
            /\bimport\s*\(/i,
            /\brequire\s*\(/i,
            /\bfetch\s*\(/i,
            /\bdocument\./i,
            /\bwindow\./i,
            /<script/i,
            /javascript:/i,
        ];

        for (const pattern of DANGEROUS_PATTERNS) {
            if (pattern.test(jsonStr)) {
                errors.push({
                    field: 'security',
                    message: `检测到潜在的代码注入: ${pattern.source}`,
                    severity: 'error'
                });
            }
        }
    }
}
