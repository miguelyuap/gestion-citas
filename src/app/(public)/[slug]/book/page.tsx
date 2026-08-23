import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ClientPortalContainer } from '@/components/public/client/ClientPortalContainer';
import { getCurrentClientAction } from '../client-auth';
import { CompleteTenantAppearance } from '@/types/theme';
import { DEFAULT_COMPLETE_APPEARANCE } from '@/lib/theme/presets';

interface PublicBookingPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ serviceId?: string; staffId?: string; branchId?: string }>;
}

export async function generateMetadata({ params }: PublicBookingPageProps): Promise<Metadata> {
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
  const staffIdParam = resolvedSearchParams.staffId;
  const branchIdParam = resolvedSearchParams.branchId;

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

  // 2. Cargar Servicios, Staff, Sucursales, WorkingHours y Citas en paralelo
  const [
    { data: settings },
    { data: theme },
    { data: sections },
    { data: socials },
    { data: gallery },
    { data: testimonials },
    { data: services },
    { data: staffList },
    { data: branches },
    { data: workingHours },
    { data: appointments },
    clientData,
  ] = await Promise.all([
    supabase.from('tenant_settings').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('tenant_theme').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('tenant_sections').select('*').eq('tenant_id', tenantId).order('display_order', { ascending: true }),
    supabase.from('tenant_socials').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('tenant_gallery').select('*').eq('tenant_id', tenantId).order('display_order', { ascending: true }),
    supabase.from('tenant_testimonials').select('*').eq('tenant_id', tenantId).order('display_order', { ascending: true }),
    supabase.from('services').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
    supabase.from('staff').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('name'),
    supabase.from('branches').select('*').eq('tenant_id', tenantId).eq('is_active', true),
    supabase.from('working_hours').select('*').eq('tenant_id', tenantId),
    supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', tenantId)
      .neq('status', 'cancelled')
      .gte('start_time', new Date().toISOString()),
    getCurrentClientAction(slug),
  ]);

  const activeServices = services || [];

  const appearance: CompleteTenantAppearance = {
    settings: {
      ...DEFAULT_COMPLETE_APPEARANCE.settings,
      ...(settings || {}),
    },
    theme: {
      ...DEFAULT_COMPLETE_APPEARANCE.theme,
      ...(theme || {}),
    },
    sections: sections && sections.length > 0 ? sections : DEFAULT_COMPLETE_APPEARANCE.sections,
    socials: {
      ...DEFAULT_COMPLETE_APPEARANCE.socials,
      ...(socials || {}),
    },
    gallery: gallery || [],
    testimonials: testimonials || [],
  };

  return (
    <ClientPortalContainer
      tenant={tenant}
      appearance={appearance}
      services={activeServices}
      staffList={staffList || []}
      branches={branches || []}
      workingHours={workingHours || []}
      appointments={appointments || []}
      initialClientData={clientData}
      initialView="booking"
      initialStaffId={staffIdParam}
      initialServiceId={serviceIdParam}
      initialBranchId={branchIdParam}
    />
  );
}
