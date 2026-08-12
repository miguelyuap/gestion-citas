import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Calendar, Scissors, Users, Clock, ExternalLink, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Obtener la sesión activa del usuario
  const { data: { user } } = await supabase.auth.getUser();

  // Si no está autenticado en producción, redirigir a login
  if (!user) {
    redirect('/login');
  }

  // 2. Consultar el perfil y el negocio (tenant) asociado al usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, tenants(*)')
    .eq('id', user.id)
    .single();

  const tenant = profile?.tenants;

  // 3. Consultar métricas del negocio (servicios activos, staff, citas del día)
  const { count: servicesCount } = await supabase
    .from('services')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant?.id || '');

  const { count: staffCount } = await supabase
    .from('staff')
    .select('*', { count: 'exact', head: true })
    .eq('tenant_id', tenant?.id || '');

  const { count: appointmentsCount, data: recentAppointments } = await supabase
    .from('appointments')
    .select('*, services(name), clients(name, phone)')
    .eq('tenant_id', tenant?.id || '')
    .order('start_time', { ascending: true })
    .limit(5);

  const publicBookingUrl = tenant?.slug ? `/${tenant.slug}/book` : '/';

  return (
    <div className="space-y-8">
      {/* Top Banner de Bienvenida */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/30 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Negocio Activo</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {tenant?.name || 'Mi Negocio en Gestión Citas'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Bienvenido, <span className="text-slate-200 font-semibold">{profile?.full_name || 'Administrador'}</span>. Aquí está el resumen de tu agenda.
          </p>
        </div>

        {tenant?.slug && (
          <a
            href={publicBookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/20 flex-shrink-0"
          >
            Ver Mi Página Pública <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Grid de Tarjetas de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase">Citas Registradas</span>
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{appointmentsCount || 0}</p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Citas totales en agenda
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase">Servicios</span>
            <Scissors className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{servicesCount || 0}</p>
          <Link href="/services" className="text-xs text-indigo-400 hover:underline inline-block">
            Gestionar catálogo →
          </Link>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase">Personal / Equipo</span>
            <Users className="w-5 h-5 text-pink-400" />
          </div>
          <p className="text-3xl font-extrabold text-white">{staffCount || 0}</p>
          <Link href="/staff" className="text-xs text-indigo-400 hover:underline inline-block">
            Gestionar especialistas →
          </Link>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-semibold uppercase">Estado de Cuenta</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400">Activo (SaaS)</p>
          <p className="text-xs text-slate-400">Prueba gratuita activada</p>
        </div>
      </div>

      {/* Sección Próximas Citas */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" /> Próximas Citas en Agenda
          </h2>
          <Link href="/appointments" className="text-xs text-indigo-400 hover:underline">
            Ver todas
          </Link>
        </div>

        {!recentAppointments || recentAppointments.length === 0 ? (
          <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto opacity-80" />
            <p className="font-semibold text-white">No tienes citas agendadas por el momento.</p>
            <p className="text-xs text-slate-400">
              Comparte tu enlace público{' '}
              <span className="text-indigo-400 font-mono">
                gestioncitas.com/{tenant?.slug || 'tu-negocio'}
              </span>{' '}
              con tus clientes para empezar a recibir reservas.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {recentAppointments.map((app: any) => (
              <div key={app.id} className="py-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-white">{app.clients?.name || 'Cliente'}</p>
                  <p className="text-xs text-slate-400">{app.services?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-indigo-400">{new Date(app.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {app.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
