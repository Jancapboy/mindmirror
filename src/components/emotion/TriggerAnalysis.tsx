import { AlertTriangle, MapPin, Activity, Users } from 'lucide-react';
import type { TriggerFactor } from '../../core/emotion/analyzer';

interface Props {
  triggers: TriggerFactor[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  location: <MapPin className="w-3.5 h-3.5" />,
  activity: <Activity className="w-3.5 h-3.5" />,
  people: <Users className="w-3.5 h-3.5" />,
  symptom: <AlertTriangle className="w-3.5 h-3.5" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  location: '地点',
  activity: '活动',
  people: '人群',
  symptom: '症状',
};

export default function TriggerAnalysis({ triggers }: Props) {
  if (triggers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-warm-gray p-6 text-center">
        <p className="text-sm text-gray-400">记录更多情绪数据后，这里会显示可能影响心情的因素</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {triggers.map((t, idx) => {
        const isNegative = t.correlation > 0.2;
        const isPositive = t.correlation < -0.2;
        return (
          <div key={idx} className="bg-white rounded-xl border border-warm-gray p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">{CATEGORY_ICONS[t.category]}</span>
                <span className="text-xs text-gray-400">{CATEGORY_LABELS[t.category]}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isNegative ? 'bg-red-50 text-red-500' :
                isPositive ? 'bg-green-50 text-green-600' :
                'bg-gray-50 text-gray-500'
              }`}>
                {isNegative ? '负面关联' : isPositive ? '正面关联' : '弱关联'}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-800 mb-2">{t.factor}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>出现时平均心情 <strong className={t.avgMoodWhenPresent <= 4 ? 'text-red-500' : t.avgMoodWhenPresent >= 7 ? 'text-green-600' : 'text-gray-700'}>{t.avgMoodWhenPresent}</strong></span>
              <span>未出现时 <strong className="text-gray-700">{t.avgMoodWhenAbsent}</strong></span>
              <span>出现 {t.occurrence} 次</span>
            </div>
            {/* Correlation bar */}
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isNegative ? 'bg-red-400' : isPositive ? 'bg-green-400' : 'bg-gray-300'
                }`}
                style={{ width: `${Math.min(Math.abs(t.correlation) * 200, 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
