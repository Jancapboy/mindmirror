import { useState, useEffect, useRef } from 'react';
import {
  Dumbbell, Wind, Brain, Heart, Sparkles, Filter, ChevronRight,
  X, Play, Pause, RotateCcw, CheckCircle2,
} from 'lucide-react';

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
  guide?: string;
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
    guide: 'breathe',
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

// ===== Breathing Exercise Component =====
function BreathingExercise({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'rest'>('inhale');
  const [cycleCount, setCycleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const PHASE_DURATION: Record<string, number> = { inhale: 4000, hold: 2000, exhale: 4000, rest: 2000 };

  const runCycle = () => {
    if (!isRunning) return;

    const nextPhase = (p: typeof phase): typeof phase => {
      if (p === 'inhale') return 'hold';
      if (p === 'hold') return 'exhale';
      if (p === 'exhale') return 'rest';
      return 'inhale';
    };

    setPhase(prev => {
      const np = nextPhase(prev);
      if (np === 'inhale') setCycleCount(c => c + 1);
      if (cycleCount >= 10 && np === 'rest') {
        setCompleted(true);
        setIsRunning(false);
        return 'rest';
      }
      timerRef.current = setTimeout(runCycle, PHASE_DURATION[np]);
      return np;
    });
  };

  useEffect(() => {
    if (isRunning && !timerRef.current) {
      timerRef.current = setTimeout(runCycle, PHASE_DURATION.inhale);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning]);

  const start = () => {
    setIsRunning(true);
    setPhase('inhale');
    setCycleCount(0);
    setCompleted(false);
  };

  const pause = () => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const reset = () => {
    pause();
    setPhase('inhale');
    setCycleCount(0);
    setCompleted(false);
  };

  const scale = phase === 'inhale' ? 1.5 : phase === 'hold' ? 1.5 : phase === 'exhale' ? 1 : 1;
  const label = phase === 'inhale' ? '吸气' : phase === 'hold' ? '屏息' : phase === 'exhale' ? '呼气' : '休息';
  const subLabel = phase === 'inhale' ? '用鼻子慢慢吸气，腹部鼓起' : phase === 'hold' ? '保持住' : phase === 'exhale' ? '用嘴巴慢慢呼气，腹部回落' : '准备下一次';

  return (
    <div className="fixed inset-0 bg-warm-white z-50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-warm-gray">
        <h2 className="text-lg font-semibold text-gray-800">腹式呼吸</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {completed ? (
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-mint mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">练习完成</h3>
            <p className="text-sm text-gray-500 mb-6">你完成了 {cycleCount} 轮腹式呼吸</p>
            <button onClick={reset} className="px-6 py-2.5 bg-mist text-white rounded-xl text-sm font-medium">再来一次</button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-3xl font-bold text-gray-800 mb-1">{label}</p>
              <p className="text-sm text-gray-400">{subLabel}</p>
              <p className="text-xs text-gray-300 mt-2">第 {cycleCount + 1} 轮 / 共 10 轮</p>
            </div>

            <div className="relative w-48 h-48 mb-8">
              <div
                className="absolute inset-0 rounded-full bg-mist/20 transition-transform duration-[4000ms] ease-in-out flex items-center justify-center"
                style={{ transform: `scale(${scale})` }}
              >
                <div className="w-32 h-32 rounded-full bg-mist/30 flex items-center justify-center">
                  <Wind className="w-10 h-10 text-mist" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {!isRunning ? (
                <button onClick={start} className="p-4 bg-mist text-white rounded-full hover:bg-mist/90">
                  <Play className="w-6 h-6" />
                </button>
              ) : (
                <button onClick={pause} className="p-4 bg-mood-anxious text-white rounded-full hover:bg-mood-anxious/90">
                  <Pause className="w-6 h-6" />
                </button>
              )}
              <button onClick={reset} className="p-3 bg-warm-gray text-gray-500 rounded-full hover:bg-gray-200">
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ===== Generic Guide Component =====
function TechniqueGuide({ technique, onClose }: { technique: TechniqueCard; onClose: () => void }) {
  const guides: Record<string, string> = {
    'progressive-muscle-relaxation': `渐进式肌肉放松 (PMR) 步骤：

1. 找一个安静的地方坐下或躺下
2. 从脚部开始，先紧张肌肉 5 秒
3. 然后突然放松，感受放松的感觉 10 秒
4. 依次向上：小腿 → 大腿 → 臀部 → 腹部 → 胸部 → 手臂 → 肩膀 → 颈部 → 面部
5. 全程保持腹式呼吸

每次练习约 15-20 分钟。`,
    'thought-record': `CBT 思维记录表五栏法：

1. 情境：发生了什么？
2. 自动化思维：脑海里闪过了什么？
3. 情绪：感受到什么？强度 0-100？
4. 证据：支持这个想法的证据？反对的证据？
5. 替代思维：更平衡的想法是什么？
6. 重新评估：现在情绪强度是多少？

关键是不要评判思维的对错，而是检验它是否有帮助。`,
    'stop-technique': `STOP 技术步骤：

S - Stop（停）：停下你正在做的事
T - Take a breath（呼吸）：做三次腹式呼吸
O - Observe（观察）：观察你的身体感受、情绪和想法，不要评判
P - Proceed（继续）：有意识地选择下一步行动

整个过程只需要 1-2 分钟，可以在任何情绪冲动时使用。`,
    'grounding-54321': `5-4-3-2-1 接地技术：

说出你周围：
- 5 样你能看到的东西
- 4 样你能触摸到的东西
- 3 样你能听到的声音
- 2 样你能闻到的气味
- 1 样你能尝到的味道

这能将注意力从焦虑的思绪中拉回当下现实。`,
    'gratitude-practice': `三件好事练习：

每天睡前写下：
1. 今天发生的三件好事（无论多小）
2. 每件事中你扮演的角色
3. 你当时感受到了什么

研究表明，持续练习 1 周即可显著提升幸福感。关键是写出细节，不要只是列清单。`,
  };

  return (
    <div className="fixed inset-0 bg-warm-white z-50 flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-warm-gray">
        <h2 className="text-lg font-semibold text-gray-800">{technique.title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <p className="text-sm text-gray-500 mb-4">{technique.description}</p>
        <div className="bg-white rounded-2xl border border-warm-gray p-5">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
            {guides[technique.id] || '暂无详细引导，敬请期待。'}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default function ToolboxPage() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [activeTechnique, setActiveTechnique] = useState<TechniqueCard | null>(null);

  const filtered = activeFilter === 'all'
    ? techniques
    : techniques.filter((t) => t.category === activeFilter);

  const openTechnique = (tech: TechniqueCard) => {
    setActiveTechnique(tech);
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">练习工具箱</h1>
        <p className="text-sm text-gray-500 mt-1">循证心理学技术，随时可用</p>
      </header>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-gray-400 shrink-0" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              activeFilter === f.key ? 'bg-mist text-white' : 'bg-warm-gray/50 text-gray-500 hover:text-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((tech) => (
          <div
            key={tech.id}
            onClick={() => openTechnique(tech)}
            className="bg-white rounded-2xl border border-warm-gray p-5 hover:border-mist/30 transition-colors cursor-pointer"
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
              <div className="p-2 bg-mist/10 rounded-lg text-mist shrink-0">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-400">共 {filtered.length} 项技术 · 更多内容持续更新</p>
      </div>

      {activeTechnique?.id === 'diaphragmatic-breathing' && (
        <BreathingExercise onClose={() => setActiveTechnique(null)} />
      )}
      {activeTechnique && activeTechnique.id !== 'diaphragmatic-breathing' && (
        <TechniqueGuide technique={activeTechnique} onClose={() => setActiveTechnique(null)} />
      )}
    </div>
  );
}
