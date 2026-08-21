'use client';

import React, { useState, useEffect } from 'react';
import { Container } from '../shared/Container';
import { TenantTestimonialItem } from '@/types/theme';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

interface TestimonialsSectionProps {
  testimonials?: TenantTestimonialItem[];
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

const DEFAULT_TESTIMONIALS = [
  {
    id: 't1',
    client_name: 'Camila Rodriguez',
    comment: 'La atención fue espectacular. El sistema de agendamiento es super sencillo y pude elegir a mi especialista favorita sin complicaciones.',
    rating: 5,
    client_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    service: 'Limpieza Facial Profunda',
  },
  {
    id: 't2',
    client_name: 'Andrés Mendoza',
    comment: 'Muy puntual y el lugar es impecable. Me encanta poder ver la disponibilidad en tiempo real y recibir recordatorio por WhatsApp.',
    rating: 5,
    client_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    service: 'Corte & Estilo',
  },
  {
    id: 't3',
    client_name: 'Valentina Gomez',
    comment: 'Excelente experiencia de inicio a fin. Reservar me tomó menos de 1 minuto. 100% recomendado.',
    rating: 5,
    client_avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    service: 'Masaje Relajante',
  },
];

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  const displayItems =
    testimonials && testimonials.length > 0
      ? testimonials.map((t) => ({
          id: t.id,
          client_name: t.client_name,
          comment: t.comment,
          rating: t.rating || 5,
          client_avatar: t.client_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
          service: 'Cliente verificado',
        }))
      : DEFAULT_TESTIMONIALS;

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % displayItems.length), 5000);
    return () => clearInterval(t);
  }, [paused, displayItems.length]);

  const prev = () => {
    setCurrent((c) => (c - 1 + displayItems.length) % displayItems.length);
    setPaused(true);
  };
  const next = () => {
    setCurrent((c) => (c + 1) % displayItems.length);
    setPaused(true);
  };

  return (
    <section id="testimonials" className="py-20 md:py-28 bg-[var(--background,#F9F8F6)] relative overflow-hidden font-[var(--font-sans)]">
      <Container>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-[var(--secondary,#F0EFFE)] text-[var(--secondary-foreground,#4F35D2)]">
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
              Testimonios
            </div>
            <h2 className="font-display text-3xl md:text-4xl text-[var(--foreground,#18181B)] mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-base text-[var(--muted-foreground,#71717A)] max-w-xl mx-auto">
              Más de 500 personas confían en nuestros servicios día a día.
            </p>
          </div>

          <div className="relative mt-8">
            {/* Carousel track */}
            <div className="overflow-hidden rounded-3xl">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
              >
                {displayItems.map((t) => (
                  <div key={t.id} className="min-w-full px-2">
                    <div className="bg-[var(--card,#ffffff)] border border-[var(--border,#E4E2EC)] rounded-2xl p-8 md:p-10 shadow-sm">
                      {/* Stars */}
                      <div className="flex items-center gap-1 mb-5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                        ))}
                      </div>
                      <blockquote className="font-display text-xl md:text-2xl text-[var(--foreground,#18181B)] leading-relaxed mb-8">
                        &ldquo;{t.comment}&rdquo;
                      </blockquote>
                      <div className="flex items-center gap-4">
                        <img
                          src={t.client_avatar}
                          alt={t.client_name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-[var(--secondary,#F0EFFE)]"
                        />
                        <div>
                          <p className="font-semibold text-[var(--foreground,#18181B)]">{t.client_name}</p>
                          <p className="text-sm text-[var(--muted-foreground,#71717A)]">{t.service}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-7">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full border border-[var(--border,#E4E2EC)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary,#4F35D2)] transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                {displayItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrent(i);
                      setPaused(true);
                    }}
                    className="rounded-full transition-all duration-300"
                    style={{
                      width: current === i ? '24px' : '8px',
                      height: '8px',
                      background: current === i ? 'var(--primary,#4F35D2)' : 'var(--border,#E4E2EC)',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={next}
                className="w-9 h-9 rounded-full border border-[var(--border,#E4E2EC)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary,#4F35D2)] transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
