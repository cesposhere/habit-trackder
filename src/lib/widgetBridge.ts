import { Capacitor, registerPlugin } from '@capacitor/core';
import { auth } from './firebase';
import type { Habit, HabitLog } from '../types';

interface WidgetBridgeInterface {
  syncWidgetData(options: {
    habitsJson: string;
    date: string;
    uid: string;
    projectId: string;
    apiKey: string;
    idToken: string;
    refreshToken: string;
  }): Promise<void>;
}

const WidgetBridge = registerPlugin<WidgetBridgeInterface>('WidgetBridge');

export async function pushToAndroidWidget(
  habits: Habit[],
  logs: Record<string, HabitLog>,
  todayDate: string
) {
  // Does nothing on PC/web, only runs on Android
  if (Capacitor.getPlatform() !== 'android') return;

  const user = auth.currentUser;
  if (!user) return;

  try {
    const idToken = await user.getIdToken();
    const activeHabits = habits
      .filter((h) => !h.archived)
      .map((h) => ({
        id: h.id,
        name: h.name,
        color: h.color,
        completed: Boolean(logs[`${h.id}_${todayDate}`]?.completed),
      }));

    await WidgetBridge.syncWidgetData({
      habitsJson: JSON.stringify(activeHabits),
      date: todayDate,
      uid: user.uid,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      idToken,
      refreshToken: user.refreshToken,
    });
  } catch (err) {
    console.warn('Widget sync skipped:', err);
  }
}