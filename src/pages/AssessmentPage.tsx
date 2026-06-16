import { useState } from 'react';
import { ClipboardList, Clock, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ScaleCard {
  id: string;
  name: string;
  fullName: string;
  description: string;
  questionCount: number;
  duration: string;
  status: 'available' | 'completed' | 'in_progress';
  lastScore?: number;
}

const scales: ScaleCard[] = [
  {
    id: 'phq-9',
    name: 'PHQ-9',
    fullName: '抑郁筛查量表',
    description: '评估过去两周的抑郁症状严重程度',
    questionCount: 9,
    duration: '2-3 分钟',
    status: 'available',
  },
  {
    id: 'gad-7',
    name: 'GAD-7',
    fullName: '焦虑筛查量表',
    description: '评估过去两周的焦虑症状严重程度',
    questionCount: 7,
    duration: '2-3 分钟',
    status: 'available',
  },
];

export default function AssessmentPage() {
  const [activeTab, setActiveTab] = useState<'scales' | 'history'>('scales');

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">测评中心</h1>
        <p className="text-sm text-gray-500 mt-1">标准化心理量表，科学了解内心</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-warm-gray/50 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('scales')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'scales'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          量表
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-white text-gray-800 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          历史记录
        </button>
      </div>

      {/* Disclaimer */}
      <div className="bg-mood-anxious/10 rounded-xl p-4 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-mood-anxious shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">重要提示</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            以下量表结果仅供参考，不构成医学诊断。如有严重困扰，请寻求专业心理咨询或精神科医生的帮助。
          </p>
        </div>
      </div>

      {activeTab === 'scales' && (
        <div className="space-y-3">
          {scales.map((scale) => (
            <div
              key={scale.id}
              className="bg-white rounded-2xl border border-warm-gray p-5 hover:border-mist/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-mist" />
                    <h3 className="font-semibold text-gray-800">{scale.name}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{scale.fullName}</p>
                </div>
                <button className="p-2 bg-mist/10 rounded-lg text-mist hover:bg-mist/20 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">{scale.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {scale.questionCount} 题
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {scale.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-warm-gray p-8 text-center">
          <div className="w-16 h-16 bg-warm-white rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">暂无测评记录</h3>
          <p className="text-sm text-gray-400">完成量表后，这里会显示历史结果和变化趋势</p>
        </div>
      )}
    </div>
  );
}
