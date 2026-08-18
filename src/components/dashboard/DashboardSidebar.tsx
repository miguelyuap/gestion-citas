'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Users,
  Clock,
  Palette,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { signOutAction } from '@/app/(auth)/actions';

interface DashboardSidebarProps {
  tenantName?: string;
  tenantSlug?: string;
  userEmail?: string;
  userName?: string;
  logoUrl?: string | null;
}

export function DashboardSidebar({
  tenantName = 'Mi Negocio',
  tenantSlug,
  userEmail,
  userName = 'Administrador',
  logoUrl,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/appointments', label: 'Citas', icon: Calendar },
    { href: '/services', label: 'Servicios', icon: Scissors },
    { href: '/staff', label: 'Personal', icon: Users },
    { href: '/schedules', label: 'Horarios', icon: Clock },
    { href: '/dashboard/appearance', label: 'Apariencia', icon: Palette },
    { href: '/notifications', label: 'Notificaciones', icon: Bell },
    { href: '/settings', label: 'Configuración', icon: Settings },
  ];

  const publicBookingUrl = tenantSlug ? `/${tenantSlug}` : '#';

  return (
    <>
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={tenantName} className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
              {tenantName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h2 className="font-bold text-xs text-white truncate max-w-[150px]">{tenantName}</h2>
            <p className="text-[10px] text-slate-400">Panel de Administración</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 border border-slate-700"
          aria-label="Abrir Menú"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop Overlay for Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between p-4 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Header Brand */}
          <div className="flex items-center gap-3 px-2 py-1 border-b border-slate-800/80 pb-4">
            {logoUrl ? (
              <img src={logoUrl} alt={tenantName} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-indigo-600/30">
                {tenantName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <h2 className="font-extrabold text-sm text-white truncate">{tenantName}</h2>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> SaaS Active
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-sm font-medium">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard' || pathname === '/'
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/25 border border-indigo-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.href === '/dashboard/appearance' && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar Info & Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          {tenantSlug && (
            <a
              href={publicBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-400 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/50 transition"
            >
              <span className="truncate">Ver Página Pública</span>
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </a>
          )}

          <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate">{userEmail || 'Tenant Admin'}</p>
          </div>

          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
