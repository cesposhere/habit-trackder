import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Habit, HabitLog } from '../types';

interface Props {
  habits: Habit[];
  logs: Record<string, HabitLog>;
  selectedDate: string;
  todayDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function fmtDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function CalendarView({ habits, logs, selectedDate, todayDate, onSelectDate }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [filterHabitId, setFilterHabitId] = useState<string>('all');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const activeHabit = habits.find((h) => h.id === filterHabitId);

  const changeMonth = (delta: number) => {
    setViewDate(new Date(year, month + delta, 1));
  };

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="rounded-2xl border border-white/8 bg-[#151820] p-4 sm:p-5">
      {/* Month header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => changeMonth(-1)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/5 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Habit filter pills */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterHabitId('all')}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
            filterHabitId === 'all' ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:text-white'
          }`}
        >
          All Habits
        </button>
        {habits.map((h) => (
          <button
            key={h.id}
            onClick={() => setFilterHabitId(h.id)}
            style={
              filterHabitId === h.id
                ? { backgroundColor: h.color, color: '#000' }
                : undefined
            }
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition ${
              filterHabitId === h.id ? '' : 'bg-white/5 text-zinc-400 hover:text-white'
            }`}
          >
            {h.name}
          </button>
        ))}
      </div>

      {/* Weekday headers */}
      <div className="mb-2 grid grid-cols-7 text-center text-xs text-zinc-500">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1.5">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} />;

          const dateStr = fmtDate(year, month, day);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayDate;

          // Single-habit connected streak mode
          if (activeHabit) {
            const done = Boolean(logs[`${activeHabit.id}_${dateStr}`]?.completed);
            const prevDone =
              day > 1 &&
              idx % 7 !== 0 &&
              Boolean(logs[`${activeHabit.id}_${fmtDate(year, month, day - 1)}`]?.completed);
            const nextDone =
              day < daysInMonth &&
              idx % 7 !== 6 &&
              Boolean(logs[`${activeHabit.id}_${fmtDate(year, month, day + 1)}`]?.completed);

            const pillRadius =
              done && prevDone && nextDone
                ? 'rounded-none'
                : done && prevDone
                ? 'rounded-r-full'
                : done && nextDone
                ? 'rounded-l-full'
                : 'rounded-full';

            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                style={done ? { backgroundColor: `${activeHabit.color}33` } : undefined}
                className={`relative flex h-10 items-center justify-center text-xs font-medium transition ${pillRadius} ${
                  isSelected ? 'ring-1 ring-white' : ''
                }`}
              >
                <span
                  style={done ? { backgroundColor: activeHabit.color, color: '#000' } : undefined}
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    !done && isToday ? 'border border-white/40 text-white' : !done ? 'text-zinc-400' : 'font-bold'
                  }`}
                >
                  {day}
                </span>
              </button>
            );
          }

          // All-habits mode uses one colored dot per completed habit.
          const completedHabits = habits.filter((h) => logs[`${h.id}_${dateStr}`]?.completed);
          const dotRadius = 19;

          return (
            <button
              key={dateStr}
              onClick={() => onSelectDate(dateStr)}
              className={`relative flex h-11 items-center justify-center rounded-xl transition ${
                isSelected ? 'bg-white/10 ring-1 ring-white/40' : 'hover:bg-white/5'
              }`}
            >
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 overflow-visible"
                viewBox="0 0 44 44"
                aria-hidden="true"
              >
                {completedHabits.map((habit, index) => {
                  const angle = -Math.PI / 2 + (2 * Math.PI * index) / completedHabits.length;
                  const cx = 22 + dotRadius * Math.cos(angle);
                  const cy = 22 + dotRadius * Math.sin(angle);
                  return <circle key={habit.id} cx={cx} cy={cy} r={2.5} fill={habit.color} />;
                })}
              </svg>
              <span
                className={`relative z-10 text-xs ${
                  isToday ? 'font-bold text-white' : 'text-zinc-300'
                }`}
              >
                {day}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}