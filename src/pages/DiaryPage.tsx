import { useState } from 'react';
import { Calendar, ChevronLeft, Plus, Trash2, Edit3 } from 'lucide-react';

export default function DiaryPage() {
  const [view, setView] = useState<'calendar' | 'list'>('list');

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">情绪日记</h1>
          <p className="text-sm text-gray-500 mt-1">记录每一次情绪起伏</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('calendar')}
            className={`p-2 rounded-lg ${view === 'calendar' ? 'bg-mist/15 text-mist' : 'text-gray-400'}`}
          >
            <Calendar className="w-5 h-5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`p-2 rounded-lg ${view === 'list' ? 'bg-mist/15 text-mist' : 'text-gray-400'}`}
          >
            <ChevronLeft className="w-5 h-5 rotate-90" />
          </button>
        </div>
      </header>

      {/* Add New Entry */}
      <button className="w-full bg-mist text-white rounded-xl py-3.5 font-medium hover:bg-mist/90 transition-colors mb-6 flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        新增记录
      </button>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-warm-gray p-8 text-center">
        <div className="w-16 h-16 bg-warm-white rounded-full flex items-center justify-center mx-auto mb-4">
          <Edit3 className="w-7 h-7 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">还没有记录</h3>
        <p className="text-sm text-gray-400 mb-4">
          开始记录你的情绪，观察内心的变化
        </p>
        <p className="text-xs text-gray-300">
          支持：情绪评分 · 身体感受 · 自动化思维 · CBT五栏表
        </p>
      </div>

      {/* Sample Entry (for demo structure) */}
      <div className="mt-4 bg-white rounded-2xl border border-warm-gray p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-gray-800">2026年6月16日</p>
            <p className="text-xs text-gray-400">15:30 · 工作中</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-2xl">😊</span>
            <span className="text-sm font-medium text-mood-happy">7/10</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2.5 py-1 bg-mood-calm/15 text-mood-calm text-xs rounded-full">平静</span>
          <span className="px-2.5 py-1 bg-mood-happy/15 text-mood-happy text-xs rounded-full">开心</span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          今天完成了一个重要的项目里程碑，虽然过程有点紧张，但最终结果不错。团队的合作让我感到很温暖。
        </p>
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-warm-gray">
          <button className="text-xs text-gray-400 hover:text-mist flex items-center gap-1">
            <Edit3 className="w-3 h-3" /> 编辑
          </button>
          <button className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1">
            <Trash2 className="w-3 h-3" /> 删除
          </button>
        </div>
      </div>
    </div>
  );
}
