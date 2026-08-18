import React from 'react';
import { Container } from '../shared/Container';
import { SectionHeading } from '../shared/SectionHeading';
import { ThemeButton } from '../shared/ThemeButton';
import { Staff } from '@/types/database';
import { ButtonStyleType } from '@/types/theme';
import { UserCheck, Calendar } from 'lucide-react';

interface StaffSectionProps {
  staffList: Staff[];
  bookingUrl: string;
  buttonStyle?: ButtonStyleType;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function StaffSection({
  staffList,
  bookingUrl,
  buttonStyle = 'rounded',
  deviceViewport,
}: StaffSectionProps) {
  if (!staffList || staffList.length === 0) {
    return null;
  }

  const gridColsClass =
    deviceViewport === 'mobile'
      ? 'grid-cols-1 gap-4'
      : deviceViewport === 'tablet'
      ? 'grid-cols-1 sm:grid-cols-2 gap-5'
      : deviceViewport === 'desktop'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6';

  return (
    <section id="staff" className="py-12 sm:py-20 bg-[var(--background)]">
      <Container>
        <SectionHeading
          badge="Equipo"
          title="Nuestros Profesionales"
          subtitle="Conoce a las personas dedicadas a brindarte la mejor atención."
          className="mb-10 sm:mb-14"
        />

        <div className={`grid ${gridColsClass}`}>
          {staffList.map((staff) => (
            <div
              key={staff.id}
              className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--foreground)]/10 text-center hover:border-[var(--primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-between break-words overflow-hidden"
            >
              <div className="space-y-3 w-full flex flex-col items-center">
                {staff.avatar_url ? (
                  <img
                    src={staff.avatar_url}
                    alt={staff.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-lg border-2 border-[var(--primary)]/20 flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-lg flex-shrink-0"
                    style={{ backgroundColor: staff.color || 'var(--primary)' }}
                  >
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="w-full truncate">
                  <h3 className="font-bold text-sm sm:text-base text-[var(--foreground)] truncate">{staff.name}</h3>
                  <p className="text-[11px] sm:text-xs text-[var(--muted)] flex items-center justify-center gap-1 mt-1 truncate">
                    <UserCheck className="w-3 h-3 text-[var(--primary)] flex-shrink-0" />
                    Especialista
                  </p>
                </div>
              </div>

              <div className="pt-4 w-full">
                <ThemeButton
                  asAnchor
                  href={`${bookingUrl}?staffId=${staff.id}`}
                  size="sm"
                  buttonStyle={buttonStyle}
                  variant="outline"
                  className="w-full justify-center text-xs px-2 py-1.5 whitespace-nowrap"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Reservar cita
                </ThemeButton>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
