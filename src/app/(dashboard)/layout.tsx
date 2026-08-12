import React from 'react';
import Link from 'next/link';
import { Calendar, Users, Scissors, Clock, Settings, LayoutDashboard } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* Sidebar Sidebar Navegación */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-lg flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
              G
            </div>
            <div>
              <h2 className="font-bold text-sm">Gestión Citas</h2>
              <p className="text-[10px] text-slate-400">Panel de Administración</p>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
              <LayoutDashboard className="w-4 h-4" /> Resumen
            </Link>
            <Link href="/appointments" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition">
              <Calendar className="w-4 h-4" /> Agenda & Citas
            </Link>
            <Link href="/services" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition">
              <Scissors className="w-4 h-4" /> Catálogo Servicios
            </Link>
            <Link href="/staff" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition">
              <Users className="w-4 h-4" /> Equipo / Personal
            </Link>
            <Link href="/schedules" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition">
              <Clock className="w-4 h-4" /> Horarios de Atención
            </Link>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white text-sm">
            <Settings className="w-4 h-4" /> Configuración Negocio
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
