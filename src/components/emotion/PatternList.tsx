import { Lightbulb } from 'lucide-react';
import type { EmotionPattern } from '../../core/emotion/analyzer';

interface Props {
  patterns: EmotionPattern[];
}

export default function PatternList({ patterns }: Props) {
  if (patterns.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-warm-gray p-6 text-center">
        <p className="text-sm text-gray-400">记录更多数据后，这里会识别你的情绪模式</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {patterns.map((p, idx) => (
        <div key={idx} className="bg-white rounded-xl border border-warm-gray p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-mist/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4 text-mist" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 leading-relaxed">{p.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-mist rounded-full"
                  style={{ width: `${p.confidence * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">置信度 {(p.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
