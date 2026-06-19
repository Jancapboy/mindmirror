import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar, ChevronLeft, Plus, Trash2, Edit3, X, Heart,
  Zap, MapPin, Users, Activity, Brain, ChevronDown, ChevronUp,
  BarChart3, Lightbulb, Filter, Check,
} from 'lucide-react';
import { useEmotionStore, type BaseEmotion } from '../stores/emotionStore';
import CalendarView from '../components/emotion/CalendarView';
import TrendChart from '../components/emotion/TrendChart';
import TriggerAnalysis from '../components/emotion/TriggerAnalysis';
import PatternList from '../components/emotion/PatternList';
import AIInsight from '../components/emotion/AIInsight';
import { detectPatterns, identifyTriggers } from '../core/emotion/analyzer';

const EMOTION_OPTIONS: { type: BaseEmotion; label: string; emoji: string; color: string }[] = [
  { type: 'happy', label: '开心', emoji: '😊', color: 'bg-mood-happy/20 text-mood-happy' },
  { type: 'calm', label: '平静', emoji: '😌', color: 'bg-mood-calm/20 text-mood-calm' },
  { type: 'excited', label: '兴奋', emoji: '🤩', color: 'bg-mood-excited/20 text-mood-excited' },
  { type: 'grateful', label: '感恩', emoji: '🙏', color: 'bg-mood-grateful/20 text-mood-grateful' },
  { type: 'anxious', label: '焦虑', emoji: '😰', color: 'bg-mood-anxious/20 text-mood-anxious' },
  { type: 'sad', label: '悲伤', emoji: '😢', color: 'bg-mood-sad/20 text-mood-sad' },
  { type: 'angry', label: '愤怒', emoji: '😠', color: 'bg-mood-angry/20 text-mood-angry' },
  { type: 'tired', label: '疲惫', emoji: '😴', color: 'bg-mood-tired/20 text-mood-tired' },
];

const PHYSICAL_SYMPTOMS = ['头痛', '胸闷', '失眠', '胃痛', '肌肉紧绷', '心悸', '食欲不振', '乏力'];

interface EntryForm {
  emotions: Array<{ type: BaseEmotion; intensity: number }>;
  overallMood: number;
  energyLevel: number;
  context: { location: string; activity: string; people: string };
  thoughts: { automaticThought: string; cognitiveDistortion: string; evidenceFor: string; evidenceAgainst: string; alternativeThought: string };
  physicalSymptoms: string[];
  note: string;
}

