import type { EmotionEntry, BaseEmotion } from '../../stores/emotionStore';

export interface DailyMood {
  date: string; // YYYY-MM-DD
  averageMood: number;
  dominantEmotion: BaseEmotion | null;
  entryCount: number;
}

export interface EmotionPattern {
  type: 'weekly' | 'contextual';
  description: string;
  confidence: number;
}

export interface TriggerFactor {
  factor: string;
  category: 'location' | 'activity' | 'people' | 'symptom';
  correlation: number; // -1 to 1
  occurrence: number;
  avgMoodWhenPresent: number;
  avgMoodWhenAbsent: number;
}

/**
 * 按日期聚合情绪数据
 */
export function aggregateByDay(entries: EmotionEntry[]): DailyMood[] {
  const map = new Map<string, EmotionEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(entry);
  }

  const result: DailyMood[] = [];
  for (const [date, dayEntries] of map) {
    const avgMood = dayEntries.reduce((s, e) => s + e.overallMood, 0) / dayEntries.length;
    // 主导情绪：出现频率最高的
    const emotionCounts = new Map<BaseEmotion, number>();
    for (const e of dayEntries) {
      for (const emo of e.emotions) {
        emotionCounts.set(emo.type, (emotionCounts.get(emo.type) || 0) + 1);
      }
    }
    let dominant: BaseEmotion | null = null;
    let maxCount = 0;
    for (const [type, count] of emotionCounts) {
      if (count > maxCount) {
        maxCount = count;
        dominant = type;
      }
    }
    result.push({ date, averageMood: Math.round(avgMood * 10) / 10, dominantEmotion: dominant, entryCount: dayEntries.length });
  }
  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 计算连续记录天数（streak）
 * 从今天往前数，每一天都有记录则 +1
 */
export function calculateStreak(entries: EmotionEntry[]): number {
  if (entries.length === 0) return 0;

  const dates = new Set<string>();
  for (const entry of entries) {
    const d = new Date(entry.timestamp);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    dates.add(key);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  let streak = 0;
  let checkDate = new Date(today);

  // 如果今天没记录，从昨天开始算
  if (!dates.has(todayKey)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (dates.has(key)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

/**
 * 识别情绪模式
 */
export function detectPatterns(entries: EmotionEntry[]): EmotionPattern[] {
  const patterns: EmotionPattern[] = [];
  if (entries.length < 7) return patterns;

  const daily = aggregateByDay(entries);

  // 周模式：检查周几的情绪差异
  const dayOfWeekMood: number[][] = Array.from({ length: 7 }, () => []);
  for (const d of daily) {
    const date = new Date(d.date + 'T00:00:00');
    const dow = date.getDay();
    dayOfWeekMood[dow].push(d.averageMood);
  }

  const dowAvg = dayOfWeekMood.map(moods =>
    moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : null
  );

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  let lowestDay = -1;
  let lowestMood = 11;
  let highestDay = -1;
  let highestMood = -1;

  for (let i = 0; i < 7; i++) {
    if (dowAvg[i] !== null) {
      if (dowAvg[i]! < lowestMood) { lowestMood = dowAvg[i]!; lowestDay = i; }
      if (dowAvg[i]! > highestMood) { highestMood = dowAvg[i]!; highestDay = i; }
    }
  }

  if (lowestDay !== -1 && dayOfWeekMood[lowestDay].length >= 2) {
    patterns.push({
      type: 'weekly',
      description: `${dayNames[lowestDay]}的平均心情最低（${lowestMood.toFixed(1)}/10）`,
      confidence: Math.min(dayOfWeekMood[lowestDay].length * 0.15, 0.8),
    });
  }
  if (highestDay !== -1 && highestDay !== lowestDay && dayOfWeekMood[highestDay].length >= 2) {
    patterns.push({
      type: 'weekly',
      description: `${dayNames[highestDay]}的平均心情最高（${highestMood.toFixed(1)}/10）`,
      confidence: Math.min(dayOfWeekMood[highestDay].length * 0.15, 0.8),
    });
  }

  return patterns;
}

/**
 * 识别触发因子
 * 统计与低心情（<=4）相关的情境因素
 */
export function identifyTriggers(entries: EmotionEntry[]): TriggerFactor[] {
  const triggers: TriggerFactor[] = [];
  if (entries.length < 3) return triggers;

  const lowMoodEntries = entries.filter(e => e.overallMood <= 4);
  if (lowMoodEntries.length < 2) return triggers;

  // 地点
  const locationStats = new Map<string, { present: number; presentMood: number; absentMood: number; absent: number }>();
  for (const entry of entries) {
    const loc = entry.context?.location?.trim();
    if (!loc) continue;
    if (!locationStats.has(loc)) locationStats.set(loc, { present: 0, presentMood: 0, absentMood: 0, absent: 0 });
  }
  for (const entry of entries) {
    for (const [loc, stat] of locationStats) {
      if (entry.context?.location?.trim() === loc) {
        stat.present++;
        stat.presentMood += entry.overallMood;
      } else {
        stat.absent++;
        stat.absentMood += entry.overallMood;
      }
    }
  }
  for (const [loc, stat] of locationStats) {
    if (stat.present >= 2) {
      const avgPresent = stat.presentMood / stat.present;
      const avgAbsent = stat.absent > 0 ? stat.absentMood / stat.absent : 5;
      triggers.push({
        factor: loc,
        category: 'location',
        correlation: Math.round(((avgAbsent - avgPresent) / 10) * 100) / 100,
        occurrence: stat.present,
        avgMoodWhenPresent: Math.round(avgPresent * 10) / 10,
        avgMoodWhenAbsent: Math.round(avgAbsent * 10) / 10,
      });
    }
  }

  // 活动
  const activityStats = new Map<string, { present: number; presentMood: number; absentMood: number; absent: number }>();
  for (const entry of entries) {
    const act = entry.context?.activity?.trim();
    if (!act) continue;
    if (!activityStats.has(act)) activityStats.set(act, { present: 0, presentMood: 0, absentMood: 0, absent: 0 });
  }
  for (const entry of entries) {
    for (const [act, stat] of activityStats) {
      if (entry.context?.activity?.trim() === act) {
        stat.present++;
        stat.presentMood += entry.overallMood;
      } else {
        stat.absent++;
        stat.absentMood += entry.overallMood;
      }
    }
  }
  for (const [act, stat] of activityStats) {
    if (stat.present >= 2) {
      const avgPresent = stat.presentMood / stat.present;
      const avgAbsent = stat.absent > 0 ? stat.absentMood / stat.absent : 5;
      triggers.push({
        factor: act,
        category: 'activity',
        correlation: Math.round(((avgAbsent - avgPresent) / 10) * 100) / 100,
        occurrence: stat.present,
        avgMoodWhenPresent: Math.round(avgPresent * 10) / 10,
        avgMoodWhenAbsent: Math.round(avgAbsent * 10) / 10,
      });
    }
  }

  // 按相关性排序，取 top
  triggers.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  return triggers.slice(0, 6);
}

/**
 * 获取情绪分布统计
 */
export function getEmotionDistribution(entries: EmotionEntry[]): Record<BaseEmotion, number> {
  const dist: Partial<Record<BaseEmotion, number>> = {};
  for (const entry of entries) {
    for (const emo of entry.emotions) {
      dist[emo.type] = (dist[emo.type] || 0) + 1;
    }
  }
  return dist as Record<BaseEmotion, number>;
}
