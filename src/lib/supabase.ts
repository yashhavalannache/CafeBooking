import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

export type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  image_url: string | null;
  rating: number;
  prep_time: number;
  is_vegetarian: boolean;
  is_bestseller: boolean;
  is_todays_special: boolean;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  categories?: Category;
};

export type Review = {
  id: string;
  customer_name: string;
  customer_avatar: string | null;
  rating: number;
  comment: string;
  is_featured: boolean;
  created_at: string;
};

export type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type Reservation = {
  id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  seating_type: string;
  ac_preference: string;
  occasion: string;
  table_number: number | null;
  special_requests: string | null;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  created_at: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};
