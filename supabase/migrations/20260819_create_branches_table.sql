-- Migración para crear la tabla de Sucursales (branches)
CREATE TABLE IF NOT EXISTS public.branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar consultas por tenant
CREATE INDEX IF NOT EXISTS idx_branches_tenant_id ON public.branches(tenant_id);

-- Habilitar RLS
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad RLS
CREATE POLICY "Permitir lectura a miembros del tenant"
ON public.branches FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Permitir escritura a administradores del tenant"
ON public.branches FOR ALL
USING (
    tenant_id IN (
        SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
    )
);
