import React from 'react';
import { Container } from '../shared/Container';
import { SectionHeading } from '../shared/SectionHeading';
import { ThemeButton } from '../shared/ThemeButton';
import { Service } from '@/types/database';
import { ButtonStyleType } from '@/types/theme';
import { Clock, Calendar } from 'lucide-react';

interface ServicesSectionProps {
  services: Service[];
  bookingUrl: string;
  buttonStyle?: ButtonStyleType;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function ServicesSection({
  services,
  bookingUrl,
  buttonStyle = 'rounded',
  deviceViewport,
}: ServicesSectionProps) {
  if (!services || services.length === 0) {
    return null;
  }

  const gridColsClass =
    deviceViewport === 'mobile'
      ? 'grid-cols-1 gap-4'
      : deviceViewport === 'tablet'
      ? 'grid-cols-1 sm:grid-cols-2 gap-5'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';

  return (
    <section id="services" className="py-12 sm:py-20 bg-[var(--surface)]/50 border-y border-[var(--foreground)]/10">
      <Container>
        <SectionHeading
          badge="Catálogo"
          title="Nuestros Servicios"
          subtitle="Elige el servicio perfecto para ti y agenda tu turno en segundos."
          className="mb-10 sm:mb-14"
        />

        <div className={`grid ${gridColsClass}`}>
          {services.map((service) => (
            <div
              key={service.id}
              className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--foreground)]/10 hover:border-[var(--primary)]/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group break-words overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--foreground)]/5 pb-3">
                  <h3 className="font-bold text-base sm:text-lg text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors flex-1 min-w-[120px] break-words">
                    {service.name}
                  </h3>
                  <span className="font-extrabold text-xs sm:text-sm text-[var(--primary)] bg-[var(--primary)]/10 px-2.5 py-1 rounded-xl whitespace-nowrap flex-shrink-0">
                    ${Number(service.price).toLocaleString('es-CO')} {service.currency}
                  </span>
                </div>

                {service.description && (
                  <p className="text-xs sm:text-sm text-[var(--muted)] line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-[var(--muted)] pt-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--primary)] flex-shrink-0" />
                  <span>{service.duration_minutes} min de duración</span>
                </div>
              </div>

              <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[var(--foreground)]/5">
                <ThemeButton
                  asAnchor
                  href={`${bookingUrl}?serviceId=${service.id}`}
                  size="sm"
                  buttonStyle={buttonStyle}
                  variant="secondary"
                  className="w-full justify-center text-xs group-hover:bg-[var(--primary)] group-hover:text-white transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Reservar este servicio
                </ThemeButton>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
