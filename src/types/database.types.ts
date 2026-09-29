export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          color_theme: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          color_theme?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          color_theme?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          date: string;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          date: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          date?: string;
          is_completed?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'habit_logs_habit_id_fkey';
            columns: ['habit_id'];
            isOneToOne: false;
            referencedRelation: 'habits';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_user_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitInsert = Database['public']['Tables']['habits']['Insert'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type HabitLogInsert = Database['public']['Tables']['habit_logs']['Insert'];

export interface HabitWithLogs extends Habit {
  logs: Record<string, boolean>; // date (YYYY-MM-DD) -> is_completed
  currentStreak?: number;
  completionRate?: number;
}
