import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid environment variables exist
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

let supabaseInstance = null;
if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn('Failed to create Supabase client, using LocalStorage fallback:', e.message);
  }
}
export const supabase = supabaseInstance;

console.log(
  isSupabaseConfigured 
    ? '⚡ Dashboard connected to Supabase Cloud Database.' 
    : '📦 Supabase env variables missing or placeholders. Using LocalStorage fallback.'
);

// LocalStorage helpers for fallback
const getLocalData = (key) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : {};
  } catch (e) {
    console.error('Error reading localStorage', e);
    return {};
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
};

/**
 * DB Layer API
 */
export const db = {
  isMock: !isSupabaseConfigured,

  // Fetch daily habits state for a specific date (YYYY-MM-DD)
  async getDailyHabit(date) {
    if (supabase) {
      const { data, error } = await supabase
        .from('daily_habits')
        .select('*')
        .eq('date', date)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching daily habits from Supabase:', error);
        throw error;
      }
      return data || null;
    } else {
      const localHabits = getLocalData('daily_habits');
      return localHabits[date] || null;
    }
  },

  // Save/Upsert daily habits state for a specific date
  async saveDailyHabit(date, { tasks, reading_subject_1, reading_subject_2, supplements }) {
    const record = {
      date,
      completed_tasks: tasks || [],
      reading_subject_1: reading_subject_1 || '',
      reading_subject_2: reading_subject_2 || '',
      completed_supplements: supplements || [],
      updated_at: new Date().toISOString(),
    };

    if (supabase) {
      const { error } = await supabase
        .from('daily_habits')
        .upsert(record, { onConflict: 'date' });
      
      if (error) {
        console.error('Error saving daily habits to Supabase:', error);
        throw error;
      }
      return record;
    } else {
      const localHabits = getLocalData('daily_habits');
      localHabits[date] = {
        ...record,
        created_at: localHabits[date]?.created_at || new Date().toISOString()
      };
      setLocalData('daily_habits', localHabits);
      return localHabits[date];
    }
  },

  // Fetch history of daily habits (past X days)
  async getDailyHistory(limit = 14) {
    if (supabase) {
      const { data, error } = await supabase
        .from('daily_habits')
        .select('*')
        .order('date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching daily history from Supabase:', error);
        throw error;
      }
      return data || [];
    } else {
      const localHabits = getLocalData('daily_habits');
      return Object.values(localHabits)
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, limit);
    }
  },

  // Fetch weekly accountability state for a specific Friday (YYYY-MM-DD)
  async getWeeklyAccountability(weekStartDate) {
    if (supabase) {
      const { data, error } = await supabase
        .from('weekly_accountability')
        .select('*')
        .eq('week_start_date', weekStartDate)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching weekly accountability from Supabase:', error);
        throw error;
      }
      return data || null;
    } else {
      const localAcc = getLocalData('weekly_accountability');
      return localAcc[weekStartDate] || null;
    }
  },

  // Save/Upsert weekly accountability
  async saveWeeklyAccountability(weekStartDate, disciplined) {
    const record = {
      week_start_date: weekStartDate,
      disciplined: !!disciplined,
      updated_at: new Date().toISOString()
    };

    if (supabase) {
      const { error } = await supabase
        .from('weekly_accountability')
        .upsert(record, { onConflict: 'week_start_date' });
      
      if (error) {
        console.error('Error saving weekly accountability to Supabase:', error);
        throw error;
      }
      return record;
    } else {
      const localAcc = getLocalData('weekly_accountability');
      localAcc[weekStartDate] = {
        ...record,
        created_at: localAcc[weekStartDate]?.created_at || new Date().toISOString()
      };
      setLocalData('weekly_accountability', localAcc);
      return localAcc[weekStartDate];
    }
  },

  // Fetch all weekly accountability records
  async getWeeklyHistory(limit = 12) {
    if (supabase) {
      const { data, error } = await supabase
        .from('weekly_accountability')
        .select('*')
        .order('week_start_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching weekly history from Supabase:', error);
        throw error;
      }
      return data || [];
    } else {
      const localAcc = getLocalData('weekly_accountability');
      return Object.values(localAcc)
        .sort((a, b) => b.week_start_date.localeCompare(a.week_start_date))
        .slice(0, limit);
    }
  }
};
