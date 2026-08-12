export type UserRole = 'owner' | 'admin' | 'staff';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  timezone: string;
  category?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  tenant_id: string;
  full_name: string;
  avatar_url?: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  duration_minutes: number;
  buffer_time_minutes: number;
  price: number;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface Staff {
  id: string;
  tenant_id: string;
  profile_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkingHour {
  id: string;
  tenant_id: string;
  staff_id?: string | null;
  day_of_week: number; // 0=Sunday, 1=Monday, ...
  start_time: string; // HH:mm:ss
  end_time: string; // HH:mm:ss
  is_day_off: boolean;
  break_start?: string | null; // HH:mm:ss
  break_end?: string | null; // HH:mm:ss
}

export interface Client {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  service_id: string;
  staff_id: string;
  client_id: string;
  start_time: string; // ISO string
  end_time: string; // ISO string
  status: AppointmentStatus;
  total_price: number;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  formattedStart: string;
  formattedEnd: string;
  available: boolean;
  reason?: string;
}
