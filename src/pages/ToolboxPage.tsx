import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Wind, Brain, Heart, Sparkles, Filter, ChevronRight } from 'lucide-react';

type FilterCategory = 'all' | 'relaxation' | 'cognitive' | 'mindfulness' | 'behavior';

interface TechniqueCard {
  id: string;
  title: string;
  description: string;
  category: FilterCategory;
  duration: string;
  icon: typeof Wind;
  color: string;
  bgColor: string;
}

const techniques: TechniqueCard[] = [
  {
    id: 'diaphragmatic-breathing',
    title: '腹式呼吸',
    description: '通过激活副交感神经快速降低生理唤醒',
    category: 'relaxation',
    duration: '3-5 分钟',
    icon: Wind,
    color: 'text-mood-calm',
    bgColor: 'bg-mood-calm/15',
  },
  {
    id: 'progressive-muscle-relaxation',
    title: '渐进式肌肉放松',
    description: '系统性地紧张再放松全身肌群',
    category: 'relaxation',
    duration: '15-20 分钟',
    icon: Dumbbell,
    color: 'text-mist',
    bgColor: 'bg-mist/15',
  },
  {
    id: 'thought-record',
    title: '思维记录表',
    description: 'CBT 经典五栏技术，识别和修正认知扭曲',
    category: 'cognitive',
    duration: '10-15 分钟',
    icon: Brain,
    color: 'text-mood-sad',
    bgColor: 'bg-mood-sad/15',
  },
  {
    id: 'stop-technique',
    title: 'STOP 技术',
    description: 'DBT 痛苦耐受，在冲动前按下暂停键',
    category: 'mindfulness',
    duration: '1-2 分钟',
    icon: Sparkles,
    color: 'text-mood-happy',
    bgColor: 'bg-mood-happy/15',
  },
  {
    id: 'grounding-54321',
    title: '5-4-3-2-1 接地',
    description: '通过五感将注意力拉回当下现实',
    category: 'mindfulness',
    duration: '2-3 分钟',
    icon: Heart,
    color: 'text-mood-anxious',
    bgColor: 'bg-mood-anxious/15',
  },
  {
    id: 'gratitude-practice',
    title: '三件好事练习',
    description: '每日记录三件好事，提升幸福感',
    category: 'behavior',
    duration: '5 分钟/日',
    icon: Heart,
    color: 'text-mood-grateful',
    bgColor: 'bg-mood-grateful/15',
  },
];

const filters: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'relaxation', label: '放松' },
  { key: 'cognitive', label: '认知' },
  { key: 'mindfulness', label: '正念' },
  { key: 'behavior', label: '行为' },
];

export default function ToolboxPage() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const navigate = useNavigate();

  const filtered = activeFilter === 'all'
    ? techniques
    : techniques.filter((t) => t.category === activeFilter);

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">练习工具箱</h1>
        <p className="text-sm text-gray-500 mt-1">循证心理学技术，随时可用</p>
      </header>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeFilter === f.key
                ? 'bg-mist text-white'
                : 'bg-warm-gray/50 text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Technique Cards */}
      <div className="space-y-3">
        {filtered.map((tech) => (
          <div
            key={tech.id}
            className="bg-white rounded-2xl border border-warm-gray p-5 hover:border-mist/30 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 ${tech.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
                  <tech.icon className={`w-5 h-5 ${tech.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{tech.title}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{tech.description}</p>
                  <p className="text-xs text-gray-400 mt-2">⏱ {tech.duration}</p>
                </div>
              </div>
              <button className="p-2 bg-mist/10 rounded-lg text-mist hover:bg-mist/20 transition-colors shrink-0">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* More coming */}
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">
          共 {filtered.length} 项技术 · 更多内容持续更新
        </p>
      </div>
    </div>
  );
}
