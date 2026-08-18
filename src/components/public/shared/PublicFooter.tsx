import React from 'react';
import Link from 'next/link';
import { Container } from './Container';
import { Tenant } from '@/types/database';
import { TenantSocials } from '@/types/theme';
import { Instagram, Facebook, MessageCircle } from 'lucide-react';

interface PublicFooterProps {
  tenant: Tenant;
  socials?: TenantSocials;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function PublicFooter({ tenant, socials, deviceViewport }: PublicFooterProps) {
  const isMobile = deviceViewport === 'mobile';
  const isTablet = deviceViewport === 'tablet';
  const isDesktopPreview = deviceViewport === 'desktop';

  const gridColsClass = isMobile
    ? 'grid-cols-1 gap-6 text-center'
    : isTablet
    ? 'grid-cols-1 sm:grid-cols-2 gap-6 text-left'
    : isDesktopPreview
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left'
    : 'grid-cols-1 md:grid-cols-4 gap-8 text-left';

  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--foreground)]/10 py-8 sm:py-12 text-[var(--muted)] break-words overflow-hidden">
      <Container>
        <div className={`grid ${gridColsClass} mb-8`}>
          {/* Col 1: Identidad del Negocio */}
          <div className={`space-y-3 ${isMobile ? 'flex flex-col items-center text-center' : 'text-left'}`}>
            <div className="flex items-center gap-3">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-auto object-contain flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-bold flex-shrink-0">
                  {tenant.name.charAt(0)}
                </div>
              )}
              <span className="font-bold text-base sm:text-lg text-[var(--foreground)] truncate max-w-[200px]">{tenant.name}</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed max-w-sm">
              Plataforma de gestión de citas online. Reserva tu turno de forma rápida, sencilla y segura en cualquier momento.
            </p>
            {/* Social Icons */}
            <div className={`flex items-center gap-2.5 pt-1 ${isMobile ? 'justify-center' : 'justify-start'}`}>
              {socials?.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-[var(--background)] hover:text-[var(--primary)] transition-colors border border-[var(--foreground)]/10"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {socials?.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-[var(--background)] hover:text-[var(--primary)] transition-colors border border-[var(--foreground)]/10"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {socials?.whatsapp && (
                <a
                  href={`https://wa.me/${socials.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-[var(--background)] hover:text-[var(--primary)] transition-colors border border-[var(--foreground)]/10 text-emerald-400"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Navegación */}
          <div className={isMobile ? 'text-center' : 'text-left'}>
            <h4 className="font-bold text-[var(--foreground)] text-xs sm:text-sm mb-3 uppercase tracking-wider">
              Navegación
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              <li>
                <a href="#services" className="hover:text-[var(--foreground)] transition-colors">
                  Servicios
                </a>
              </li>
              <li>
                <a href="#staff" className="hover:text-[var(--foreground)] transition-colors">
                  Nuestro Equipo
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[var(--foreground)] transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[var(--foreground)] transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Contacto */}
          <div className={isMobile ? 'text-center' : 'text-left'}>
            <h4 className="font-bold text-[var(--foreground)] text-xs sm:text-sm mb-3 uppercase tracking-wider">
              Contacto
            </h4>
            <ul className="space-y-1.5 text-xs sm:text-sm">
              {tenant.phone && <li className="truncate">Tel: {tenant.phone}</li>}
              {tenant.email && <li className="break-all font-mono text-[11px] sm:text-xs">Email: {tenant.email}</li>}
              <li className="truncate">Zona: {tenant.timezone}</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--foreground)]/10 text-xs text-center flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados.</p>
          <p className="text-[var(--muted)]">Impulsado por <span className="font-semibold text-[var(--foreground)]">OmniCitas</span></p>
        </div>
      </Container>
    </footer>
  );
}
