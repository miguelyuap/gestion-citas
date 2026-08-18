'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Calendar } from 'lucide-react';
import { Container } from './Container';
import { ThemeButton } from './ThemeButton';
import { Tenant } from '@/types/database';

interface PublicNavbarProps {
  tenant: Tenant;
  bookingUrl: string;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function PublicNavbar({ tenant, bookingUrl, deviceViewport }: PublicNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isMobileMode = deviceViewport === 'mobile';
  const isTabletMode = deviceViewport === 'tablet';
  const isDesktopMode = deviceViewport === 'desktop';

  // Ajustes dinámicos de gaps y visibilidad según viewport
  const navGapClass = isDesktopMode ? 'gap-3 sm:gap-4' : 'gap-4 sm:gap-6';

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[var(--background)]/90 border-b border-[var(--foreground)]/10 transition-colors duration-200">
      <Container>
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 overflow-hidden">
          {/* Logo / Brand */}
          <Link href={`/${tenant.slug}`} className="flex items-center gap-2 sm:gap-3 group flex-shrink-0 min-w-0">
            {tenant.logo_url ? (
              <img
                src={tenant.logo_url}
                alt={tenant.name}
                className="h-7 sm:h-9 w-auto object-contain rounded-lg flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center font-extrabold text-sm sm:text-base shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="font-extrabold text-sm sm:text-lg tracking-tight text-[var(--foreground)] truncate max-w-[110px] sm:max-w-[160px]">
              {tenant.name}
            </span>
          </Link>

          {/* Desktop / Tablet Nav (oculto solo en mobile) */}
          {!isMobileMode && (
            <nav className={`${isTabletMode ? 'hidden sm:flex' : 'hidden md:flex'} items-center ${navGapClass} text-xs font-semibold text-[var(--muted)] flex-shrink-0`}>
              <a href="#services" className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap">
                Servicios
              </a>
              <a href="#staff" className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap">
                Equipo
              </a>
              <a href="#about" className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap">
                Nosotros
              </a>
              <a href="#contact" className="hover:text-[var(--foreground)] transition-colors whitespace-nowrap">
                Contacto
              </a>
            </nav>
          )}

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {!isMobileMode && (
              <div className={`${isTabletMode ? 'hidden sm:flex' : 'hidden md:flex'} items-center flex-shrink-0`}>
                <ThemeButton asAnchor href={bookingUrl} size="sm" className="px-3 py-1.5 text-xs font-extrabold whitespace-nowrap flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5" />
                  Reservar Cita
                </ThemeButton>
              </div>
            )}

            {/* Mobile / Compact menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`${isMobileMode ? 'flex' : isTabletMode ? 'flex sm:hidden' : 'md:hidden'} p-2 rounded-xl text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors border border-[var(--foreground)]/10 flex-shrink-0`}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="bg-[var(--surface)] border-b border-[var(--foreground)]/10 px-4 pt-3 pb-6 space-y-2 shadow-2xl">
          <a
            href="#services"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            Servicios
          </a>
          <a
            href="#staff"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            Equipo
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            Nosotros
          </a>
          <a
            href="#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
          >
            Contacto
          </a>
          <div className="pt-2">
            <ThemeButton asAnchor href={bookingUrl} size="sm" className="w-full justify-center text-xs font-bold py-2.5">
              <Calendar className="w-4 h-4" />
              Reservar Cita
            </ThemeButton>
          </div>
        </div>
      )}
    </header>
  );
}
