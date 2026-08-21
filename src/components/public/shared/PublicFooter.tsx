'use client';

import React from 'react';
import { Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { Tenant } from '@/types/database';

interface PublicFooterProps {
  tenant: Tenant;
  socials?: any;
  onNavigateView?: (view: 'landing' | 'booking' | 'appointments' | 'profile') => void;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function PublicFooter({ tenant, socials, onNavigateView }: PublicFooterProps) {
  return (
    <footer className="bg-[#18181B] text-white font-[var(--font-sans)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt={tenant.name} className="h-8 w-auto object-contain rounded-xl" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[var(--primary,#4F35D2)] flex items-center justify-center text-white">
                  <Calendar className="w-4 h-4" />
                </div>
              )}
              <span className="font-display text-xl">{tenant.name}</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Reserva tus citas de forma rápida, segura y sin complicaciones.
            </p>
            {socials && (
              <div className="flex items-center gap-3 mt-5">
                {socials.instagram && (
                  <a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-xs font-bold text-white">
                    IG
                  </a>
                )}
                {socials.facebook && (
                  <a href={socials.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-xs font-bold text-white">
                    FB
                  </a>
                )}
                {socials.whatsapp && (
                  <a href={`https://wa.me/${socials.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-xs font-bold text-white">
                    WA
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/80 uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-3">
              {(tenant as any).address && (
                <li className="flex items-start gap-2.5 text-sm text-white/60">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  {(tenant as any).address}
                </li>
              )}
              {tenant.phone && (
                <li className="flex items-center gap-2.5 text-sm text-white/60">
                  <Phone className="w-4 h-4 shrink-0" />
                  {tenant.phone}
                </li>
              )}
              {tenant.email && (
                <li className="flex items-center gap-2.5 text-sm text-white/60">
                  <Mail className="w-4 h-4 shrink-0" />
                  {tenant.email}
                </li>
              )}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/80 uppercase tracking-wider">Accesos</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Inicio', view: 'landing' as const },
                { label: 'Agendar cita', view: 'booking' as const },
                { label: 'Mis citas', view: 'appointments' as const },
                { label: 'Mi perfil', view: 'profile' as const },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigateView && onNavigateView(link.view)}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} {tenant.name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white/70 transition-colors">Política de privacidad</a>
            <a href="#" className="hover:text-white/70 transition-colors">Términos y condiciones</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
