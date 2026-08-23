'use client';

import React, { useState } from 'react';
import { Container } from '../shared/Container';
import { SectionHeading } from '../shared/SectionHeading';
import { Tenant, WorkingHour, Branch } from '@/types/database';
import { TenantSettings, TenantSocials } from '@/types/theme';
import { Phone, Mail, Clock, MapPin, MessageCircle, Building2 } from 'lucide-react';

interface ContactSectionProps {
  tenant: Tenant;
  settings?: TenantSettings;
  socials?: TenantSocials;
  branches?: Branch[];
  workingHours?: WorkingHour[];
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function ContactSection({ tenant, settings, socials, branches = [], workingHours = [], deviceViewport }: ContactSectionProps) {
  const whatsappNumber = socials?.whatsapp || settings?.whatsapp_number || tenant.phone;
  const activeBranches = branches.filter((b) => b.is_active);

  // Tab activo de sucursal si hay múltiples
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    activeBranches.length > 0 ? activeBranches[0].id : ''
  );

  const selectedBranch = activeBranches.find((b) => b.id === selectedBranchId) || activeBranches[0];
  const locationAddress = selectedBranch?.address || (tenant as any).address;

  // Filtrar horarios por la sucursal seleccionada (o generales si no hay específica)
  const branchWorkingHours = React.useMemo(() => {
    if (!workingHours || workingHours.length === 0) return [];
    
    // Primero buscar horarios asignados específicamente a esta sucursal
    let filtered = selectedBranch
      ? workingHours.filter((wh) => wh.branch_id === selectedBranch.id)
      : [];

    // Si no hay horarios específicos para esta sucursal, usar los horarios generales del negocio (sin staff_id y sin branch_id)
    if (filtered.length === 0) {
      filtered = workingHours.filter((wh) => !wh.staff_id);
    }

    // Deduplicar por día de la semana (0 - 6)
    const dayMap = new Map<number, WorkingHour>();
    filtered.forEach((wh) => {
      if (!dayMap.has(wh.day_of_week)) {
        dayMap.set(wh.day_of_week, wh);
      }
    });

    return Array.from(dayMap.values()).sort((a, b) => a.day_of_week - b.day_of_week);
  }, [workingHours, selectedBranch]);

  const isMobile = deviceViewport === 'mobile';
  const isTablet = deviceViewport === 'tablet';

  const gridColsClass = isMobile
    ? 'grid-cols-1 gap-6'
    : isTablet
    ? 'grid-cols-1 sm:grid-cols-2 gap-6'
    : 'grid-cols-1 md:grid-cols-2 gap-8';

