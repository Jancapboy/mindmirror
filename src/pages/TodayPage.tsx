import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, BookOpen, MessageCircle, Dumbbell,
  PenLine, TrendingUp, ClipboardList, Sparkles,
  Wind, Brain, Flame,
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEmotionStore } from '../stores/emotionStore';
import { useAssessmentStore } from '../stores/assessmentStore';
import { calculateStreak, aggregateByDay } from '../core/emotion/analyzer';

export default function TodayPage() {
  const navigate = useNavigate();
  const { entries, hasTodayEntry, loadEntries } = useEmotionStore();
  const { records, loadRecords } = useAssessmentStore();

  useEffect(() => {
    loadEntries(30);
    loadRecords();
  }, [loadEntries, loadRecords]);

  const latestEntry = entries[0] || null;
  const recentMood = latestEntry ? latestEntry.overallMood : null;
  const moodColor = recentMood === null ? 'text-gray-400' : recentMood >= 7 ? 'text-mood-happy' : recentMood >= 5 ? 'text-mood-calm' : recentMood >= 3 ? 'text-mood-anxious' : 'text-mood-sad';

  const streak = useMemo(() => calculateStreak(entries), [entries]);
  const dailyData = useMemo(() => {
    const data = aggregateByDay(entries);
    return data.slice(-7).map(d => ({ ...d, displayDate: d.date.slice(5) }));
  }, [entries]);

  const latestPhq9 = records.find(r => r.scaleId === 'phq-9');
  const latestGad7 = records.find(r => r.scaleId === 'gad-7');

  // Simple recommendation logic
  const getRecommendation = () => {
    if (recentMood !== null && recentMood <= 4) {
      return { title: '情绪调节', desc: '你最近情绪偏低，试试「STOP技术」快速平复', icon: Brain, color: 'text-mist', path: '/toolbox' };
    }
    if (recentMood !== null && recentMood >= 8) {
      return { title: '巩固积极', desc: '状态不错，记录下来这个美好时刻吧', icon: PenLine, color: 'text-mood-happy', path: '/diary' };
    }
    return { title: '腹式呼吸', desc: '每天3分钟，激活副交感神经', icon: Wind, color: 'text-mint', path: '/toolbox' };
  };

  const rec = getRecommendation();

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">今天过得怎么样？</h1>
        <p className="text-sm text-gray-500 mt-1">记录情绪，理解自己</p>
      </header>

      {/* Quick Mood Entry */}
      <div className="bg-mist/15 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-mist" />
            <span className="font-medium text-gray-800">快速记录</span>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                <Flame className="w-3 h-3" /> {streak} 天
              </span>
            )}
            <span className={`text-sm font-medium ${moodColor}`}>
              {hasTodayEntry ? '今日已记录' : '今日未记录'}
            </span>
          </div>
        </div>

        {hasTodayEntry && latestEntry ? (
          <div className="bg-white/60 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">今日心情</p>
                <p className={`text-2xl font-bold ${moodColor}`}>{latestEntry.overallMood}/10</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">{latestEntry.emotions.map(e => {
                  const map: Record<string, string> = { happy: '😊', calm: '😌', anxious: '😰', sad: '😢', angry: '😠', tired: '😴', excited: '🤩', grateful: '🙏' };
                  return map[e.type] || '•';
                }).join(' ')}</p>
              </div>
            </div>
          </div>
        ) : null}

        <button
          onClick={() => navigate('/diary')}
          className="w-full bg-mist text-white rounded-xl py-3.5 font-medium hover:bg-mist/90 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <PenLine className="w-4 h-4" />
            {hasTodayEntry ? '查看今日记录' : '记录今日情绪'}
          </span>
        </button>
      </div>

      {/* Recommended Practice */}
      <div className="bg-white rounded-2xl border border-warm-gray p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className={`w-5 h-5 ${rec.color}`} />
          <span className="font-medium text-gray-800">今日推荐练习</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">{rec.desc}</p>
        <button
          onClick={() => navigate(rec.path)}
          className="text-mist text-sm font-medium hover:underline"
        >
          去练习 →
        </button>
      </div>

      {/* Recent Assessment */}
      {(latestPhq9 || latestGad7) && (
        <div className="bg-white rounded-2xl border border-warm-gray p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList className="w-5 h-5 text-mint" />
            <span className="font-medium text-gray-800">最近测评</span>
          </div>
          <div className="space-y-2">
            {latestPhq9 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">PHQ-9 抑郁筛查</span>
                <span className={`font-medium ${
                  latestPhq9.severity === 'severe' ? 'text-red-500' :
                  latestPhq9.severity === 'moderate' ? 'text-yellow-600' :
                  latestPhq9.severity === 'mild' ? 'text-orange-500' : 'text-green-600'
                }`}>
                  {latestPhq9.severityLabel} · {latestPhq9.totalScore}分
                </span>
              </div>
            )}
            {latestGad7 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">GAD-7 焦虑筛查</span>
                <span className={`font-medium ${
                  latestGad7.severity === 'severe' ? 'text-red-500' :
                  latestGad7.severity === 'moderate' ? 'text-yellow-600' :
                  latestGad7.severity === 'mild' ? 'text-orange-500' : 'text-green-600'
                }`}>
                  {latestGad7.severityLabel} · {latestGad7.totalScore}分
                </span>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/assessment')}
            className="text-mist text-sm font-medium hover:underline mt-3 block"
          >
            重新测评 →
          </button>
        </div>
      )}

      {/* Weekly Trend Chart (Recharts) */}
      {dailyData.length > 1 && (
        <div className="bg-white rounded-2xl border border-warm-gray p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-mist" />
              <span className="font-medium text-gray-800">近7天情绪</span>
            </div>
            <button
              onClick={() => navigate('/diary', { state: { view: 'stats' } })}
              className="text-xs text-mist hover:underline"
            >
              查看详细统计 →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="miniMoodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7ba7bc" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7ba7bc" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: unknown) => [`${value as number}/10`, '心情']}
                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="averageMood"
                stroke="#7ba7bc"
                strokeWidth={2}
                fill="url(#miniMoodGradient)"
                dot={{ r: 3, fill: '#7ba7bc' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* AI Insight Preview */}
      {entries.length >= 3 && (
        <div className="bg-white rounded-2xl border border-warm-gray p-5 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-mood-happy" />
            <span className="font-medium text-gray-800">智能洞察</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">基于你的 {entries.length} 条记录，我们分析出了一些情绪模式。</p>
          <button
            onClick={() => navigate('/diary', { state: { view: 'stats' } })}
            className="text-mist text-sm font-medium hover:underline"
          >
            查看完整洞察 →
          </button>
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => navigate('/diary')}
          className="bg-white rounded-2xl border border-warm-gray p-4 text-left hover:border-mist/30 transition-colors"
        >
          <BookOpen className="w-5 h-5 text-mist mb-2" />
          <p className="text-sm font-medium text-gray-800">写情绪日记</p>
          <p className="text-xs text-gray-400 mt-0.5">记录当下的感受</p>
        </button>
        <button
          onClick={() => navigate('/assessment')}
          className="bg-white rounded-2xl border border-warm-gray p-4 text-left hover:border-mist/30 transition-colors"
        >
          <ClipboardList className="w-5 h-5 text-mint mb-2" />
          <p className="text-sm font-medium text-gray-800">心理测评</p>
          <p className="text-xs text-gray-400 mt-0.5">PHQ-9 / GAD-7</p>
        </button>
        <button
          onClick={() => navigate('/chat')}
          className="bg-white rounded-2xl border border-warm-gray p-4 text-left hover:border-mist/30 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-mood-sad mb-2" />
          <p className="text-sm font-medium text-gray-800">AI 对话</p>
          <p className="text-xs text-gray-400 mt-0.5">聊聊你的困扰</p>
        </button>
        <button
          onClick={() => navigate('/toolbox')}
          className="bg-white rounded-2xl border border-warm-gray p-4 text-left hover:border-mist/30 transition-colors"
        >
          <Sparkles className="w-5 h-5 text-mood-excited mb-2" />
          <p className="text-sm font-medium text-gray-800">练习工具</p>
          <p className="text-xs text-gray-400 mt-0.5">放松与正念</p>
        </button>
      </div>
    </div>
  );
}
