export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
export const CHINESE_NUMBERS = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
export const MONTH_NAMES = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];

// Simplified Lunar Calendar: 30 days per month
export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = DAYS_PER_MONTH * MONTHS_PER_YEAR;

export function getNongliDate(age: number, month: number, day: number = 1): string {
    // Current "Year" in simulation is typically Age + BaseYear
    const BASE_YEAR_OFFSET = 4; // Start at JiaZi or similar if 0. 
    // 2026 is Bing Wu (丙午). Let's just cycle from 0.

    // Total years passed
    // If age starts at 0, year 0.
    const currentYear = age;

    const stemIndex = (currentYear + BASE_YEAR_OFFSET) % 10;
    const branchIndex = (currentYear + BASE_YEAR_OFFSET) % 12;

    const yearName = `${HEAVENLY_STEMS[stemIndex]}${EARTHLY_BRANCHES[branchIndex]}年`;

    // Month is 1-indexed in UI (usually) but 0-indexed in engine.
    // Engine months wrap at 12?
    // PlayerState.months is total months.
    // PlayerState.age is years.
    // Let's assume input month is 0-11
    const safeMonth = Math.max(0, Math.min(11, month % 12));
    const monthName = MONTH_NAMES[safeMonth];

    // Day 1-30
    const safeDay = Math.max(1, Math.min(30, day));
    let dayName = '';
    if (safeDay <= 10) {
        dayName = `初${CHINESE_NUMBERS[safeDay]}`;
        if (safeDay === 10) dayName = '初十';
    } else if (safeDay <= 19) {
        dayName = `十${CHINESE_NUMBERS[safeDay - 10]}`;
        if (safeDay === 20) dayName = '二十'; // Or '廿'? '二十' is fine.
    } else if (safeDay === 20) {
        dayName = '二十';
    } else if (safeDay < 30) {
        dayName = `廿${CHINESE_NUMBERS[safeDay - 20]}`;
    } else {
        dayName = '三十';
    }

    // Special: Jieqi (Solar Terms) - Approximate mapping
    // 24 terms / 12 months = 2 per month
    // Day 1: Term A, Day 15: Term B
    // 24 terms / 12 months = 2 per month
    // Day 1: Term A, Day 15: Term B
    // Rotate terms to match "Zhengyue" (Tiger Month / Spring)
    // Lunar Month 1 is roughly Feb -> LiChun. Matches index 0.

    // Allow user to see date + term
    return `${yearName} ${monthName} ${dayName}`;
}

export function getSeason(month: number): string {
    const seasons = ['春', '夏', '秋', '冬'];
    return seasons[Math.floor((month % 12) / 3)];
}
