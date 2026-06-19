import { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import type { EmotionEntry } from '../../stores/emotionStore';
import { aggregateByDay, getEmotionDistribution } from '../../core/emotion/analyzer';

interface Props {
  entries: EmotionEntry[];
}

type Period = '7d' | '30d' | '90d';

export default function TrendChart({ entries }: Props) {
  const [period, setPeriod] = useState<Period>('7d');

  const filtered = useMemo(() => {
    const now = Date.now();
    const ms = period === '7d' ? 7 * 86400000 : period === '30d' ? 30 * 86400000 : 90 * 86400000;
    return entries.filter(e => e.timestamp >= now - ms);
  }, [entries, period]);

  const dailyData = useMemo(() => {
    const data = aggregateByDay(filtered);
    // 填充缺失日期，补 null
    if (data.length < 2) return data.map(d => ({ ...d, displayDate: d.date.slice(5) }));
    const filled = [];
    const start = new Date(data[0].date + 'T00:00:00');
    const end = new Date(data[data.length - 1].date + 'T00:00:00');
    const dataMap = new Map(data.map(d => [d.date, d]));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const existing = dataMap.get(key);
      filled.push(existing
        ? { ...existing, displayDate: key.slice(5) }
        : { date: key, displayDate: key.slice(5), averageMood: null as unknown as number, dominantEmotion: null, entryCount: 0 }
      );
    }
    return filled;
  }, [filtered]);

  const emotionDist = useMemo(() => getEmotionDistribution(filtered), [filtered]);
  const emotionLabels: Record<string, string> = {
    happy: '开心', calm: '平静', anxious: '焦虑', sad: '悲伤',
    angry: '愤怒', tired: '疲惫', excited: '兴奋', grateful: '感恩',
  };
  const distData = Object.entries(emotionDist).map(([type, count]) => ({
    name: emotionLabels[type] || type,
    count,
    type,
  }));

  const avgMood = filtered.length > 0
    ? (filtered.reduce((s, e) => s + e.overallMood, 0) / filtered.length).toFixed(1)
    : '-';
  const avgEnergy = filtered.length > 0
    ? (filtered.reduce((s, e) => s + e.energyLevel, 0) / filtered.length).toFixed(1)
    : '-';

  const EMOTION_BAR_COLORS: Record<string, string> = {
    happy: '#f4d03f', calm: '#98d8c8', anxious: '#f0b27a', sad: '#85c1e9',
    angry: '#ec7063', tired: '#a0a0a0', excited: '#fb923c', grateful: '#fcd34d',
  };

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex gap-2">
        {([['7d', '近7天'], ['30d', '近30天'], ['90d', '近90天']] as [Period, string][]).map(([p, label]) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === p ? 'bg-mist text-white' : 'bg-warm-white text-gray-500 hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-warm-gray p-3 text-center">
          <p className="text-xs text-gray-400">平均心情</p>
          <p className="text-xl font-bold text-mist">{avgMood}<span className="text-sm text-gray-400 font-normal">/10</span></p>
        </div>
        <div className="bg-white rounded-xl border border-warm-gray p-3 text-center">
          <p className="text-xs text-gray-400">平均精力</p>
          <p className="text-xl font-bold text-mint">{avgEnergy}<span className="text-sm text-gray-400 font-normal">/10</span></p>
        </div>
      </div>

      {/* Mood trend chart */}
      {dailyData.length > 0 && (
        <div className="bg-white rounded-2xl border border-warm-gray p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">心情趋势</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7ba7bc" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7ba7bc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
              <Tooltip
                formatter={(value: unknown) => [value !== null ? `${value as number}/10` : '无记录', '心情']}
                labelFormatter={(label) => `${label}`}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area
                type="monotone"
                dataKey="averageMood"
                stroke="#7ba7bc"
                strokeWidth={2}
                fill="url(#moodGradient)"
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Emotion distribution */}
      {distData.length > 0 && (
        <div className="bg-white rounded-2xl border border-warm-gray p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">情绪分布</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={distData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={50} />
              <Tooltip
                formatter={(value: unknown) => [`${value as number}次`, '记录']}
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {distData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EMOTION_BAR_COLORS[entry.type] || '#7ba7bc'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
