/**
 * EventPool — 事件池管理器
 * 
 * 管理游戏中的所有事件来源（内置事件 + AI 生成事件），
 * 支持单局注入、验证过滤和事件池隔离。
 * 
 * 使用方式：
 *   1. 创建 EventPool 并注册内置事件
 *   2. AI 生成的事件通过 inject() 注入（自动验证）
 *   3. GameEngine 通过 getPool() 获取合并后的事件池
 *   4. 新开一局时调用 resetSession() 清除注入事件
 */

import type { GameEvent } from '../types';
import { EventValidator, type ValidatorConfig, type ValidationResult } from './EventValidator';

// ═══ Injection Log ═══

export interface InjectionRecord {
    timestamp: number;
    source: string;           // 来源标识 (e.g. 'ai-gpt4', 'user-import', 'mod-xyz')
    totalSubmitted: number;   // 提交的事件数
    accepted: number;         // 通过验证的事件数
    rejected: number;         // 被拒绝的事件数
    errors: string[];         // 摘要错误信息
}

// ═══ EventPool ═══

export class EventPool {
    /** 内置事件（来自 data/events/ 的静态数据，不可修改） */
    private coreEvents: GameEvent[] = [];

    /** 注入事件（单局有效，AI 生成或用户导入） */
    private injectedEvents: GameEvent[] = [];

    /** 已注入事件的 ID 集合（防止同 ID 重复注入） */
    private injectedIds: Set<string> = new Set();

    /** 注入记录 */
    private injectionLog: InjectionRecord[] = [];

    /** 验证器实例 */
    private validator: EventValidator;

    constructor(validatorConfig?: Partial<ValidatorConfig>) {
        this.validator = new EventValidator(validatorConfig);
    }

    // ═══ Core Events ═══

    /**
     * 注册内置事件（引擎初始化时调用一次）
     */
    registerCoreEvents(events: GameEvent[]): void {
        this.coreEvents = [...events];
        console.log(`[EventPool] 已注册 ${events.length} 个内置事件`);
    }

    // ═══ AI/External Event Injection ═══

    /**
     * 注入外部事件（AI 生成或用户导入）
     * 自动调用验证器，仅注入通过验证的事件。
     * 
     * @param rawEvents 待注入的原始事件数据
     * @param source 来源标识
     * @returns 注入结果摘要
     */
    inject(rawEvents: unknown[], source: string = 'unknown'): InjectionRecord {
        const { results, validEvents, rejectedCount } = this.validator.validateBatch(rawEvents);

        // Deduplicate: skip events whose ID already exists in core or injected pool
        const newEvents: GameEvent[] = [];
        const coreIdSet = new Set(this.coreEvents.map(e => e.id));

        for (const evt of validEvents) {
            if (coreIdSet.has(evt.id)) {
                console.warn(`[EventPool] 跳过重复事件 (与内置事件冲突): ${evt.id}`);
                continue;
            }
            if (this.injectedIds.has(evt.id)) {
                console.warn(`[EventPool] 跳过重复事件 (已注入): ${evt.id}`);
                continue;
            }
            newEvents.push(evt);
            this.injectedIds.add(evt.id);
        }

        this.injectedEvents.push(...newEvents);

        // Gather error summaries
        const errorSummaries = results
            .filter(r => !r.valid)
            .flatMap(r => r.errors.map(e => `[${e.field}] ${e.message}`))
            .slice(0, 10); // Cap at 10 error messages

        const record: InjectionRecord = {
            timestamp: Date.now(),
            source,
            totalSubmitted: rawEvents.length,
            accepted: newEvents.length,
            rejected: rejectedCount + (validEvents.length - newEvents.length), // Include dedup rejects
            errors: errorSummaries,
        };

        this.injectionLog.push(record);

        console.log(`[EventPool] 注入完成 [${source}]: ${record.accepted}/${record.totalSubmitted} 通过, ${record.rejected} 拒绝`);
        if (errorSummaries.length > 0) {
            console.warn(`[EventPool] 验证错误摘要:`, errorSummaries);
        }

        return record;
    }

    /**
     * 验证单个事件（不注入，仅检查）
     */
    validateOnly(raw: unknown): ValidationResult {
        return this.validator.validate(raw);
    }

    // ═══ Pool Access ═══

    /**
     * 获取合并后的完整事件池（内置 + 注入）
     * GameEngine.events 应使用此方法获取事件列表
     */
    getPool(): GameEvent[] {
        return [...this.coreEvents, ...this.injectedEvents];
    }

    /** 获取内置事件数量 */
    getCoreCount(): number {
        return this.coreEvents.length;
    }

    /** 获取注入事件数量 */
    getInjectedCount(): number {
        return this.injectedEvents.length;
    }

    /** 获取注入记录 */
    getInjectionLog(): InjectionRecord[] {
        return [...this.injectionLog];
    }

    // ═══ Session Management ═══

    /**
     * 清除所有注入事件（新开一局时调用）
     * 内置事件不受影响
     */
    resetSession(): void {
        const count = this.injectedEvents.length;
        this.injectedEvents = [];
        this.injectedIds.clear();
        this.injectionLog = [];
        console.log(`[EventPool] 会话重置，清除 ${count} 个注入事件`);
    }

    /**
     * 移除特定来源的注入事件
     */
    removeBySource(_source: string): number {
        // We don't track source per-event currently, so this removes by log matching
        // For future enhancement: add source field to injected events
        console.warn(`[EventPool] removeBySource 暂未实现精确按来源移除，需要增强数据结构`);
        return 0;
    }

    // ═══ Debug ═══

    /**
     * 获取事件池统计信息
     */
    getStats(): { core: number; injected: number; total: number; injectionCount: number } {
        return {
            core: this.coreEvents.length,
            injected: this.injectedEvents.length,
            total: this.coreEvents.length + this.injectedEvents.length,
            injectionCount: this.injectionLog.length,
        };
    }
}
