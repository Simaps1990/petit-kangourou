import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour la base de données
export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          service_id: string;
          service_name: string;
          date: string;
          time: string;
          client_name: string;
          client_email: string;
          client_phone: string;
          baby_age: string;
          notes: string;
          status: 'confirmed' | 'pending' | 'cancelled';
          spots_reserved: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      services: {
        Row: {
          id: string;
          title: string;
          description: string;
          price: string;
          duration: string;
          icon: string;
          max_spots: number;
          type: 'individual' | 'group';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['services']['Insert']>;
      };
      time_slots: {
        Row: {
          id: string;
          date: string;
          time: string;
          available: boolean;
          max_spots: number;
          booked_spots: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['time_slots']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['time_slots']['Insert']>;
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          excerpt: string;
          content: string;
          image: string;
          date: string;
          read_time: string;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>;
      };
      faqs: {
        Row: {
          id: string;
          question: string;
          answer: string;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['faqs']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['faqs']['Insert']>;
      };
      site_settings: {
        Row: {
          id: string;
          site_name: string;
          site_description: string;
          contact_email: string;
          contact_phone: string;
          address: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>;
      };
    };
  };
}
