/**
 * 种子随机数生成器
 * 
 * 使用 mulberry32 算法，保证：
 * - 同种子 = 同序列（可复现）
 * - 分布均匀
 * - 速度快
 */
export class SeededRandom {
    private state: number;

    constructor(seed: number) {
        this.state = seed | 0;
        // 预热几轮，消除种子偏差
        for (let i = 0; i < 4; i++) this.next();
    }

    /** 返回 [0, 1) 的浮点数 */
    next(): number {
        this.state |= 0;
        this.state = (this.state + 0x6D2B79F5) | 0;
        let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }

    /** 返回 [min, max] 闭区间整数 */
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    /** 返回 [min, max) 的浮点数 */
    nextFloat(min: number, max: number): number {
        return this.next() * (max - min) + min;
    }

    /** 从数组中随机选一个 */
    pick<T>(arr: readonly T[]): T {
        if (arr.length === 0) throw new Error('Cannot pick from empty array');
        return arr[Math.floor(this.next() * arr.length)];
    }

    /** 从数组中随机选 n 个（不重复） */
    pickN<T>(arr: readonly T[], n: number): T[] {
        const copy = [...arr];
        const result: T[] = [];
        const count = Math.min(n, copy.length);
        for (let i = 0; i < count; i++) {
            const idx = Math.floor(this.next() * copy.length);
            result.push(copy[idx]);
            copy.splice(idx, 1);
        }
        return result;
    }

    /** Fisher-Yates 洗牌（原地） */
    shuffle<T>(arr: T[]): T[] {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /** 加权随机选择 */
    weightedPick<T>(items: readonly T[], weights: readonly number[]): T {
        if (items.length !== weights.length) throw new Error('Items and weights length mismatch');
        const total = weights.reduce((a, b) => a + b, 0);
        let roll = this.next() * total;
        for (let i = 0; i < items.length; i++) {
            roll -= weights[i];
            if (roll <= 0) return items[i];
        }
        return items[items.length - 1];
    }

    /** 概率判定 */
    chance(probability: number): boolean {
        return this.next() < probability;
    }

    /** 生成唯一ID */
    uid(prefix: string = ''): string {
        const hex = Math.floor(this.next() * 0xFFFFFFFF).toString(16).padStart(8, '0');
        return prefix ? `${prefix}_${hex}` : hex;
    }

    /** Fork — 基于当前状态派生子 RNG（不影响父序列） */
    fork(): SeededRandom {
        return new SeededRandom(Math.floor(this.next() * 0x7FFFFFFF));
    }
}

/** 从字符串生成数字种子 */
export function hashSeed(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        hash = ((hash << 5) - hash + c) | 0;
    }
    return Math.abs(hash);
}
