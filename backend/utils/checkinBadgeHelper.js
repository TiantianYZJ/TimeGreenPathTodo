// backend/utils/checkinBadgeHelper.js
const { query } = require('../config/database');

const TITLE_TABLE = {
  1: { title: '初来乍到', color: '#00b26a' },
  3: { title: '渐入佳境', color: '#00b26a' },
  7: { title: '坚持不懈', color: '#f59e0b' },
  15: { title: '热情如火', color: '#f59e0b' },
  30: { title: '持之以恒', color: '#f97316' },
  60: { title: '绿径守护者', color: '#f97316' },
  100: { title: '时光旅人', color: '#ec4899' },
  365: { title: '传奇永恒', color: '#8b5cf6' },
};

function getTitleByStreak(days) {
  const thresholds = Object.keys(TITLE_TABLE).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (days >= t) return TITLE_TABLE[t].title;
  }
  return '';
}

function getTitleColor(days) {
  const thresholds = Object.keys(TITLE_TABLE).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) {
    if (days >= t) return TITLE_TABLE[t].color;
  }
  return '#00b26a';
}

/**
 * 计算连签天数 — 索引覆盖扫描，断签即 break
 */
function toBeijingDateStr(d) {
  return typeof d === 'string' ? d : d.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
}

async function calcStreakDays(userId) {
  const rows = await query(
    'SELECT check_in_date FROM check_ins WHERE user_id = ? ORDER BY check_in_date DESC',
    [userId]
  );
  let streak = 0;
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
  for (let i = 0; i < rows.length; i++) {
    const dateStr = toBeijingDateStr(rows[i].check_in_date);
    const expectedDate = new Date(todayStr + 'T00:00:00+08:00');
    expectedDate.setDate(expectedDate.getDate() - streak);
    const expectedStr = expectedDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Shanghai' });
    if (dateStr === expectedStr) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * 获取已注册天数（最小 1 天）
 */
async function calcRegisteredDays(userId) {
  const rows = await query(
    'SELECT DATEDIFF(NOW(), created_at) as days FROM users WHERE id = ?',
    [userId]
  );
  return rows.length > 0 ? Math.max(1, rows[0].days) : 1;
}

/**
 * 请求级缓存
 */
const streakCache = new Map();

/**
 * 拼接签到 badge 与自定义 badge（缓存版本，接受 userId）
 */
async function appendCheckinBadges(userId, customTitles, customColors) {
  if (!streakCache.has(userId)) {
    const [streak, registered] = await Promise.all([
      calcStreakDays(userId),
      calcRegisteredDays(userId),
    ]);
    streakCache.set(userId, { streak, registered });
  }
  const { streak, registered } = streakCache.get(userId);

  const MAX_BADGES = 6;
  const safeTitles = Array.isArray(customTitles) ? customTitles : [];
  const safeColors = Array.isArray(customColors) ? customColors : [];
  const maxCustom = MAX_BADGES - 3;
  const trimmedTitles = safeTitles.slice(0, maxCustom);
  const trimmedColors = safeColors.slice(0, maxCustom);

  const checkinBadges = [];
  const checkinColors = [];
  if (streak >= 1) {
    checkinBadges.push(getTitleByStreak(streak));
    checkinColors.push(getTitleColor(streak));
    checkinBadges.push(`连签${streak}天`);
    checkinColors.push('#00b26a');
  }

  checkinBadges.push(`已注册${registered}天`);
  checkinColors.push('#999999');

  return {
    badgeTitles: [...trimmedTitles, ...checkinBadges],
    badgeColors: [...trimmedColors, ...checkinColors],
  };
}

function clearStreakCache() {
  streakCache.clear();
}

module.exports = {
  appendCheckinBadges,
  calcStreakDays,
  calcRegisteredDays,
  getTitleByStreak,
  getTitleColor,
  clearStreakCache,
  TITLE_TABLE,
};
