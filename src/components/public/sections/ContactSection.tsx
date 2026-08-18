import React from 'react';
import { Container } from '../shared/Container';
import { SectionHeading } from '../shared/SectionHeading';
import { Tenant, WorkingHour } from '@/types/database';
import { TenantSocials } from '@/types/theme';
import { Phone, Mail, Clock, MapPin, MessageCircle } from 'lucide-react';

interface ContactSectionProps {
  tenant: Tenant;
  socials?: TenantSocials;
  workingHours?: WorkingHour[];
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function ContactSection({ tenant, socials, workingHours, deviceViewport }: ContactSectionProps) {
  const whatsappNumber = socials?.whatsapp || tenant.phone;

  const isMobile = deviceViewport === 'mobile';
  const isTablet = deviceViewport === 'tablet';

  // Deduplicar los horarios por día de la semana (0 - 6) para evitar duplicados si hay múltiples empleados
  const uniqueWorkingHours = React.useMemo(() => {
    if (!workingHours || workingHours.length === 0) return [];
    const dayMap = new Map<number, WorkingHour>();
    workingHours.forEach((wh) => {
      if (!dayMap.has(wh.day_of_week) || (!wh.staff_id && dayMap.get(wh.day_of_week)?.staff_id)) {
        dayMap.set(wh.day_of_week, wh);
      }
    });
    return Array.from(dayMap.values()).sort((a, b) => a.day_of_week - b.day_of_week);
  }, [workingHours]);

  const gridColsClass = isMobile
    ? 'grid-cols-1 gap-5'
    : isTablet
    ? 'grid-cols-1 sm:grid-cols-2 gap-6'
    : 'grid-cols-1 md:grid-cols-2 gap-8';

  return (
    <section id="contact" className="py-12 sm:py-20 bg-[var(--background)]">
      <Container>
        <SectionHeading
          badge="Ubicación y Horarios"
          title="Contacto y Atención"
          subtitle="Visítanos o comunícate directamente con nuestro equipo."
          className="mb-10 sm:mb-14"
        />

        <div className={`grid ${gridColsClass}`}>
          {/* Tarjeta 1: Información de Contacto */}
          <div className="p-5 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--foreground)]/10 space-y-5 sm:space-y-6 break-words overflow-hidden">
            <h3 className="font-bold text-base sm:text-xl text-[var(--foreground)]">Información de Contacto</h3>
            <div className="space-y-4 text-xs sm:text-sm">
              {tenant.phone && (
                <div className="flex items-center gap-3 sm:gap-4 text-[var(--muted)]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] sm:text-xs font-semibold text-[var(--foreground)] uppercase">Teléfono</span>
                    <span className="truncate block font-mono">{tenant.phone}</span>
                  </div>
                </div>
              )}

              {tenant.email && (
                <div className="flex items-center gap-3 sm:gap-4 text-[var(--muted)]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] sm:text-xs font-semibold text-[var(--foreground)] uppercase">Email</span>
                    <span className="break-all block font-mono text-xs sm:text-sm">{tenant.email}</span>
                  </div>
                </div>
              )}

              {whatsappNumber && (
                <div className="flex items-center gap-3 sm:gap-4 text-[var(--muted)]">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] sm:text-xs font-semibold text-[var(--foreground)] uppercase">WhatsApp</span>
                    <a
                      href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:underline font-semibold text-xs sm:text-sm inline-block truncate max-w-full"
                    >
                      Escribir mensaje directo
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 sm:gap-4 text-[var(--muted)]">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] sm:text-xs font-semibold text-[var(--foreground)] uppercase">Zona Horaria</span>
                  <span className="truncate block">{tenant.timezone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Horarios de Atención */}
          <div className="p-5 sm:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--foreground)]/10 space-y-5 sm:space-y-6 break-words overflow-hidden">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)] flex-shrink-0" />
              <h3 className="font-bold text-base sm:text-xl text-[var(--foreground)]">Horarios Semanales</h3>
            </div>

            {uniqueWorkingHours && uniqueWorkingHours.length > 0 ? (
              <div className="space-y-2 text-xs sm:text-sm divide-y divide-[var(--foreground)]/5">
                {uniqueWorkingHours.map((wh) => (
                  <div key={wh.id || wh.day_of_week} className="pt-2 flex justify-between items-center gap-2">
                    <span className="font-semibold text-[var(--foreground)] text-xs sm:text-sm">
                      {DAY_NAMES[wh.day_of_week]}
                    </span>
                    {wh.is_day_off ? (
                      <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-semibold flex-shrink-0">
                        Cerrado
                      </span>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-[var(--muted)] font-mono flex-shrink-0">
                        {wh.start_time?.slice(0, 5)} - {wh.end_time?.slice(0, 5)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Lunes a Viernes: 08:00 AM - 06:00 PM<br />
                Sábados: 08:00 AM - 02:00 PM<br />
                Domingos: Cerrado
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
