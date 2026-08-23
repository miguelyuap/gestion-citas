'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, User, LogOut, LogIn } from 'lucide-react';
import { Tenant } from '@/types/database';
import { ClientNotificationsDropdown } from '../client/ClientNotificationsDropdown';
import { logoutClientAction } from '@/app/(public)/[slug]/client-auth';
import { useRouter } from 'next/navigation';

interface PublicNavbarProps {
  tenant: Tenant;
  bookingUrl?: string;
  authenticatedClient?: any;
  activeView?: 'landing' | 'booking' | 'appointments' | 'profile';
  onNavigateView?: (view: 'landing' | 'booking' | 'appointments' | 'profile') => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function PublicNavbar({
  tenant,
  authenticatedClient,
  activeView = 'landing',
  onNavigateView,
  onOpenAuth,
}: PublicNavbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isHeroPage = activeView === 'landing';
  const transparent = isHeroPage && !scrolled;

  const handleLogout = async () => {
    await logoutClientAction(tenant.slug);
    router.refresh();
  };

  const handleNav = (view: 'landing' | 'booking' | 'appointments' | 'profile') => {
    if (onNavigateView) {
      onNavigateView(view);
    }
  };

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300 font-[var(--font-sans)]"
      style={{
        background: transparent ? 'rgba(12,10,26,0.6)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(14px)',
        borderBottom: transparent ? '1px solid rgba(255,255,255,0.08)' : '1px solid var(--border,#E4E2EC)',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Name */}
          <button
            onClick={() => handleNav('landing')}
            className="flex items-center gap-2.5 group focus:outline-none text-left"
          >
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="w-8 h-8 rounded-xl object-cover transition-transform group-hover:scale-105 shadow-sm"
              />
            ) : (
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md"
                style={{ background: 'linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)' }}
              >
                <Calendar className="w-4 h-4 text-white" />
              </div>
            )}
            <span
              className={`font-display text-lg transition-colors ${
                transparent ? 'text-white' : 'text-[var(--foreground,#18181B)]'
              }`}
            >
              {tenant.name}
            </span>
          </button>

          {/* Desktop Navigation Options */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('landing')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                transparent
                  ? activeView === 'landing'
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                  : activeView === 'landing'
                  ? 'bg-[var(--secondary,#F0EFFE)] text-[var(--secondary-foreground,#4F35D2)] font-semibold'
                  : 'text-[var(--muted-foreground,#71717A)] hover:text-[var(--foreground)] hover:bg-[var(--secondary,#F0EFFE)]'
              }`}
            >
              Inicio
            </button>

            <button
              onClick={() => {
                if (activeView !== 'landing' && onNavigateView) {
                  onNavigateView('landing');
                  setTimeout(() => {
                    const el = document.getElementById('services');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                } else {
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                transparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-[var(--muted-foreground,#71717A)] hover:text-[var(--foreground)] hover:bg-[var(--secondary,#F0EFFE)]'
              }`}
            >
              Servicios
            </button>

            <button
              onClick={() => {
                if (activeView !== 'landing' && onNavigateView) {
                  onNavigateView('landing');
                  setTimeout(() => {
                    const el = document.getElementById('specialists') || document.getElementById('staff');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 150);
                } else {
                  const el = document.getElementById('specialists') || document.getElementById('staff');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                transparent
                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                  : 'text-[var(--muted-foreground,#71717A)] hover:text-[var(--foreground)] hover:bg-[var(--secondary,#F0EFFE)]'
              }`}
            >
              Especialistas
            </button>

            {authenticatedClient && (
              <button
                onClick={() => handleNav('appointments')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  transparent
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : activeView === 'appointments'
                    ? 'bg-[var(--secondary,#F0EFFE)] text-[var(--secondary-foreground,#4F35D2)] font-semibold'
                    : 'text-[var(--muted-foreground,#71717A)] hover:text-[var(--foreground)] hover:bg-[var(--secondary,#F0EFFE)]'
                }`}
              >
                Mis citas
              </button>
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {authenticatedClient ? (
              <>
                <ClientNotificationsDropdown tenantSlug={tenant.slug} />

                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`flex items-center gap-2 p-1.5 pl-3 rounded-xl transition-colors ${
                      transparent ? 'hover:bg-white/10' : 'hover:bg-[var(--secondary,#F0EFFE)]'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-full overflow-hidden border-2 flex items-center justify-center font-bold text-xs bg-[var(--primary,#4F35D2)] text-white"
                      style={{ borderColor: transparent ? 'rgba(255,255,255,0.3)' : 'var(--border,#E4E2EC)' }}
                    >
                      {authenticatedClient.name?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <span className={`text-sm font-medium ${transparent ? 'text-white' : 'text-[var(--foreground,#18181B)]'}`}>
                      {authenticatedClient.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 ${transparent ? 'text-white/60' : 'text-[var(--muted-foreground)]'}`} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[var(--card,#ffffff)] rounded-2xl shadow-xl border border-[var(--border,#E4E2EC)] overflow-hidden animate-scale-in z-50">
                      <button
                        onClick={() => {
                          handleNav('profile');
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-[var(--foreground,#18181B)] hover:bg-[var(--secondary,#F0EFFE)] transition-colors"
                      >
                        <User className="w-4 h-4 text-[var(--primary,#4F35D2)]" />
                        Mi perfil
                      </button>
                      <button
                        onClick={() => {
                          handleNav('appointments');
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-[var(--foreground,#18181B)] hover:bg-[var(--secondary,#F0EFFE)] transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-[var(--primary,#4F35D2)]" />
                        Mis citas
                      </button>
                      <div className="border-t border-[var(--border,#E4E2EC)]" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-[var(--danger,#EF4444)] hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {onOpenAuth && (
                  <button
                    onClick={() => onOpenAuth('login')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      transparent ? 'text-white/70 hover:text-white' : 'text-[var(--foreground)] hover:text-[var(--primary)]'
                    }`}
                  >
                    Iniciar sesión
                  </button>
                )}
                <button
                  onClick={() => {
                    if (!authenticatedClient && onOpenAuth) {
                      onOpenAuth('login');
                    } else {
                      handleNav('booking');
                    }
                  }}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:opacity-90 active:scale-95 shadow-md"
                  style={{
                    backgroundColor: 'var(--primary, #4F35D2)',
                  }}
                >
                  Agendar cita
                </button>
              </>
            )}
          </div>

          {/* Mobile Header Action */}
          <div className="flex md:hidden items-center gap-2">
            {authenticatedClient && (
              <ClientNotificationsDropdown tenantSlug={tenant.slug} />
            )}
            {!authenticatedClient && onOpenAuth && (
              <button
                onClick={() => onOpenAuth('login')}
                className={`text-sm font-semibold ${transparent ? 'text-white' : 'text-[var(--primary,#4F35D2)]'}`}
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
