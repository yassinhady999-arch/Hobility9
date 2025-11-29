export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  theme: 'light' | 'dark';
  role: 'user' | 'admin';
  password?: string;
  language?: 'en' | 'ar';
  expiryDate?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  goal: number;
  completed_days: number[]; // Array of days (1-31)
  month_key: string; // Format "YYYY-MM"
}

export interface DailyTask {
  id: string;
  user_id: string;
  day: number;
  title: string;
  completed: boolean;
  month_key: string;
}

export interface MentalState {
  user_id: string;
  day: number;
  mood: number | null; // 1-10
  motivation: number | null; // 1-10
  month_key: string;
}

export interface AppData {
  habits: Habit[];
  tasks: DailyTask[];
  mentalState: MentalState[];
}

export interface DayStats {
  day: number;
  percentage: number;
}
