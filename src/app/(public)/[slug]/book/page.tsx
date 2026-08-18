import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TimeSlotPicker } from '@/components/booking/TimeSlotPicker';
import { createClient } from '@/lib/supabase/server';
import { ThemeProvider } from '@/components/public/shared/ThemeProvider';
import { DEFAULT_THEME } from '@/lib/theme/presets';
import { ArrowLeft, Calendar, Scissors } from 'lucide-react';
import { CompleteTenantAppearance } from '@/types/theme';

interface PublicBookingPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ serviceId?: string }>;
}

export async function generateMetadata({ params }: PublicBookingPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  const titleName = tenant?.name || slug;

  return {
    title: `Reservar Cita | ${titleName}`,
    description: `Selecciona tu fecha y horario para agendar tu cita en ${titleName}.`,
  };
}

export default async function PublicBookingPage({ params, searchParams }: PublicBookingPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const serviceIdParam = resolvedSearchParams.serviceId;

  if (!slug) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Cargar Tenant por Slug
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!tenant) {
    notFound();
  }

  const tenantId = tenant.id;

  // 2. Cargar Servicios, Staff, WorkingHours y Citas en paralelo
  const [
    { data: theme },
    { data: services },
    { data: staffList },
    { data: workingHours },
    { data: appointments },
  ] = await Promise.all([
    supabase.from('tenant_theme').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('services').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
    supabase.from('staff').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
    supabase.from('working_hours').select('*').eq('tenant_id', tenantId),
    supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', tenantId)
      .neq('status', 'cancelled')
      .gte('start_time', new Date().toISOString()),
  ]);

  const activeServices = services || [];
  const activeStaff = staffList || [];

  // Seleccionar el servicio inicial
  const selectedService =
    activeServices.find((s) => s.id === serviceIdParam) || activeServices[0] || null;

  const currentTheme = theme || DEFAULT_THEME;

  return (
    <ThemeProvider theme={currentTheme}>
      <div className="min-h-screen py-8 px-4 bg-[var(--background)]">
        <div className="max-w-4xl mx-auto mb-8">
          <Link
            href={`/${slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la página principal
          </Link>

          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              <Calendar className="w-3.5 h-3.5" />
              Proceso de Agendamiento Online
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] capitalize">
              Reservar Cita en {tenant.name}
            </h1>
            <p className="text-[var(--muted)] text-sm">
              Elige tu servicio, profesional, fecha y horario disponible.
            </p>
          </div>
        </div>

        {activeServices.length === 0 || activeStaff.length === 0 ? (
          <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-3">
            <Scissors className="w-10 h-10 text-amber-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Servicios o Equipo en Configuración</h2>
            <p className="text-xs text-slate-400">
              El negocio aún no ha habilitado servicios o miembros del equipo activos para el agendamiento online. Inténtalo más tarde.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto bg-[var(--surface)] p-4 sm:p-8 rounded-3xl border border-[var(--foreground)]/10 shadow-2xl">
            <TimeSlotPicker
              tenantSlug={slug}
              service={selectedService!}
              staffMembers={activeStaff}
              workingHours={workingHours || []}
              allAppointments={appointments || []}
            />
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