  return (
    <section id="contact" className="py-20 md:py-28 bg-[var(--background,#F9F8F6)] font-[var(--font-sans)]">
      <Container>
        <SectionHeading
          badge="Ubicación y Horarios"
          title="Contacto y Atención"
          subtitle="Visítanos o comunícate directamente con nuestro equipo."
          className="mb-12 text-center"
        />

        <div className={`grid ${gridColsClass}`}>
          {/* Tarjeta 1: Información de Contacto */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card,#ffffff)] border border-[var(--border,#E4E2EC)] space-y-6 shadow-sm">
            <h3 className="font-display text-xl text-[var(--foreground,#18181B)]">Información de Contacto</h3>
            <div className="space-y-4 text-sm">
              {tenant.phone && (
                <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary,#4F35D2)]/10 text-[var(--primary,#4F35D2)] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Teléfono</span>
                    <span className="truncate block font-mono text-sm text-[var(--foreground)] mt-0.5">{tenant.phone}</span>
                  </div>
                </div>
              )}

              {tenant.email && (
                <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary,#4F35D2)]/10 text-[var(--primary,#4F35D2)] flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Email</span>
                    <span className="break-all block font-mono text-sm text-[var(--foreground)] mt-0.5">{tenant.email}</span>
                  </div>
                </div>
              )}

              {whatsappNumber && (
                <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">WhatsApp</span>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-500 hover:underline font-semibold text-sm inline-block truncate max-w-full mt-0.5"
                    >
                      Escribir mensaje directo
                    </a>
                  </div>
                </div>
              )}

              {locationAddress && (
                <div className="flex items-center gap-4 text-[var(--muted-foreground)]">
                  <div className="w-10 h-10 rounded-xl bg-[var(--primary,#4F35D2)]/10 text-[var(--primary,#4F35D2)] flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                      Ubicación {activeBranches.length > 1 && selectedBranch?.name ? `(${selectedBranch.name})` : ''}
                    </span>
                    <span className="truncate block text-sm text-[var(--foreground)] mt-0.5">{locationAddress}</span>
                  </div>
                </div>
              )}

              {/* Bloque de Redes Sociales Completo */}
              {socials && Object.values(socials).some((val) => val && typeof val === 'string' && val.trim() !== '') && (
                <div className="pt-4 border-t border-[var(--border,#E4E2EC)] space-y-2.5">
                  <span className="block text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">
                    Redes Sociales y Canales Oficiales
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {socials.instagram && (
                      <a
                        href={socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-600 hover:bg-pink-500 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        Instagram
                      </a>
                    )}
                    {socials.facebook && (
                      <a
                        href={socials.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        Facebook
                      </a>
                    )}
                    {socials.tiktok && (
                      <a
                        href={socials.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-zinc-900/10 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-900 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        TikTok
                      </a>
                    )}
                    {socials.twitter && (
                      <a
                        href={socials.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-600 hover:bg-sky-500 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        Twitter / X
                      </a>
                    )}
                    {socials.youtube && (
                      <a
                        href={socials.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        YouTube
                      </a>
                    )}
                    {socials.linkedin && (
                      <a
                        href={socials.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-blue-700/10 text-blue-700 hover:bg-blue-700 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        LinkedIn
                      </a>
                    )}
                    {socials.website && (
                      <a
                        href={socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-purple-600/10 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        Sitio Web
                      </a>
                    )}
                    {socials.telegram && (
                      <a
                        href={socials.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-sky-400/10 text-sky-500 hover:bg-sky-400 hover:text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        Telegram
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tarjeta 2: Horarios Semanales por Sucursal */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[var(--card,#ffffff)] border border-[var(--border,#E4E2EC)] space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-[var(--primary,#4F35D2)] shrink-0" />
                <h3 className="font-display text-xl text-[var(--foreground,#18181B)]">Horarios Semanales</h3>
              </div>

              {/* Selector de Sucursal si hay múltiples */}
              {activeBranches.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {activeBranches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBranchId(b.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                        selectedBranchId === b.id
                          ? 'bg-[var(--primary,#4F35D2)] text-white border-[var(--primary,#4F35D2)] shadow-sm'
                          : 'bg-[var(--secondary,#F0EFFE)] text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)]'
                      }`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nombre y Dirección de Sucursal activa */}
            {selectedBranch && activeBranches.length > 0 && (
              <div className="p-3.5 rounded-xl bg-[var(--secondary,#F0EFFE)] border border-[var(--primary,#4F35D2)]/15 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--primary,#4F35D2)]" />
                  <span className="font-bold text-[var(--foreground,#18181B)]">{selectedBranch.name}</span>
                </div>
                {selectedBranch.address && (
                  <span className="text-[var(--muted-foreground)] truncate max-w-[200px]">{selectedBranch.address}</span>
                )}
              </div>
            )}

            {/* Lista de días y horarios */}
            {branchWorkingHours && branchWorkingHours.length > 0 ? (
              <div className="space-y-2.5 text-sm divide-y divide-[var(--border,#E4E2EC)]">
                {branchWorkingHours.map((wh) => (
                  <div key={wh.id || wh.day_of_week} className="pt-2.5 flex justify-between items-center gap-2">
                    <span className="font-semibold text-[var(--foreground,#18181B)] text-sm">
                      {DAY_NAMES[wh.day_of_week]}
                    </span>
                    {wh.is_day_off ? (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-500 font-semibold shrink-0">
                        Cerrado
                      </span>
                    ) : (
                      <span className="text-sm font-semibold font-mono text-[var(--primary,#4F35D2)] shrink-0">
                        {wh.start_time?.slice(0, 5)} - {wh.end_time?.slice(0, 5)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 text-sm text-[var(--muted-foreground)] leading-relaxed">
                <p>Lunes a Viernes: 08:00 AM - 06:00 PM</p>
                <p>Sábados: 08:00 AM - 02:00 PM</p>
                <p className="text-red-500 font-semibold">Domingos: Cerrado</p>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
