import { useState } from 'react';
import { X } from 'lucide-react';

const COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6', '#ef4444'];

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string) => Promise<void>;
}

export function AddHabitModal({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onAdd(name, color);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#161920] p-5 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">New Habit</h2>
          <button type="button" onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <input
          autoFocus
          type="text"
          placeholder="e.g., LeetCode 2 problems, Cycling..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-4 w-full rounded-xl border border-white/10 bg-[#0f1115] px-3.5 py-2.5 text-sm text-white outline-none focus:border-white/30"
        />

        <div className="mb-5 flex items-center gap-2.5">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              className={`h-7 w-7 rounded-full transition-transform ${
                color === c ? 'scale-115 ring-2 ring-white ring-offset-2 ring-offset-[#161920]' : 'opacity-70'
              }`}
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
        >
          Add Habit
        </button>
      </form>
    </div>
  );
}