
import { supabase } from './supabase';
import { Habit, DailyTask, MentalState, AppData } from '../types';

// --- Helper Functions ---
export const getMonthKey = (date: Date = new Date()) => 
  `${date.getFullYear()}-${date.getMonth() + 1}`;

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred.';
};

// --- Data Management (Supabase Only) ---
// Using v3 key to force fresh sync if we were using local storage before
const STORAGE_VERSION = 'v3';

export const fetchData = async (userId: string, monthKey: string): Promise<AppData> => {
  if (!supabase) {
    throw new Error("Supabase client is not initialized.");
  }

  try {
    const [habitsRes, tasksRes, mentalRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', userId).eq('month_key', monthKey),
        supabase.from('daily_tasks').select('*').eq('user_id', userId).eq('month_key', monthKey),
        supabase.from('mental_states').select('*').eq('user_id', userId).eq('month_key', monthKey)
    ]);

    if (habitsRes.error) throw habitsRes.error;
    if (tasksRes.error) throw tasksRes.error;
    if (mentalRes.error) throw mentalRes.error;
    
    return {
        habits: habitsRes.data || [],
        tasks: tasksRes.data || [],
        mentalState: mentalRes.data || [],
    };

  } catch (err) {
    console.error("Supabase fetch data failed:", err);
    throw new Error(`Failed to load data from the database. Reason: ${getErrorMessage(err)}`);
  }
};

export const saveHabit = async (habit: Habit) => {
    const { error } = await supabase.from('habits').upsert(habit);
    if (error) {
        console.error("Supabase saveHabit error:", error);
        throw error;
    }
};

export const deleteHabit = async (habitId: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    if (error) {
        console.error("Supabase deleteHabit error:", error);
        throw error;
    }
};

export const saveTask = async (task: DailyTask) => {
    const { error } = await supabase.from('daily_tasks').upsert(task);
    if (error) {
        console.error("Supabase saveTask error:", error);
        throw error;
    }
};

export const deleteTask = async (taskId: string) => {
    const { error } = await supabase.from('daily_tasks').delete().eq('id', taskId);
    if (error) {
        console.error("Supabase deleteTask error:", error);
        throw error;
    }
};

export const saveMentalState = async (state: MentalState) => {
    const { error } = await supabase.from('mental_states').upsert(state, { onConflict: 'user_id, month_key, day' });
    if (error) {
        console.error("Supabase saveMentalState error:", error);
        throw error;
    }
};


