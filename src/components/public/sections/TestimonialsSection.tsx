import React from 'react';
import { Container } from '../shared/Container';
import { SectionHeading } from '../shared/SectionHeading';
import { TenantTestimonialItem } from '@/types/theme';
import { Star } from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials: TenantTestimonialItem[];
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function TestimonialsSection({ testimonials, deviceViewport }: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const gridColsClass =
    deviceViewport === 'mobile'
      ? 'grid-cols-1 gap-4'
      : deviceViewport === 'tablet'
      ? 'grid-cols-1 sm:grid-cols-2 gap-5'
      : 'grid-cols-1 md:grid-cols-3 gap-6';

  return (
    <section id="testimonials" className="py-12 sm:py-20 bg-[var(--surface)]/40 border-y border-[var(--foreground)]/10">
      <Container>
        <SectionHeading
          badge="Opiniones"
          title="Lo que dicen nuestros clientes"
          subtitle="La satisfacción y confianza de quienes nos eligen día a día."
          className="mb-10 sm:mb-14"
        />

        <div className={`grid ${gridColsClass}`}>
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-5 sm:p-6 rounded-2xl bg-[var(--surface)] border border-[var(--foreground)]/10 shadow-sm flex flex-col justify-between break-words overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current flex-shrink-0" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[var(--foreground)] italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-[var(--foreground)]/5 flex items-center gap-3">
                {t.client_avatar ? (
                  <img src={t.client_avatar} alt={t.client_name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] font-bold flex items-center justify-center text-xs sm:text-sm flex-shrink-0">
                    {t.client_name.charAt(0)}
                  </div>
                )}
                <div className="truncate">
                  <h4 className="font-bold text-xs sm:text-sm text-[var(--foreground)] truncate">{t.client_name}</h4>
                  <span className="text-[10px] sm:text-xs text-[var(--muted)]">Cliente verificado</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
