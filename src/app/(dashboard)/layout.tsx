import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tenantName = 'Mi Negocio';
  let tenantSlug: string | undefined = undefined;
  let userName = user?.email ? user.email.split('@')[0] : 'Administrador';
  let logoUrl: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, tenants(name, slug, logo_url)')
      .eq('id', user.id)
      .single();

    if (profile) {
      if (profile.full_name) userName = profile.full_name;
      const tenantObj = profile.tenants as any;
      if (tenantObj) {
        tenantName = tenantObj.name || tenantName;
        tenantSlug = tenantObj.slug || undefined;
        logoUrl = tenantObj.logo_url || null;
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-100 font-sans">
      {/* Interactive Responsive Sidebar */}
      <DashboardSidebar
        tenantName={tenantName}
        tenantSlug={tenantSlug}
        userName={userName}
        userEmail={user?.email}
        logoUrl={logoUrl}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
