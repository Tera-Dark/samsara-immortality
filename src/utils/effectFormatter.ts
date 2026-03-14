import type { Effect } from '../types/index';
import { TEXT_CONSTANTS } from '../data/rules';
import { ITEMS } from '../data/items';

/**
 * 格式化 Effect 对象为 UI 可展示的标签数组
 * @param effect 效果对象
 * @returns 包含具体数值说明的标签，如 ["体魄 +2", "随机属性 +5", "银两 500"]
 */
export function formatEffectToTags(effect: Effect): string[] {
    const tags: string[] = [];
    if (!effect) return tags;

    // 1. 本地化属性名称的辅助函数
    const getStatName = (key: string) => {
        return TEXT_CONSTANTS.STATS[key as keyof typeof TEXT_CONSTANTS.STATS] || key;
    };

    const getItemName = (id: string) => {
        return ITEMS[id]?.name || id;
    };

    // 2. 基础/平铺属性
    for (const key in effect) {
        if (['flags', 'history', 'stats', 'per_turn', 'items', 'item', 'random_stats', 'random_items'].includes(key)) continue;

        if (typeof effect[key] === 'number') {
            const val = effect[key] as number;
            // 排除 0
            if (val === 0) continue;
            
            const name = getStatName(key);
            const prefix = val > 0 ? '+' : '';
            // 特殊处理 MONEY（灵石），显示为 "灵石 x N" 或 "灵石 +N"
            if (key === 'MONEY') {
                 tags.push(`灵石 ${val}`);
            } else {
                 tags.push(`${name} ${prefix}${val}`);
            }
        }
    }

    // 3. 旧版嵌套 stats
    if (effect.stats) {
        for (const [key, val] of Object.entries(effect.stats)) {
            if (val === 0) continue;
            const name = getStatName(key);
            const prefix = val > 0 ? '+' : '';
            if (key === 'MONEY') {
                 tags.push(`灵石 ${val}`);
            } else {
                 tags.push(`${name} ${prefix}${val}`);
            }
        }
    }

    // 4. 每回合属性 per_turn
    if (effect.per_turn) {
        for (const [key, val] of Object.entries(effect.per_turn)) {
            if (val === 0) continue;
            const name = key === 'ALL' ? '全属性' : getStatName(key);
            const prefix = val > 0 ? '+' : '';
            tags.push(`每回合 ${name} ${prefix}${val}`);
        }
    }

    // 5. 随机属性
    if (effect.random_stats && effect.random_stats.pool.length > 0) {
        tags.push(`随机属性 +${effect.random_stats.totalAmount}`);
    }

    // 6. 随机物品
    if (effect.random_items && effect.random_items.pool.length > 0) {
        tags.push(`随机物品 x${effect.random_items.totalCount}`);
    }

    // 7. 单个物品
    if (effect.item) {
        tags.push(`获得 ${getItemName(effect.item as string)}`);
    }

    // 8. 多个物品
    if (effect.items) {
        // 合并相同物品的计数
        const itemCounts: Record<string, number> = {};
        for (const id of effect.items as string[]) {
            itemCounts[id] = (itemCounts[id] || 0) + 1;
        }
        for (const [id, count] of Object.entries(itemCounts)) {
             tags.push(`获得 ${getItemName(id)} x${count}`);
        }
    }

    // 9. Flags (可选：如果有需要显示的 flag 可以映射，目前暂隐或使用 history/text 描述)
    if (effect.flags) {
        if (effect.flags.includes('UNLOCK_TRAVEL')) tags.push('解锁 游历');
        if (effect.flags.includes('UNLOCK_TRADE')) tags.push('解锁 商贸');
        if (effect.flags.includes('UNLOCK_ALCHEMY')) tags.push('解锁 炼丹');
    }

    return tags;
}
