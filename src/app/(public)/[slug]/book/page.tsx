import React from 'react';
import { notFound } from 'next/navigation';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { Service, Staff, WorkingHour, Appointment } from '@/types/database';

interface PublicBookingPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicBookingPage({ params }: PublicBookingPageProps) {
  const { slug } = await params;

  // En producción, consulta Supabase pasando el slug para recuperar el negocio:
  // const tenant = await supabase.from('tenants').select('*').eq('slug', slug).single();

  if (!slug) {
    notFound();
  }

  // Servicio y datos de demostración para el negocio dinámico
  const mockService: Service = {
    id: 'srv-demo',
    tenant_id: 'tenant-123',
    name: 'Consulta / Servicio General',
    description: `Reserva tu cita online para el negocio @${slug}`,
    duration_minutes: 60,
    buffer_time_minutes: 15,
    price: 45.0,
    currency: 'USD',
    is_active: true,
    created_at: new Date().toISOString(),
  };

  const mockStaff: Staff[] = [
    {
      id: 'staff-a',
      tenant_id: 'tenant-123',
      name: 'Especialista Principal',
      color: '#6366f1',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const mockWorkingHours: Record<string, WorkingHour[]> = {
    'staff-a': [
      { id: 'wh-1', tenant_id: 'tenant-123', staff_id: 'staff-a', day_of_week: 1, start_time: '08:00:00', end_time: '17:00:00', is_day_off: false },
      { id: 'wh-2', tenant_id: 'tenant-123', staff_id: 'staff-a', day_of_week: 2, start_time: '08:00:00', end_time: '17:00:00', is_day_off: false },
      { id: 'wh-3', tenant_id: 'tenant-123', staff_id: 'staff-a', day_of_week: 3, start_time: '08:00:00', end_time: '17:00:00', is_day_off: false },
      { id: 'wh-4', tenant_id: 'tenant-123', staff_id: 'staff-a', day_of_week: 4, start_time: '08:00:00', end_time: '17:00:00', is_day_off: false },
      { id: 'wh-5', tenant_id: 'tenant-123', staff_id: 'staff-a', day_of_week: 5, start_time: '08:00:00', end_time: '17:00:00', is_day_off: false },
    ],
  };

  const mockAppointments: Record<string, Appointment[]> = {
    'staff-a': [],
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Reserva Directa</span>
        <h1 className="text-3xl font-extrabold text-white mt-1 capitalize">Agendar en {slug.replace('-', ' ')}</h1>
        <p className="text-slate-400 text-sm mt-1">URL Pública de Agendamiento Personalizada</p>
      </div>

      <TimeSlotPicker
        service={mockService}
        staffMembers={mockStaff}
        workingHoursMap={mockWorkingHours}
        existingAppointmentsMap={mockAppointments}
      />
    </div>
  );
}
