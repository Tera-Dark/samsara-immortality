
import type { PlayerState, Condition, ConditionOp } from '../types';

export class ConditionMatcher {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static checkConditions(state: PlayerState, conditions: Condition[], context?: any): boolean {
        if (!conditions || conditions.length === 0) return true;
        return conditions.every(cond => this.check(state, cond, context));
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static check(state: PlayerState, condition: Condition, context?: any): boolean {
        const { type, target, op, value } = condition;
        let actualValue: number | string | boolean | undefined;

        switch (type) {
            case 'STAT':
            case 'ATTRIBUTE':
                actualValue = state.attributes[target!] || 0;
                break;
            case 'FLAG':
                // Standard check: does a specific flag exist?
                if (target) {
                    actualValue = state.flags.includes(target);
                } else if (op === 'IN' && Array.isArray(value)) {
                    // OR-flag pattern: check if ANY of the listed flags exist
                    // Usage: { type: 'FLAG', op: 'IN', value: ['FLAG_A', 'FLAG_B'] }
                    return (value as string[]).some(f => state.flags.includes(f));
                } else if (op === 'NIN' && Array.isArray(value)) {
                    // NONE-flag pattern: check that NONE of the listed flags exist
                    return !(value as string[]).some(f => state.flags.includes(f));
                }
                break;
            case 'AGE':
                actualValue = state.age;
                break;
            case 'REALM':
                actualValue = state.realm_idx;
                break;
            case 'WORLD_ERA':
                actualValue = state.world?.era?.id;
                break;
            case 'WORLD_LUCK':
                actualValue = state.world?.globalLuck || 50;
                break;
            case 'ROOT_STATE':
                // Access root props: background, gender, race
                // Also check CONTEXT if target is 'action'
                if (target === 'action' && context?.action) {
                    actualValue = context.action;
                } else {
                    // @ts-expect-error - Dynamic access to root state properties
                    actualValue = state[target!] as string | number | boolean;
                }
                break;
            default:
                console.warn(`[ConditionMatcher] Unknown type: ${type}`);
                return false;
        }

        return this.compare(actualValue, op, value);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static compare(actual: any, op: ConditionOp, expected: any): boolean {
        switch (op) {
            case 'EQ': return actual == expected;
            case 'NEQ': return actual != expected;
            case 'GT': return Number(actual) > Number(expected);
            case 'GTE': return Number(actual) >= Number(expected);
            case 'LT': return Number(actual) < Number(expected);
            case 'LTE': return Number(actual) <= Number(expected);
            case 'IN':
                if (Array.isArray(expected)) return expected.includes(actual);
                // String inclusion: 'abc' IN 'abcdef'
                if (typeof expected === 'string' && typeof actual === 'string') return expected.includes(actual);
                return false;
            case 'NIN':
                if (Array.isArray(expected)) return !expected.includes(actual);
                if (typeof expected === 'string' && typeof actual === 'string') return !expected.includes(actual);
                return true;
            default:
                return false;
        }
    }
}
