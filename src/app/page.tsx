import React from 'react';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { Service, Staff, WorkingHour, Appointment } from '@/types/database';
import { Calendar, ShieldCheck, Zap, Users, Sparkles, Building2 } from 'lucide-react';

// Datos de demostración (Mock Data) para probar el componente de disponibilidad sin backend conectado aún
const mockService: Service = {
  id: 'srv-1',
  tenant_id: 'tenant-demo',
  name: 'Corte de Cabello & Barba Premium',
  description: 'Incluye lavado, asesoria de imagen, perfilado de barba con toalla caliente y styling.',
  duration_minutes: 45,
  buffer_time_minutes: 15,
  price: 35.0,
  currency: 'USD',
  is_active: true,
  created_at: new Date().toISOString(),
};

const mockStaffMembers: Staff[] = [
  {
    id: 'staff-1',
    tenant_id: 'tenant-demo',
    name: 'Carlos Mendoza',
    email: 'carlos@omnicitas.com',
    color: '#3b82f6',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'staff-2',
    tenant_id: 'tenant-demo',
    name: 'Sofía Ramírez',
    email: 'sofia@omnicitas.com',
    color: '#ec4899',
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'staff-3',
    tenant_id: 'tenant-demo',
    name: 'Mateo Ortiz',
    email: 'mateo@omnicitas.com',
    color: '#10b981',
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

const mockWorkingHoursMap: Record<string, WorkingHour[]> = {
  'staff-1': [
    { id: 'wh-1', tenant_id: 'tenant-demo', staff_id: 'staff-1', day_of_week: 0, start_time: '09:00:00', end_time: '18:00:00', is_day_off: true },
    { id: 'wh-2', tenant_id: 'tenant-demo', staff_id: 'staff-1', day_of_week: 1, start_time: '09:00:00', end_time: '18:00:00', is_day_off: false, break_start: '13:00:00', break_end: '14:00:00' },
    { id: 'wh-3', tenant_id: 'tenant-demo', staff_id: 'staff-1', day_of_week: 2, start_time: '09:00:00', end_time: '18:00:00', is_day_off: false, break_start: '13:00:00', break_end: '14:00:00' },
    { id: 'wh-4', tenant_id: 'tenant-demo', staff_id: 'staff-1', day_of_week: 3, start_time: '09:00:00', end_time: '18:00:00', is_day_off: false, break_start: '13:00:00', break_end: '14:00:00' },
    { id: 'wh-5', tenant_id: 'tenant-demo', staff_id: 'staff-1', day_of_week: 4, start_time: '09:00:00', end_time: '18:00:00', is_day_off: false, break_start: '13:00:00', break_end: '14:00:00' },
    { id: 'wh-6', tenant_id: 'tenant-demo', staff_id: 'staff-1', day_of_week: 5, start_time: '09:00:00', end_time: '18:00:00', is_day_off: false, break_start: '13:00:00', break_end: '14:00:00' },
    { id: 'wh-7', tenant_id: 'tenant-demo', staff_id: 'staff-1', day_of_week: 6, start_time: '09:00:00', end_time: '15:00:00', is_day_off: false },
  ],
  'staff-2': [
    { id: 'wh-8', tenant_id: 'tenant-demo', staff_id: 'staff-2', day_of_week: 1, start_time: '10:00:00', end_time: '19:00:00', is_day_off: false, break_start: '14:00:00', break_end: '15:00:00' },
  ],
  'staff-3': [
    { id: 'wh-9', tenant_id: 'tenant-demo', staff_id: 'staff-3', day_of_week: 1, start_time: '08:00:00', end_time: '17:00:00', is_day_off: false, break_start: '12:00:00', break_end: '13:00:00' },
  ]
};

// Citas existentes para simular solapamiento y probar el bloqueo de slots
const todayISO = new Date().toISOString().split('T')[0];

const mockAppointmentsMap: Record<string, Appointment[]> = {
  'staff-1': [
    {
      id: 'app-1',
      tenant_id: 'tenant-demo',
      service_id: 'srv-1',
      staff_id: 'staff-1',
      client_id: 'cli-1',
      start_time: `${todayISO}T10:00:00.000Z`,
      end_time: `${todayISO}T11:00:00.000Z`,
      status: 'confirmed',
      total_price: 35.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'app-2',
      tenant_id: 'tenant-demo',
      service_id: 'srv-1',
      staff_id: 'staff-1',
      client_id: 'cli-2',
      start_time: `${todayISO}T15:30:00.000Z`,
      end_time: `${todayISO}T16:15:00.000Z`,
      status: 'confirmed',
      total_price: 35.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background Glow Overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      {/* Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 backdrop-blur-md bg-slate-950/60 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/30">
              G
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Gestión <span className="text-indigo-400">Citas</span>
            </span>
            <span className="text-[10px] font-semibold tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase">
              SaaS Multi-Negocio
            </span>
          </div>

          <nav className="flex items-center gap-4 text-sm">
            <a href="#arquitectura" className="text-slate-400 hover:text-white transition">Arquitectura</a>
            <a href="#demo" className="text-slate-400 hover:text-white transition">Demo Agendamiento</a>
            <a href="#despliegue" className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition shadow-lg shadow-indigo-500/20">
              Comenzar
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Sistema de Gestión de Citas & Reservas Online
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-balance tracking-tight">
          La Infraestructura Multi-Tenant para <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Barberías, Estéticas y Consultorios
          </span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg">
          Gestión inteligente de horarios, cálculo en tiempo real de disponibilidad sin solapamiento de citas y URL personalizada para cada negocio.
        </p>

        {/* Feature badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-6 text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <Building2 className="w-5 h-5 text-indigo-400 mb-2" />
            <h3 className="font-semibold text-sm">Multi-Tenant Isolation</h3>
            <p className="text-xs text-slate-400 mt-1">Aislamiento estricto por `tenant_id` con Supabase RLS.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <Zap className="w-5 h-5 text-emerald-400 mb-2" />
            <h3 className="font-semibold text-sm">Anti-Solapamiento</h3>
            <p className="text-xs text-slate-400 mt-1">Exclusion constraints con btree_gist a nivel de PostgreSQL.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <Calendar className="w-5 h-5 text-purple-400 mb-2" />
            <h3 className="font-semibold text-sm">Next.js App Router</h3>
            <p className="text-xs text-slate-400 mt-1">Rutas modulares `/(dashboard)` y `/(public)/[slug]`.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
            <ShieldCheck className="w-5 h-5 text-pink-400 mb-2" />
            <h3 className="font-semibold text-sm">Seguridad Integrada</h3>
            <p className="text-xs text-slate-400 mt-1">Políticas de acceso RLS y Supabase SSR Auth.</p>
          </div>
        </div>
      </section>

      {/* Demo Interactiva Componente de Citas */}
      <section id="demo" className="relative z-10 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Demo Interactiva: Selector de Disponibilidad</h2>
          <p className="text-slate-400 text-sm mt-1">
            Prueba cómo la interfaz calcula slots en tiempo real bloqueando almuerzos y turnos ya tomados.
          </p>
        </div>

        <TimeSlotPicker
          service={mockService}
          staffMembers={mockStaffMembers}
          workingHoursMap={mockWorkingHoursMap}
          existingAppointmentsMap={mockAppointmentsMap}
        />
      </section>
    </main>
  );
}
