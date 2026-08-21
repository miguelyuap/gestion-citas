'use client';

import React, { useState } from 'react';
import { Container } from '../shared/Container';
import { SectionHeading } from '../shared/SectionHeading';
import { Service } from '@/types/database';
import { ButtonStyleType } from '@/types/theme';
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface ServicesSectionProps {
  services: Service[];
  bookingUrl: string;
  buttonStyle?: ButtonStyleType;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

const DEFAULT_SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607779097040-26e80aa78e66?w=600&auto=format&fit=crop&q=80',
];

export function ServicesSection({
  services,
  bookingUrl,
  deviceViewport,
}: ServicesSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!services || services.length === 0) {
    return null;
  }

  // 6 servicios por página en escritorio / tablet, 3 en móvil
  const itemsPerPage = deviceViewport === 'mobile' ? 3 : 6;
  const totalPages = Math.ceil(services.length / itemsPerPage);

  const displayedServices = services.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const gridColsClass =
    deviceViewport === 'mobile'
      ? 'grid-cols-1 gap-5'
      : deviceViewport === 'tablet'
      ? 'grid-cols-1 sm:grid-cols-2 gap-5'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';

  const scrollToSectionHeader = () => {
    if (typeof window === 'undefined') return;
    const el = document.getElementById('services');
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className="scroll-mt-24 py-20 md:py-28 bg-[var(--background,#F9F8F6)] font-[var(--font-sans)]">
      <Container>
        <SectionHeading
          badge="Nuestros servicios"
          title="Todo lo que necesitas"
          subtitle="Servicios profesionales diseñados para darte la mejor experiencia."
          className="mb-12 text-center"
        />

        <div className={`grid ${gridColsClass}`}>
          {displayedServices.map((service, idx) => {
            const imageUrl = DEFAULT_SERVICE_IMAGES[idx % DEFAULT_SERVICE_IMAGES.length];
            const itemBookingUrl = `${bookingUrl}?serviceId=${service.id}`;

            return (
              <a
                key={service.id}
                href={itemBookingUrl}
                className="group relative rounded-2xl overflow-hidden bg-[var(--card,#ffffff)] border border-[var(--border,#E4E2EC)] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[var(--primary,#4F35D2)]/10 hover:border-[var(--primary)]/20 flex flex-col justify-between cursor-pointer focus:outline-none"
              >
                <div>
                  {/* Image with overlay */}
                  <div className="relative overflow-hidden aspect-[4/3] bg-[var(--muted,#F5F3FF)]">
                    <img
                      src={imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary,#4F35D2)]/85 via-[var(--primary,#4F35D2)]/30 to-transparent opacity-0 lg:group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Desktop Hover CTA */}
                    <div className="hidden lg:flex absolute bottom-0 left-0 right-0 p-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                      <div className="w-full py-2.5 bg-white text-[var(--primary,#4F35D2)] font-bold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-md">
                        Agendar ahora
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Category pill */}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                      Especializado
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-display text-lg text-[var(--foreground,#18181B)] group-hover:text-[var(--primary,#4F35D2)] transition-colors">
                        {service.name}
                      </h3>
                      <span className="text-base font-bold text-[var(--primary,#4F35D2)] shrink-0">
                        ${Number(service.price).toLocaleString('es-CO')}
                      </span>
                    </div>
                    {service.description && (
                      <p className="text-sm text-[var(--muted-foreground,#71717A)] leading-relaxed mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border,#E4E2EC)]">
                      <div className="flex items-center gap-1 text-[var(--muted-foreground,#71717A)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--primary,#4F35D2)]" />
                        <span className="text-xs font-medium">{service.duration_minutes} min</span>
                      </div>
                      {/* Mobile & Tablet Always Visible CTA */}
                      <div className="lg:hidden flex items-center gap-1 text-xs font-bold text-[var(--primary,#4F35D2)]">
                        Agendar
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Paginación de Servicios */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentPage((p) => {
                  const next = Math.max(p - 1, 1);
                  scrollToSectionHeader();
                  return next;
                });
              }}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-[var(--border,#E4E2EC)] bg-[var(--card,#ffffff)] text-[var(--foreground,#18181B)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--secondary,#F0EFFE)] transition-colors shadow-sm active:scale-95"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--primary,#4F35D2)]" />
            </button>
            <span className="text-xs font-semibold text-[var(--muted-foreground,#71717A)] px-3 py-1.5 rounded-lg bg-[var(--secondary,#F0EFFE)]">
              Página {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentPage((p) => {
                  const next = Math.min(p + 1, totalPages);
                  scrollToSectionHeader();
                  return next;
                });
              }}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-[var(--border,#E4E2EC)] bg-[var(--card,#ffffff)] text-[var(--foreground,#18181B)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--secondary,#F0EFFE)] transition-colors shadow-sm active:scale-95"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-5 h-5 text-[var(--primary,#4F35D2)]" />
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
