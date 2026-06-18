import { useState, useEffect } from 'react';
import {
  ClipboardList, Clock, ChevronRight, AlertCircle, CheckCircle2,
  ArrowLeft, TrendingUp, Info,
} from 'lucide-react';
import { phq9Scale } from '../data/scales/phq9';
import { gad7Scale } from '../data/scales/gad7';
import { calculateScore, getInterpretation, getSeverity, getProgressPercent } from '../core/assessment/scoring';
import { useAssessmentStore } from '../stores/assessmentStore';
import type { Scale } from '../types/assessment';

const ALL_SCALES = [phq9Scale, gad7Scale];


function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - ts) / 86400000);
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function AssessmentPage() {
  const { records, loadRecords } = useAssessmentStore();
  const [activeTab, setActiveTab] = useState<'scales' | 'history'>('scales');
  const [activeScale, setActiveScale] = useState<Scale | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<{ score: number; interpretation: ReturnType<typeof getInterpretation>; severity: ReturnType<typeof getSeverity> } | null>(null);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const getLastRecord = (scaleId: string) => {
    return records
      .filter(r => r.scaleId === scaleId)
      .sort((a, b) => b.takenAt - a.takenAt)[0];
  };

  const startScale = (scale: Scale) => {
    setActiveScale(scale);
    setAnswers({});
    setShowResult(false);
    setResult(null);
  };

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!activeScale) return;
    const score = calculateScore(activeScale, answers);
    const interpretation = getInterpretation(activeScale, score);
    const severity = getSeverity(activeScale, score);

    await useAssessmentStore.getState().addRecord({
      scaleId: activeScale.id,
      scaleName: activeScale.name,
      takenAt: Date.now(),
      answers: { ...answers },
      totalScore: score,
      interpretation: interpretation.description,
      severity: severity.severity,
      severityLabel: severity.label,
    });

    setResult({ score, interpretation, severity });
    setShowResult(true);
    loadRecords();
  };

  const allAnswered = activeScale ? activeScale.questions.every(q => answers[q.id] !== undefined) : false;
  const currentQIndex = activeScale
    ? activeScale.questions.findIndex(q => answers[q.id] === undefined)
    : -1;
  const activeQuestionIndex = currentQIndex === -1 ? (activeScale?.questions.length || 0) - 1 : currentQIndex;

  // ===== Scale Taking View =====
  if (activeScale && !showResult) {
    const q = activeScale.questions[activeQuestionIndex];
    const progress = getProgressPercent(activeScale, activeQuestionIndex);

    return (
      <div className="min-h-screen pb-20 px-4 pt-6">
        <header className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveScale(null)} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{activeScale.name}</h1>
            <p className="text-xs text-gray-400">{activeScale.fullName}</p>
          </div>
        </header>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>问题 {activeQuestionIndex + 1} / {activeScale.questions.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-warm-gray rounded-full overflow-hidden">
            <div className="h-full bg-mist rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl border border-warm-gray p-6 mb-6">
          <p className="text-lg font-medium text-gray-800 mb-6 leading-relaxed">
            {q.text}
          </p>
          <div className="space-y-2">
            {q.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(q.id, opt.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all ${
                  answers[q.id] === opt.value
                    ? 'border-mist bg-mist/5 text-gray-800'
                    : 'border-warm-gray hover:border-mist/40 text-gray-600'
                }`}
              >
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {activeScale.questions.map((qq, i) => (
            <button
              key={qq.id}
              onClick={() => { /* allow jumping back to answered questions */ }}
              className={`w-2 h-2 rounded-full transition-all ${
                answers[qq.id] !== undefined ? 'bg-mist w-4' : i === activeQuestionIndex ? 'bg-mist' : 'bg-warm-gray'
              }`}
            />
          ))}
        </div>

        {/* Submit */}
        {allAnswered && (
          <button
            onClick={handleSubmit}
            className="w-full bg-mint text-white rounded-xl py-3.5 font-medium hover:bg-mint/90 transition-colors"
          >
            查看结果
          </button>
        )}
      </div>
    );
  }

  // ===== Result View =====
  if (activeScale && showResult && result) {
    const isSevere = result.severity.severity === 'severe';
    const isMild = result.severity.severity === 'mild';

    return (
      <div className="min-h-screen pb-20 px-4 pt-6">
        <header className="flex items-center gap-3 mb-6">
          <button onClick={() => { setActiveScale(null); setShowResult(false); }} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800">测评结果</h1>
        </header>

        {/* Score Card */}
        <div className={`rounded-2xl p-6 mb-6 text-center ${
          isSevere ? 'bg-red-50 border border-red-200' : isMild ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
        }`}>
          <p className="text-sm text-gray-500 mb-2">{activeScale.name} 得分</p>
          <p className="text-5xl font-bold text-gray-800 mb-2">{result.score}</p>
          <p className={`text-lg font-medium ${isSevere ? 'text-red-600' : isMild ? 'text-yellow-600' : 'text-green-600'}`}>
            {result.severity.label}
          </p>
          <p className="text-xs text-gray-400 mt-1">满分 {activeScale.scoringRules.maxScore} 分 · {activeScale.questions.length} 题</p>
        </div>

        {/* Interpretation */}
        <div className="bg-white rounded-2xl border border-warm-gray p-5 mb-4">
          <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-mist" /> 结果解读
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{result.interpretation.description}</p>
        </div>

        {/* Recommendation */}
        <div className="bg-white rounded-2xl border border-warm-gray p-5 mb-4">
          <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-mint" /> 建议
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">{result.interpretation.recommendation}</p>
        </div>

        {/* Crisis Warning */}
        {activeScale.id === 'phq-9' && answers['phq9-q9'] && answers['phq9-q9'] > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4">
            <h3 className="font-medium text-red-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> 重要提醒
            </h3>
            <p className="text-sm text-red-600 leading-relaxed">
              你在最后一题（自伤念头）中选择了非零答案。请务必重视这一信号，建议尽快寻求专业帮助。
            </p>
            <div className="mt-3 text-sm text-red-700 space-y-1">
              <p>📞 全国心理援助热线：400-161-9995</p>
              <p>📞 北京心理危机研究与干预中心：010-82951332</p>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-warm-white rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-400 leading-relaxed">
            ⚠️ 本结果仅供参考，不构成医学诊断。如有严重困扰，请寻求专业心理咨询或精神科医生的帮助。
          </p>
        </div>

        <button
          onClick={() => { setActiveScale(null); setShowResult(false); }}
          className="w-full bg-mist text-white rounded-xl py-3.5 font-medium hover:bg-mist/90 transition-colors"
        >
          完成
        </button>
      </div>
    );
  }

  // ===== Main List View =====
  return (
    <div className="min-h-screen pb-20 px-4 pt-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">测评中心</h1>
        <p className="text-sm text-gray-500 mt-1">标准化心理量表，科学了解内心</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-warm-gray/50 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('scales')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'scales' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          量表
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'history' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
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
          {ALL_SCALES.map(scale => {
            const last = getLastRecord(scale.id);
            return (
              <div
                key={scale.id}
                onClick={() => startScale(scale)}
                className="bg-white rounded-2xl border border-warm-gray p-5 hover:border-mist/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-mist" />
                      <h3 className="font-semibold text-gray-800">{scale.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{scale.fullName}</p>
                  </div>
                  <div className="p-2 bg-mist/10 rounded-lg text-mist">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{scale.description}</p>

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {scale.questions.length} 题</span>
                  {last && (
                    <span className="flex items-center gap-1 text-mist">
                      <CheckCircle2 className="w-3 h-3" /> 上次 {formatDate(last.takenAt)} · {last.totalScore}分
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {records.length === 0 && (
            <div className="bg-white rounded-2xl border border-warm-gray p-8 text-center">
              <ClipboardList className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">还没有测评记录</p>
              <p className="text-xs text-gray-300 mt-1">完成量表后将在这里看到历史</p>
            </div>
          )}
          {records.map(record => (
            <div key={record.id} className="bg-white rounded-2xl border border-warm-gray p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-800">{record.scaleName}</h3>
                  <p className="text-xs text-gray-400">{formatDate(record.takenAt)}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  record.severity === 'severe' ? 'bg-red-100 text-red-700' :
                  record.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  record.severity === 'mild' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {record.severityLabel} · {record.totalScore}分
                </div>
              </div>
              <p className="text-sm text-gray-600">{record.interpretation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