function emptyForm(): EntryForm {
  return {
    emotions: [],
    overallMood: 5,
    energyLevel: 5,
    context: { location: '', activity: '', people: '' },
    thoughts: { automaticThought: '', cognitiveDistortion: '', evidenceFor: '', evidenceAgainst: '', alternativeThought: '' },
    physicalSymptoms: [],
    note: '',
  };
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const isYesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
  if (isToday) return '今天';
  if (isYesterday) return '昨天';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function toDateKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function DiaryPage() {
  const { entries, loading, loadEntries, addEntry, updateEntry, removeEntry } = useEmotionStore();
  const [view, setView] = useState<'list' | 'calendar' | 'stats'>('list');
  const [emotionFilter, setEmotionFilter] = useState<BaseEmotion | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EntryForm>(emptyForm());
  const [formStep, setFormStep] = useState(0);
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Derived data
  const patterns = useMemo(() => detectPatterns(entries), [entries]);
  const triggers = useMemo(() => identifyTriggers(entries), [entries]);

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (selectedDate) {
      result = result.filter(e => toDateKey(e.timestamp) === selectedDate);
    }
    if (emotionFilter) {
      result = result.filter(e => e.emotions.some(em => em.type === emotionFilter));
    }
    return result;
  }, [entries, selectedDate, emotionFilter]);

  const resetForm = useCallback(() => {
    setForm(emptyForm());
    setFormStep(0);
    setEditingId(null);
  }, []);

  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (entryId: string) => {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    setForm({
      emotions: entry.emotions,
      overallMood: entry.overallMood,
      energyLevel: entry.energyLevel,
      context: { location: entry.context?.location || '', activity: entry.context?.activity || '', people: entry.context?.people || '' },
      thoughts: {
        automaticThought: entry.thoughts?.automaticThought || '',
        cognitiveDistortion: entry.thoughts?.cognitiveDistortion || '',
        evidenceFor: entry.thoughts?.evidenceFor || '',
        evidenceAgainst: entry.thoughts?.evidenceAgainst || '',
        alternativeThought: entry.thoughts?.alternativeThought || '',
      },
      physicalSymptoms: entry.physicalSymptoms || [],
      note: entry.note || '',
    });
    setEditingId(entryId);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (form.emotions.length === 0) {
      alert('请至少选择一种情绪');
      return;
    }
    const entryData = {
      timestamp: editingId ? entries.find(e => e.id === editingId)?.timestamp || Date.now() : Date.now(),
      emotions: form.emotions,
      overallMood: form.overallMood,
      energyLevel: form.energyLevel,
      context: form.context.location || form.context.activity || form.context.people ? form.context : undefined,
      thoughts: form.thoughts.automaticThought ? form.thoughts : undefined,
      physicalSymptoms: form.physicalSymptoms.length > 0 ? form.physicalSymptoms : undefined,
      note: form.note || undefined,
    };

    if (editingId) {
      await updateEntry({ ...entryData, id: editingId });
    } else {
      await addEntry(entryData);
    }
    setShowForm(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定删除这条记录吗？')) {
      await removeEntry(id);
    }
  };

  const toggleEmotion = (type: BaseEmotion) => {
    setForm(prev => {
      const exists = prev.emotions.find(e => e.type === type);
      if (exists) {
        return { ...prev, emotions: prev.emotions.filter(e => e.type !== type) };
      }
      return { ...prev, emotions: [...prev.emotions, { type, intensity: 5 }] };
    });
  };

  const setEmotionIntensity = (type: BaseEmotion, intensity: number) => {
    setForm(prev => ({
      ...prev,
      emotions: prev.emotions.map(e => (e.type === type ? { ...e, intensity } : e)),
    }));
  };

  const togglePhysicalSymptom = (symptom: string) => {
    setForm(prev => ({
      ...prev,
      physicalSymptoms: prev.physicalSymptoms.includes(symptom)
        ? prev.physicalSymptoms.filter(s => s !== symptom)
        : [...prev.physicalSymptoms, symptom],
    }));
  };

  const formSteps = [
    { title: '情绪', desc: '你今天感受到了什么？' },
    { title: '强度', desc: '这些情绪的强度如何？' },
    { title: '情境', desc: '当时你在做什么？' },
    { title: '身体', desc: '有什么身体感受？' },
    { title: '思维', desc: '脑海里闪过了什么想法？' },
    { title: '笔记', desc: '还有什么想记录的？' },
  ];

  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">情绪日记</h1>
          <p className="text-sm text-gray-500 mt-1">
            {entries.length > 0 ? `已记录 ${entries.length} 条` : '记录每一次情绪起伏'}
          </p>
        </div>
        <div className="flex items-center gap-1 bg-warm-white rounded-xl p-1">
          <button
            onClick={() => { setView('list'); setSelectedDate(null); }}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white shadow-sm text-mist' : 'text-gray-400'}`}
            title="列表"
          >
            <ChevronLeft className="w-4 h-4 rotate-90" />
          </button>
          <button
            onClick={() => { setView('calendar'); setSelectedDate(null); }}
            className={`p-2 rounded-lg transition-colors ${view === 'calendar' ? 'bg-white shadow-sm text-mist' : 'text-gray-400'}`}
            title="日历"
          >
            <Calendar className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setView('stats'); setSelectedDate(null); }}
            className={`p-2 rounded-lg transition-colors ${view === 'stats' ? 'bg-white shadow-sm text-mist' : 'text-gray-400'}`}
            title="统计"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Add Button */}
      <button
        onClick={openNewForm}
        className="w-full bg-mist text-white rounded-xl py-3.5 font-medium hover:bg-mist/90 transition-colors mb-6 flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        新增记录
      </button>

      {loading && (
        <div className="text-center py-8 text-gray-400 text-sm">加载中...</div>
      )}

      {/* ===== LIST VIEW ===== */}
      {view === 'list' && !loading && (
        <>
          {/* Filters */}
          {entries.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">筛选</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setEmotionFilter(null)}
                  className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                    emotionFilter === null ? 'bg-mist text-white' : 'bg-warm-white text-gray-500'
                  }`}
                >
                  全部
                </button>
                {EMOTION_OPTIONS.map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => setEmotionFilter(emotionFilter === opt.type ? null : opt.type)}
                    className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                      emotionFilter === opt.type ? opt.color : 'bg-warm-white text-gray-500'
                    }`}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                ))}
              </div>
              {selectedDate && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">日期: {selectedDate}</span>
                  <button onClick={() => setSelectedDate(null)} className="text-xs text-mist hover:underline">清除</button>
                </div>
              )}
            </div>
          )}

          {filteredEntries.length === 0 && (
            <div className="bg-white rounded-2xl border border-warm-gray p-8 text-center">
              <div className="w-16 h-16 bg-warm-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit3 className="w-7 h-7 text-gray-300" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {entries.length === 0 ? '还没有记录' : '没有匹配的记录'}
              </h3>
              <p className="text-sm text-gray-400">
                {entries.length === 0 ? '开始记录你的情绪，观察内心的变化' : '试试调整筛选条件'}
              </p>
            </div>
          )}

          {filteredEntries.length > 0 && (
            <div className="space-y-3">
              {filteredEntries.map(entry => (
                <div key={entry.id} className="bg-white rounded-2xl border border-warm-gray p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{formatDate(entry.timestamp)}</p>
                      <p className="text-xs text-gray-400">{formatTime(entry.timestamp)} · {entry.context?.activity || '未记录'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {entry.emotions[0] && (
                        <span className="text-2xl">
                          {EMOTION_OPTIONS.find(e => e.type === entry.emotions[0].type)?.emoji}
                        </span>
                      )}
                      <span className={`text-sm font-medium ${entry.overallMood >= 6 ? 'text-mood-happy' : entry.overallMood >= 4 ? 'text-mood-calm' : 'text-mood-sad'}`}>
                        {entry.overallMood}/10
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {entry.emotions.map(e => {
                      const opt = EMOTION_OPTIONS.find(o => o.type === e.type);
                      return (
                        <span key={e.type} className={`px-2.5 py-1 text-xs rounded-full ${opt?.color || 'bg-gray-100 text-gray-600'}`}>
                          {opt?.emoji} {opt?.label} · {e.intensity}
                        </span>
                      );
                    })}
                  </div>

                  {entry.note && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{entry.note}</p>
                  )}

                  <button
                    onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                    className="text-xs text-mist flex items-center gap-1 mb-2"
                  >
                    {expandedEntry === entry.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {expandedEntry === entry.id ? '收起详情' : '查看详情'}
                  </button>

                  {expandedEntry === entry.id && (
                    <div className="mt-3 pt-3 border-t border-warm-gray space-y-3 text-sm">
                      {entry.context && (entry.context.location || entry.context.people) && (
                        <div className="flex flex-wrap gap-3 text-gray-500">
                          {entry.context.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {entry.context.location}</span>}
                          {entry.context.people && <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {entry.context.people}</span>}
                        </div>
                      )}
                      {entry.physicalSymptoms && entry.physicalSymptoms.length > 0 && (
                        <div className="flex items-center gap-1 text-gray-500">
                          <Activity className="w-3 h-3" />
                          <span>身体感受：{entry.physicalSymptoms.join('、')}</span>
                        </div>
                      )}
                      {entry.thoughts && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-gray-500"><Brain className="w-3 h-3" /> <span>自动化思维</span></div>
                          <p className="text-gray-600 bg-warm-white rounded-lg p-3">{entry.thoughts.automaticThought}</p>
                          {entry.thoughts.cognitiveDistortion && (
                            <p className="text-xs text-gray-400">认知扭曲：{entry.thoughts.cognitiveDistortion}</p>
                          )}
                          {entry.thoughts.alternativeThought && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">替代思维</p>
                              <p className="text-gray-600 bg-mint/10 rounded-lg p-3">{entry.thoughts.alternativeThought}</p>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-gray-500">
                        <Zap className="w-3 h-3" />
                        <span>精力水平：{entry.energyLevel}/10</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-warm-gray">
                    <button onClick={() => openEditForm(entry.id)} className="text-xs text-gray-400 hover:text-mist flex items-center gap-1">
                      <Edit3 className="w-3 h-3" /> 编辑
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="text-xs text-gray-400 hover:text-red-400 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ===== CALENDAR VIEW ===== */}
      {view === 'calendar' && !loading && (
        <div className="space-y-4">
          <CalendarView
            entries={entries}
            onSelectDate={(date) => { setSelectedDate(date); setView('list'); }}
            selectedDate={selectedDate}
          />
        </div>
      )}

      {/* ===== STATS VIEW ===== */}
      {view === 'stats' && !loading && (
        <div className="space-y-6">
          {/* AI Insight */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-mood-happy" />
              <h3 className="text-sm font-medium text-gray-700">智能洞察</h3>
            </div>
            <AIInsight entries={entries} />
          </section>

          {/* Trend Chart */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-mist" />
              <h3 className="text-sm font-medium text-gray-700">趋势分析</h3>
            </div>
            <TrendChart entries={entries} />
          </section>

          {/* Patterns */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-mint" />
              <h3 className="text-sm font-medium text-gray-700">情绪模式</h3>
            </div>
            <PatternList patterns={patterns} />
          </section>

          {/* Triggers */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-mood-anxious" />
              <h3 className="text-sm font-medium text-gray-700">触发因子</h3>
            </div>
            <TriggerAnalysis triggers={triggers} />
          </section>
        </div>
      )}

      {/* ===== ENTRY FORM MODAL ===== */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
            {/* Form Header */}
            <div className="sticky top-0 bg-white border-b border-warm-gray px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{editingId ? '编辑记录' : '记录情绪'}</h2>
                <p className="text-xs text-gray-400">{formSteps[formStep].title} · 步骤 {formStep + 1}/{formSteps.length}</p>
              </div>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Progress */}
            <div className="px-5 pt-4">
              <div className="h-1 bg-warm-gray rounded-full overflow-hidden">
                <div className="h-full bg-mist rounded-full transition-all" style={{ width: `${((formStep + 1) / formSteps.length) * 100}%` }} />
              </div>
            </div>

            {/* Form Content */}
            <div className="px-5 py-6">
              {/* Step 0: Emotions */}
              {formStep === 0 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{formSteps[0].desc}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {EMOTION_OPTIONS.map(opt => {
                      const selected = form.emotions.some(e => e.type === opt.type);
                      return (
                        <button
                          key={opt.type}
                          onClick={() => toggleEmotion(opt.type)}
                          className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all active:scale-95 ${
                            selected
                              ? 'border-mist bg-mist/20 shadow-sm'
                              : 'border-transparent bg-warm-white hover:bg-gray-100'
                          }`}
                        >
                          {selected && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-mist rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </span>
                          )}
                          <span className="text-2xl">{opt.emoji}</span>
                          <span className={`text-xs font-medium ${selected ? 'text-mist' : 'text-gray-600'}`}>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-center text-gray-400 mt-3">
                    已选择 {form.emotions.length} 种情绪{form.emotions.length > 0 ? ' · 可多选' : ' · 点击选择'}
                  </p>
                </div>
              )}

              {/* Step 1: Intensity */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <p className="text-sm text-gray-500">{formSteps[1].desc}</p>

                  {/* Overall Mood */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                      <Heart className="w-4 h-4 text-mist" /> 整体心情
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{form.overallMood >= 7 ? '😊' : form.overallMood >= 4 ? '😐' : '😢'}</span>
                      <input
                        type="range" min={1} max={10} value={form.overallMood}
                        onChange={e => setForm(prev => ({ ...prev, overallMood: Number(e.target.value) }))}
                        className="flex-1 accent-mist"
                      />
                      <span className="text-lg font-medium text-mist w-8 text-center">{form.overallMood}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1 px-10">
                      <span>很低</span><span>一般</span><span>很好</span>
                    </div>
                  </div>

                  {/* Emotion Intensities */}
                  {form.emotions.map(e => {
                    const opt = EMOTION_OPTIONS.find(o => o.type === e.type);
                    return (
                      <div key={e.type}>
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                          <span>{opt?.emoji}</span> {opt?.label}强度
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range" min={1} max={10} value={e.intensity}
                            onChange={ev => setEmotionIntensity(e.type, Number(ev.target.value))}
                            className="flex-1 accent-mist"
                          />
                          <span className="text-sm font-medium text-gray-600 w-6">{e.intensity}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Energy Level */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-mood-excited" /> 精力水平
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{form.energyLevel >= 7 ? '⚡' : form.energyLevel >= 4 ? '🔋' : '🪫'}</span>
                      <input
                        type="range" min={1} max={10} value={form.energyLevel}
                        onChange={e => setForm(prev => ({ ...prev, energyLevel: Number(e.target.value) }))}
                        className="flex-1 accent-mint"
                      />
                      <span className="text-lg font-medium text-mint w-8 text-center">{form.energyLevel}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Context */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{formSteps[2].desc}</p>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">地点</label>
                    <input
                      type="text" value={form.context.location}
                      onChange={e => setForm(prev => ({ ...prev, context: { ...prev.context, location: e.target.value } }))}
                      placeholder="例如：家里、公司、咖啡厅"
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-warm-white text-sm focus:outline-none focus:border-mist"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">活动</label>
                    <input
                      type="text" value={form.context.activity}
                      onChange={e => setForm(prev => ({ ...prev, context: { ...prev.context, activity: e.target.value } }))}
                      placeholder="例如：工作、休息、社交"
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-warm-white text-sm focus:outline-none focus:border-mist"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">和谁在一起</label>
                    <input
                      type="text" value={form.context.people}
                      onChange={e => setForm(prev => ({ ...prev, context: { ...prev.context, people: e.target.value } }))}
                      placeholder="例如：独自、同事、家人"
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-warm-white text-sm focus:outline-none focus:border-mist"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Physical */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{formSteps[3].desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {PHYSICAL_SYMPTOMS.map(sym => (
                      <button
                        key={sym}
                        onClick={() => togglePhysicalSymptom(sym)}
                        className={`px-3 py-2 rounded-full text-sm transition-colors ${
                          form.physicalSymptoms.includes(sym)
                            ? 'bg-mood-anxious/20 text-mood-anxious border border-mood-anxious/30'
                            : 'bg-warm-white text-gray-500 border border-warm-gray'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Thoughts (CBT) */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{formSteps[4].desc}</p>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">自动化思维</label>
                    <textarea
                      value={form.thoughts.automaticThought}
                      onChange={e => setForm(prev => ({ ...prev, thoughts: { ...prev.thoughts, automaticThought: e.target.value } }))}
                      placeholder="当时脑海里闪过了什么想法？"
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-warm-white text-sm focus:outline-none focus:border-mist resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">认知扭曲类型（可选）</label>
                    <select
                      value={form.thoughts.cognitiveDistortion}
                      onChange={e => setForm(prev => ({ ...prev, thoughts: { ...prev.thoughts, cognitiveDistortion: e.target.value } }))}
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-warm-white text-sm focus:outline-none focus:border-mist"
                    >
                      <option value="">选择类型...</option>
                      <option value="全或无思维">全或无思维</option>
                      <option value="过度概括">过度概括</option>
                      <option value="心理过滤">心理过滤</option>
                      <option value="否定正面">否定正面</option>
                      <option value="读心术">读心术</option>
                      <option value="预测未来">预测未来</option>
                      <option value="灾难化">灾难化</option>
                      <option value="情绪推理">情绪推理</option>
                      <option value="应该陈述">应该陈述</option>
                      <option value="贴标签">贴标签</option>
                      <option value="个人化">个人化</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">支持证据</label>
                    <textarea
                      value={form.thoughts.evidenceFor}
                      onChange={e => setForm(prev => ({ ...prev, thoughts: { ...prev.thoughts, evidenceFor: e.target.value } }))}
                      placeholder="有什么证据支持这个想法？"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-warm-white text-sm focus:outline-none focus:border-mist resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">反对证据</label>
                    <textarea
                      value={form.thoughts.evidenceAgainst}
                      onChange={e => setForm(prev => ({ ...prev, thoughts: { ...prev.thoughts, evidenceAgainst: e.target.value } }))}
                      placeholder="有什么证据反对这个想法？"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-warm-white text-sm focus:outline-none focus:border-mist resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">替代思维</label>
                    <textarea
                      value={form.thoughts.alternativeThought}
                      onChange={e => setForm(prev => ({ ...prev, thoughts: { ...prev.thoughts, alternativeThought: e.target.value } }))}
                      placeholder="一个更平衡的想法是什么？"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-warm-white text-sm focus:outline-none focus:border-mint resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Note */}
              {formStep === 5 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">{formSteps[5].desc}</p>
                  <textarea
                    value={form.note}
                    onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="写下任何你想记录的内容..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-warm-gray bg-warm-white text-sm focus:outline-none focus:border-mist resize-none"
                  />
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className="sticky bottom-0 bg-white border-t border-warm-gray px-5 py-4 flex items-center justify-between">
              <button
                onClick={() => setFormStep(Math.max(0, formStep - 1))}
                disabled={formStep === 0}
                className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                上一步
              </button>
              {formStep < formSteps.length - 1 ? (
                <button
                  onClick={() => setFormStep(formStep + 1)}
                  className="px-6 py-2.5 bg-mist text-white text-sm font-medium rounded-xl hover:bg-mist/90"
                >
                  下一步
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-mint text-white text-sm font-medium rounded-xl hover:bg-mint/90"
                >
                  {editingId ? '保存修改' : '完成记录'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
