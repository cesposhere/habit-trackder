import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Habit, HabitLog } from '../types';

export function useHabitData(uid: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<Record<string, HabitLog>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const habitsQ = query(
      collection(db, 'users', uid, 'habits'),
      where('archived', '==', false)
    );

    const unsubHabits = onSnapshot(habitsQ, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<Habit, 'id'>) }))
        .sort((a, b) => a.order - b.order);
      setHabits(list);
      setLoading(false);
    });

    const unsubLogs = onSnapshot(collection(db, 'users', uid, 'logs'), (snap) => {
      const map: Record<string, HabitLog> = {};
      snap.docs.forEach((d) => {
        const data = d.data() as Omit<HabitLog, 'id'>;
        if (data.completed) {
          map[d.id] = { id: d.id, ...data };
        }
      });
      setLogs(map);
    });

    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [uid]);

  const toggleHabit = async (habitId: string, date: string) => {
    if (!uid) return;
    const logId = `${habitId}_${date}`;
    const isCurrentlyDone = Boolean(logs[logId]?.completed);

    await setDoc(
      doc(db, 'users', uid, 'logs', logId),
      {
        habitId,
        date,
        completed: !isCurrentlyDone,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const addHabit = async (name: string, color: string) => {
    if (!uid || !name.trim()) return;
    await addDoc(collection(db, 'users', uid, 'habits'), {
      name: name.trim(),
      color,
      archived: false,
      order: habits.length,
      createdAt: serverTimestamp(),
    });
  };

  const archiveHabit = async (habitId: string) => {
    if (!uid) return;
    await updateDoc(doc(db, 'users', uid, 'habits', habitId), {
      archived: true,
    });
  };

  return { habits, logs, loading, toggleHabit, addHabit, archiveHabit };
}