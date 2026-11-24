export interface Habit {
  id: string;
  name: string;
  color: string;
  archived: boolean;
  order: number;
}

export interface HabitLog {
  id: string; // `${habitId}_${YYYY-MM-DD}`
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}