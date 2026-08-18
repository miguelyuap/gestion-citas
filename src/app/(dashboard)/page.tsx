import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  Calendar,
  Scissors,
  Users,
  Clock,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Palette,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Obtener sesión del usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 2. Obtener perfil y tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single();

  const tenant = profile?.tenants;
  const tenantId = tenant?.id || '';

  // 3. Rango de fecha de HOY
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 4. Consultas paralelas a Supabase con RLS
  const [
    { count: totalAppointments },
    { count: todayAppointments },
    { count: pendingAppointments },
    { count: confirmedAppointments },
    { count: clientsCount },
    { count: servicesCount },
    { count: staffCount },
    { data: recentAppointments },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString()),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'pending'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'confirmed'),
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId),
    supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true),
    supabase
      .from('staff')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true),
    supabase
      .from('appointments')
      .select('*, services(name), clients(name, phone), staff(name)')
      .eq('tenant_id', tenantId)
      .order('start_time', { ascending: true })
      .limit(6),
  ]);

  const publicBookingUrl = tenant?.slug ? `/${tenant.slug}` : '/';

  return (
    <div className="space-y-8">
      {/* Top Banner de Bienvenida */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-900/50 via-purple-900/30 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Negocio Activo
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {tenant?.name || 'Mi Negocio en Gestión Citas'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Bienvenido, <span className="text-slate-200 font-semibold">{profile?.full_name || 'Administrador'}</span>. Resumen general de tu plataforma.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/appearance"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
          >
            <Palette className="w-4 h-4 text-indigo-400" /> Personalizar Apariencia
          </Link>

          {tenant?.slug && (
            <a
              href={publicBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 flex-shrink-0"
            >
              Ver Mi Página Pública <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Grid Principal de 6 Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Citas de Hoy */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 hover:border-slate-700 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Citas de Hoy</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{todayAppointments || 0}</p>
          <p className="text-[11px] text-indigo-400 font-medium">Programadas para hoy</p>
        </div>

        {/* Citas Pendientes */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 hover:border-slate-700 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pendientes</span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-extrabold text-amber-400">{pendingAppointments || 0}</p>
          <p className="text-[11px] text-slate-400 font-medium">Por confirmar</p>
        </div>

        {/* Citas Confirmadas */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 hover:border-slate-700 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Confirmadas</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400">{confirmedAppointments || 0}</p>
          <p className="text-[11px] text-slate-400 font-medium">Listas en agenda</p>
        </div>

        {/* Clientes */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 hover:border-slate-700 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Clientes</span>
            <UserCheck className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{clientsCount || 0}</p>
          <p className="text-[11px] text-slate-400 font-medium">Registrados</p>
        </div>

        {/* Servicios Activos */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 hover:border-slate-700 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Servicios</span>
            <Scissors className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{servicesCount || 0}</p>
          <Link href="/services" className="text-[11px] text-indigo-400 hover:underline font-medium">
            Ver catálogo →
          </Link>
        </div>

        {/* Personal Activo */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-1 hover:border-slate-700 transition">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Personal</span>
            <Users className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{staffCount || 0}</p>
          <Link href="/staff" className="text-[11px] text-indigo-400 hover:underline font-medium">
            Ver equipo →
          </Link>
        </div>
      </div>

      {/* Próximas Citas y Acceso Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Próximas Citas (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" /> Próximas Citas en Agenda
            </h2>
            <Link href="/appointments" className="text-xs text-indigo-400 hover:underline font-medium">
              Ver agenda completa
            </Link>
          </div>

          {!recentAppointments || recentAppointments.length === 0 ? (
            <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
              <p className="font-semibold text-white">No tienes citas registradas actualmente.</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Comparte el enlace de tu sitio web público{' '}
                <span className="text-indigo-400 font-mono font-bold">
                  /{tenant?.slug || 'tu-negocio'}
                </span>{' '}
                para que tus clientes agenden sus turnos online 24/7.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {recentAppointments.map((app: any) => (
                <div key={app.id} className="py-3 flex items-center justify-between text-sm">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white">{app.clients?.name || 'Cliente'}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{app.services?.name || 'Servicio'}</span>
                      {app.staff?.name && (
                        <span className="text-[11px] text-slate-500">• {app.staff.name}</span>
                      )}
                    </p>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-mono text-indigo-400 font-bold text-xs">
                      {new Date(app.start_time).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(app.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        app.status === 'confirmed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : app.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel Lateral de Estado & Accesos Rápidos (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Resumen del Tenant
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Total de Citas</span>
                <span className="font-bold text-white font-mono">{totalAppointments || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800">
                <span className="text-slate-400">Página Pública</span>
                <span className="font-bold text-emerald-400">Activa</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Plan SaaS</span>
                <span className="font-bold text-indigo-400">Multi-Tenant Ready</span>
              </div>
            </div>

            <Link
              href="/dashboard/appearance"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-bold text-xs border border-indigo-500/30 transition"
            >
              <Palette className="w-4 h-4" /> Personalizar Sitio Público
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
