import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { CalendarDays, CheckSquare, Eye, EyeOff, Plus, Trash2, LogOut } from 'lucide-react';
import { auth } from './lib/firebase';
import { getLogicalDateString } from './lib/dateUtils';
import { useHabitData } from './hooks/useHabitData';
import { HabitCheckbox } from './components/HabitCheckbox';
import { AddHabitModal } from './components/AddHabitModal';
import { CalendarView } from './components/CalendarView';
import { pushToAndroidWidget } from './lib/widgetBridge';
import { triggerTickFeedback } from './lib/feedback';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const todayDate = getLogicalDateString(4); // 4:00 AM day cutoff
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [mobileTab, setMobileTab] = useState<'today' | 'calendar'>('today');
  const [modalOpen, setModalOpen] = useState(false);

  const { habits, logs, toggleHabit, addHabit, archiveHabit } = useHabitData(user?.uid);

  useEffect(() => {
    if (user) {
      pushToAndroidWidget(habits, logs, todayDate);
    }
  }, [user, habits, logs, todayDate]);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError('Invalid email or password.');
    }
  };

  if (!authReady) return null;

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4 rounded-2xl border border-white/10 bg-[#151820] p-6"
        >
          <h1 className="text-xl font-bold">Habit Tracker</h1>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0f1115] px-3.5 py-2.5 text-sm outline-none"
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#0f1115] px-3.5 py-2.5 pr-11 text-sm outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400 hover:text-white"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-white py-2.5 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pt-6 pb-24 lg:pb-8">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Habits</h1>
          <p className="text-xs text-zinc-400">
            {selectedDate === todayDate ? `Today · ${selectedDate}` : `Viewing ${selectedDate}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" /> Add Habit
          </button>
          <button
            onClick={() => signOut(auth)}
            className="rounded-xl border border-white/10 p-2 text-zinc-400 hover:text-white"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Responsive Split-Screen (PC/Tablet) or Tabbed (Phone) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Checklist Column */}
        <section className={`space-y-2.5 lg:col-span-5 ${mobileTab === 'calendar' ? 'hidden lg:block' : ''}`}>
          {habits.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-zinc-500">
              No habits yet. Click <strong>Add Habit</strong> to start.
            </div>
          ) : (
            habits.map((habit) => {
              const checked = Boolean(logs[`${habit.id}_${selectedDate}`]?.completed);
              const handleToggle = () => {
                triggerTickFeedback(!checked);
                toggleHabit(habit.id, selectedDate);
              };

              return (
                <div
                  key={habit.id}
                  onClick={handleToggle}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleHabit(habit.id, selectedDate);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group flex cursor-pointer select-none items-center justify-between rounded-2xl border border-white/8 bg-[#151820] px-4 py-3.5 transition hover:border-white/15"
                >
                  <div className="flex items-center gap-3.5">
                    <HabitCheckbox
                      checked={checked}
                      color={habit.color}
                    />
                    <span className={`text-sm font-medium transition ${checked ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}>
                      {habit.name}
                    </span>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      archiveHabit(habit.id);
                    }}
                    className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-red-400"
                    title="Archive habit"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })
          )}
        </section>

        {/* Calendar Column */}
        <section className={`lg:col-span-7 ${mobileTab === 'today' ? 'hidden lg:block' : ''}`}>
          <CalendarView
            habits={habits}
            logs={logs}
            selectedDate={selectedDate}
            todayDate={todayDate}
            onSelectDate={setSelectedDate}
          />
        </section>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed right-0 bottom-0 left-0 flex border-t border-white/10 bg-[#0f1115]/90 backdrop-blur-md lg:hidden">
        <button
          onClick={() => setMobileTab('today')}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
            mobileTab === 'today' ? 'text-white' : 'text-zinc-500'
          }`}
        >
          <CheckSquare className="h-5 w-5" />
          Today
        </button>
        <button
          onClick={() => setMobileTab('calendar')}
          className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
            mobileTab === 'calendar' ? 'text-white' : 'text-zinc-500'
          }`}
        >
          <CalendarDays className="h-5 w-5" />
          Calendar
        </button>
      </nav>

      <AddHabitModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addHabit} />
    </div>
  );
} 