import { supabase } from './supabase';

// ============================================
// SERVICES CRUD
// ============================================

export const servicesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id', { ascending: true });
    return { data, error };
  },

  async create(service: any) {
    const { data, error } = await supabase
      .from('services')
      .insert([service])
      .select();
    return { data, error };
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    return { error };
  },
};

// ============================================
// BLOG POSTS CRUD
// ============================================

export const blogService = {
  async getAll() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async create(post: any) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([post])
      .select();
    return { data, error };
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);
    return { error };
  },
};

// ============================================
// FAQ CRUD
// ============================================

export const faqService = {
  async getAll() {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order', { ascending: true });
    return { data, error };
  },

  async create(faq: any) {
    const { data, error } = await supabase
      .from('faqs')
      .insert([faq])
      .select();
    return { data, error };
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select();
    return { data, error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    return { error };
  },
};

// ============================================
// BOOKINGS
// ============================================

export const bookingsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id);
    return { error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    return { error };
  },
};

// ============================================
// TIME SLOTS
// ============================================

export const timeSlotsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    return { data, error };
  },

  async create(slot: any) {
    const { data, error } = await supabase
      .from('time_slots')
      .insert([slot])
      .select();
    return { data, error };
  },

  async updateAvailability(id: string, available: boolean) {
    const { error } = await supabase
      .from('time_slots')
      .update({ available })
      .eq('id', id);
    return { error };
  },

  async updateMaxSpots(id: string, maxSpots: number) {
    const { error } = await supabase
      .from('time_slots')
      .update({ max_spots: maxSpots })
      .eq('id', id);
    return { error };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', id);
    return { error };
  },
};

// ============================================
// SITE SETTINGS
// ============================================

export const settingsService = {
  async get() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single();
    return { data, error };
  },

  async update(settings: any) {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({
        id: 'main',
        site_name: settings.siteName,
        site_description: settings.siteDescription,
        contact_email: settings.contactEmail,
        contact_phone: settings.contactPhone,
        address: settings.address
      })
      .select();
    return { data, error };
  },
};
