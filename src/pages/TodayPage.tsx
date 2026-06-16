import { useNavigate } from 'react-router-dom';
import { Heart, BookOpen, MessageCircle, Calendar, Dumbbell, PenLine } from 'lucide-react';

export default function TodayPage() {
  const navigate = useNavigate();

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
          <span className="text-xs text-gray-400">今日未记录</span>
        </div>
        <button
          onClick={() => navigate('/diary')}
          className="w-full bg-mist text-white rounded-xl py-3.5 font-medium hover:bg-mist/90 transition-colors"
        >
          <span className="flex items-center justify-center gap-2">
            <PenLine className="w-4 h-4" />
            记录今日情绪
          </span>
        </button>
      </div>

      {/* Recommended Practice */}
      <div className="bg-white rounded-2xl border border-warm-gray p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-5 h-5 text-mint" />
          <span className="font-medium text-gray-800">今日推荐练习</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          基于你近期的情绪数据，推荐尝试「腹式呼吸」来缓解压力。
        </p>
        <button
          onClick={() => navigate('/toolbox')}
          className="text-mist text-sm font-medium hover:underline"
        >
          去练习 →
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => navigate('/assessment')}
          className="bg-white rounded-2xl border border-warm-gray p-4 text-left hover:border-mist/30 transition-colors"
        >
          <BookOpen className="w-5 h-5 text-mood-anxious mb-2" />
          <p className="text-sm font-medium text-gray-800">心理测评</p>
          <p className="text-xs text-gray-400 mt-1">PHQ-9 / GAD-7</p>
        </button>
        <button
          onClick={() => navigate('/chat')}
          className="bg-white rounded-2xl border border-warm-gray p-4 text-left hover:border-mist/30 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-mood-sad mb-2" />
          <p className="text-sm font-medium text-gray-800">AI 对话</p>
          <p className="text-xs text-gray-400 mt-1">情绪急救与认知重构</p>
        </button>
        <button
          onClick={() => navigate('/diary')}
          className="bg-white rounded-2xl border border-warm-gray p-4 text-left hover:border-mist/30 transition-colors"
        >
          <Calendar className="w-5 h-5 text-mood-calm mb-2" />
          <p className="text-sm font-medium text-gray-800">情绪日记</p>
          <p className="text-xs text-gray-400 mt-1">查看历史记录</p>
        </button>
        <button
          onClick={() => navigate('/toolbox')}
          className="bg-white rounded-2xl border border-warm-gray p-4 text-left hover:border-mist/30 transition-colors"
        >
          <Dumbbell className="w-5 h-5 text-mood-happy mb-2" />
          <p className="text-sm font-medium text-gray-800">练习工具箱</p>
          <p className="text-xs text-gray-400 mt-1">呼吸 · 放松 · 正念</p>
        </button>
      </div>

      {/* Mini Trend Chart Placeholder */}
      <div className="bg-white rounded-2xl border border-warm-gray p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="font-medium text-gray-800">近7天情绪趋势</span>
          <span className="text-xs text-gray-400">需要更多数据</span>
        </div>
        <div className="h-32 flex items-center justify-center bg-warm-white rounded-xl">
          <p className="text-sm text-gray-400">开始记录情绪后，这里会显示趋势图</p>
        </div>
      </div>

      {/* Streak */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-400">
          连续记录 <span className="text-mist font-semibold">0</span> 天
        </p>
      </div>
    </div>
  );
}
