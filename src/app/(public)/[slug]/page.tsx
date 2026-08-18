import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { PublicPageRenderer } from '@/components/public/templates/PublicPageRenderer';
import { CompleteTenantAppearance } from '@/types/theme';
import { DEFAULT_COMPLETE_APPEARANCE } from '@/lib/theme/presets';

interface PublicTenantPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PublicTenantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant } = await supabase
    .from('tenants')
    .select('name, category')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  const titleName = tenant?.name || slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${titleName} | Reserva tu cita online 24/7`,
    description: `Agenda tu turno online con ${titleName}. Elige servicio, profesional y horario de forma rápida y sencilla.`,
    openGraph: {
      title: `${titleName} | Citas Online`,
      description: `Reserva tu cita online en ${titleName}`,
    },
  };
}

export default async function PublicTenantPage({ params }: PublicTenantPageProps) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Obtener el tenant por slug
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

  // 2. Cargar configuración completa de apariencia del tenant desde Supabase
  const [
    { data: settings },
    { data: theme },
    { data: sections },
    { data: socials },
    { data: gallery },
    { data: testimonials },
    { data: services },
    { data: staff },
    { data: workingHours },
  ] = await Promise.all([
    supabase.from('tenant_settings').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('tenant_theme').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('tenant_sections').select('*').eq('tenant_id', tenantId).order('display_order', { ascending: true }),
    supabase.from('tenant_socials').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase.from('tenant_gallery').select('*').eq('tenant_id', tenantId).order('display_order', { ascending: true }),
    supabase.from('tenant_testimonials').select('*').eq('tenant_id', tenantId).order('display_order', { ascending: true }),
    supabase.from('services').select('*').eq('tenant_id', tenantId).eq('is_active', true),
    supabase.from('staff').select('*').eq('tenant_id', tenantId).eq('is_active', true),
    supabase.from('working_hours').select('*').eq('tenant_id', tenantId),
  ]);

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
    <PublicPageRenderer
      tenant={tenant}
      appearance={appearance}
      services={services || []}
      staffList={staff || []}
      workingHours={workingHours || []}
      bookingUrl={`/${tenant.slug}/book`}
    />
  );
}
