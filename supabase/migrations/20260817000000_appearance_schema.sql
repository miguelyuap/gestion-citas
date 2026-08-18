-- ====================================================================
-- OmniCitas - Schema de Apariencia & Temas Multi-Tenant
-- Migration: 20260817000000_appearance_schema.sql
-- ====================================================================

-- 1. Tabla TENANT_SETTINGS (Configuración general de contenido y Hero)
CREATE TABLE IF NOT EXISTS public.tenant_settings (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  template TEXT NOT NULL DEFAULT 'modern' CHECK (template IN ('modern', 'elegant', 'bold')),
  hero_title TEXT DEFAULT 'TU ESTILO. TU MOMENTO.',
  hero_subtitle TEXT DEFAULT 'Reserva tu próxima cita de manera rápida, sencilla y sin llamadas.',
  hero_image_url TEXT,
  hero_badge TEXT DEFAULT 'RESERVA ONLINE 24/7',
  hero_cta_text TEXT DEFAULT 'Reservar Cita',
  hero_secondary_cta_text TEXT DEFAULT 'Ver Servicios',
  about_title TEXT DEFAULT 'Sobre Nosotros',
  about_text TEXT DEFAULT 'Nos dedicamos a ofrecer experiencias de la más alta calidad con profesionales apasionados por su trabajo.',
  about_image_url TEXT,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla TENANT_THEME (Configuración de colores, fuentes y bordes)
CREATE TABLE IF NOT EXISTS public.tenant_theme (
  tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  primary_color VARCHAR(9) NOT NULL DEFAULT '#4f46e5',
  secondary_color VARCHAR(9) NOT NULL DEFAULT '#06b6d4',
  background_color VARCHAR(9) NOT NULL DEFAULT '#090d16',
  surface_color VARCHAR(9) NOT NULL DEFAULT '#111827',
  text_color VARCHAR(9) NOT NULL DEFAULT '#f9fafb',
  muted_text_color VARCHAR(9) NOT NULL DEFAULT '#9ca3af',
  accent_color VARCHAR(9) NOT NULL DEFAULT '#f59e0b',
  font_family TEXT NOT NULL DEFAULT 'Inter',
  border_radius TEXT NOT NULL DEFAULT '0.75rem',
  button_style TEXT NOT NULL DEFAULT 'rounded',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabla TENANT_SECTIONS (Control de visibilidad y orden de secciones)
CREATE TABLE IF NOT EXISTS public.tenant_sections (
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL, -- 'hero', 'services', 'staff', 'about', 'gallery', 'testimonials', 'booking_cta', 'contact'
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (tenant_id, section_key)
);

-- 4. Tabla TENANT_SOCIALS (Redes sociales y WhatsApp)
CREATE TABLE IF NOT EXISTS public.tenant_socials (
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  instagram TEXT,
  facebook TEXT,
  tiktok TEXT,
  whatsapp TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabla TENANT_GALLERY (Galería de imágenes)
CREATE TABLE IF NOT EXISTS public.tenant_gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_gallery ON public.tenant_gallery (tenant_id, display_order);

-- 6. Tabla TENANT_TESTIMONIALS (Testimonios y opiniones)
CREATE TABLE IF NOT EXISTS public.tenant_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_avatar TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tenant_testimonials ON public.tenant_testimonials (tenant_id, display_order);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_theme ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_socials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_testimonials ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE LECTURA PÚBLICA (para el sitio público /[slug])
CREATE POLICY "Public read tenant_settings" ON public.tenant_settings
  FOR SELECT USING (true);

CREATE POLICY "Public read tenant_theme" ON public.tenant_theme
  FOR SELECT USING (true);

CREATE POLICY "Public read tenant_sections" ON public.tenant_sections
  FOR SELECT USING (true);

CREATE POLICY "Public read tenant_socials" ON public.tenant_socials
  FOR SELECT USING (true);

CREATE POLICY "Public read tenant_gallery" ON public.tenant_gallery
  FOR SELECT USING (true);

CREATE POLICY "Public read tenant_testimonials" ON public.tenant_testimonials
  FOR SELECT USING (true);

-- POLÍTICAS DE GESTIÓN AUTENTICADA (para el panel de administración /dashboard/appearance)
CREATE POLICY "Tenant admin full access tenant_settings" ON public.tenant_settings
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant admin full access tenant_theme" ON public.tenant_theme
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant admin full access tenant_sections" ON public.tenant_sections
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant admin full access tenant_socials" ON public.tenant_socials
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant admin full access tenant_gallery" ON public.tenant_gallery
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "Tenant admin full access tenant_testimonials" ON public.tenant_testimonials
  FOR ALL USING (tenant_id = public.get_current_tenant_id());

-- ====================================================================
-- SUPABASE STORAGE BUCKET: tenant-assets
-- ====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tenant-assets', 'tenant-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access for tenant assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'tenant-assets');

CREATE POLICY "Tenant Admin upload assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tenant-assets' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Tenant Admin manage assets" ON storage.objects
  FOR ALL USING (
    bucket_id = 'tenant-assets' AND
    auth.role() = 'authenticated'
  );
