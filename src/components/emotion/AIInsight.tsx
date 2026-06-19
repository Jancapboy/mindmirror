import { useMemo } from 'react';
import { Brain, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import type { EmotionEntry } from '../../stores/emotionStore';
import { aggregateByDay, detectPatterns, identifyTriggers, calculateStreak } from '../../core/emotion/analyzer';

interface Props {
  entries: EmotionEntry[];
}

export default function AIInsight({ entries }: Props) {
  const insights = useMemo(() => {
    if (entries.length === 0) return [];

    const daily = aggregateByDay(entries);
    const patterns = detectPatterns(entries);
    const triggers = identifyTriggers(entries);
    const streak = calculateStreak(entries);

    const results: Array<{ icon: React.ReactNode; title: string; content: string; type: 'info' | 'warning' | 'positive' }> = [];

    // Streak
    if (streak >= 3) {
      results.push({
        icon: <Sparkles className="w-4 h-4" />,
        title: '连续记录',
        content: `已连续记录 ${streak} 天，保持这个习惯有助于更好地了解自己的情绪模式。`,
        type: 'positive',
      });
    } else if (entries.length > 0 && streak === 0) {
      results.push({
        icon: <AlertCircle className="w-4 h-4" />,
        title: '记录中断',
        content: '你昨天没有记录情绪。每天记录哪怕一小条，长期积累的数据会很有价值。',
        type: 'warning',
      });
    }

    // Recent trend
    if (daily.length >= 3) {
      const recent = daily.slice(-3);
      const avgRecent = recent.reduce((s, d) => s + d.averageMood, 0) / recent.length;
      const prev = daily.slice(-6, -3);
      if (prev.length >= 2) {
        const avgPrev = prev.reduce((s, d) => s + d.averageMood, 0) / prev.length;
        const change = avgRecent - avgPrev;
        if (change >= 1) {
          results.push({
            icon: <TrendingUp className="w-4 h-4" />,
            title: '心情回升',
            content: `最近几天的心情比上周平均提升了 ${change.toFixed(1)} 分，不错的趋势。`,
            type: 'positive',
          });
        } else if (change <= -1) {
          results.push({
            icon: <TrendingUp className="w-4 h-4" />,
            title: '心情波动',
            content: `最近几天的心情比上周平均下降了 ${Math.abs(change).toFixed(1)} 分，留意一下发生了什么变化。`,
            type: 'warning',
          });
        }
      }
    }

    // Patterns
    for (const p of patterns) {
      results.push({
        icon: <Brain className="w-4 h-4" />,
        title: '模式识别',
        content: p.description,
        type: 'info',
      });
    }

    // Triggers
    const topTrigger = triggers.find(t => t.correlation > 0.3);
    if (topTrigger) {
      results.push({
        icon: <AlertCircle className="w-4 h-4" />,
        title: '触发因子',
        content: `「${topTrigger.factor}」出现时，你的平均心情为 ${topTrigger.avgMoodWhenPresent} 分，比平时低。留意这个因素。`,
        type: 'warning',
      });
    }

    // Low mood days
    const lowMoodDays = daily.filter(d => d.averageMood <= 4);
    if (lowMoodDays.length >= 2) {
      const consecutive = (() => {
        let max = 0;
        let current = 0;
        for (const d of daily) {
          if (d.averageMood <= 4) { current++; max = Math.max(max, current); }
          else { current = 0; }
        }
        return max;
      })();
      if (consecutive >= 2) {
        results.push({
          icon: <AlertCircle className="w-4 h-4" />,
          title: '持续低落',
          content: `连续 ${consecutive} 天心情较低，建议关注自己的状态，必要时可以寻求专业帮助。`,
          type: 'warning',
        });
      }
    }

    return results.slice(0, 5);
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-warm-gray p-6 text-center">
        <Brain className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">记录情绪后，这里会生成智能洞察</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight, idx) => {
        const colorClass = insight.type === 'positive'
          ? 'bg-green-50 border-green-100 text-green-700'
          : insight.type === 'warning'
          ? 'bg-amber-50 border-amber-100 text-amber-700'
          : 'bg-mist/5 border-mist/10 text-gray-700';
        const iconColor = insight.type === 'positive'
          ? 'text-green-500'
          : insight.type === 'warning'
          ? 'text-amber-500'
          : 'text-mist';

        return (
          <div key={idx} className={`rounded-xl border p-4 ${colorClass}`}>
            <div className="flex items-start gap-3">
              <span className={`mt-0.5 ${iconColor}`}>{insight.icon}</span>
              <div>
                <p className="text-sm font-medium mb-1">{insight.title}</p>
                <p className="text-sm opacity-80 leading-relaxed">{insight.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
