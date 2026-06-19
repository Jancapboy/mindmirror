import { useMemo } from 'react';
import type { EmotionEntry } from '../../stores/emotionStore';
import { aggregateByDay } from '../../core/emotion/analyzer';

interface Props {
  entries: EmotionEntry[];
  onSelectDate?: (date: string) => void;
  selectedDate?: string | null;
}

const EMOTION_COLORS: Record<string, string> = {
  happy: 'bg-mood-happy',
  calm: 'bg-mint',
  anxious: 'bg-mood-anxious',
  sad: 'bg-mood-sad',
  angry: 'bg-red-400',
  tired: 'bg-gray-400',
  excited: 'bg-orange-400',
  grateful: 'bg-amber-300',
};

export default function CalendarView({ entries, onSelectDate, selectedDate }: Props) {
  const dailyData = useMemo(() => aggregateByDay(entries), [entries]);
  const dailyMap = useMemo(() => {
    const m = new Map<string, ReturnType<typeof aggregateByDay>[number]>();
    for (const d of dailyData) m.set(d.date, d);
    return m;
  }, [dailyData]);

  // 显示当前月份
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDayOfMonth.getDay(); // 0 = Sunday

  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayLabels = ['日', '一', '二', '三', '四', '五', '六'];

  const cells: Array<{ date: string | null; day: number | null }> = [];
  for (let i = 0; i < startOffset; i++) cells.push({ date: null, day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ date: dateKey, day: d });
  }

  return (
    <div className="bg-white rounded-2xl border border-warm-gray p-5">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {year}年 {monthNames[month]}
      </h3>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {dayLabels.map(d => (
          <span key={d} className="text-xs text-gray-400 font-medium">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell.day) {
            return <div key={idx} className="aspect-square" />;
          }

          const data = cell.date ? dailyMap.get(cell.date) : undefined;
          const isSelected = selectedDate === cell.date;
          const isToday = cell.date === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

          return (
            <button
              key={idx}
              onClick={() => cell.date && onSelectDate?.(cell.date)}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative
                transition-all
                ${data ? '' : 'hover:bg-gray-50'}
                ${isSelected ? 'ring-2 ring-mist ring-offset-1' : ''}
                ${isToday ? 'font-bold' : ''}
              `}
            >
              {data ? (
                <>
                  <span className={`text-xs ${isToday ? 'text-mist' : 'text-gray-700'}`}>{cell.day}</span>
                  <div className={`w-5 h-5 rounded-full mt-0.5 ${EMOTION_COLORS[data.dominantEmotion || ''] || 'bg-gray-200'}`} />
                  <span className="text-[9px] text-gray-400 mt-0.5">{data.averageMood}</span>
                </>
              ) : (
                <span className={`text-xs ${isToday ? 'text-mist font-bold' : 'text-gray-300'}`}>{cell.day}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-mood-happy" />开心</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-mint" />平静</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-mood-anxious" />焦虑</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-mood-sad" />悲伤</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400" />愤怒</span>
      </div>
    </div>
  );
}
