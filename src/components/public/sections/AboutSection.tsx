import React from 'react';
import { Container } from '../shared/Container';
import { SectionHeading } from '../shared/SectionHeading';
import { TenantSettings } from '@/types/theme';

interface AboutSectionProps {
  settings: TenantSettings;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function AboutSection({ settings, deviceViewport }: AboutSectionProps) {
  if (!settings.about_text && !settings.about_title) {
    return null;
  }

  const isMobile = deviceViewport === 'mobile';
  const isTablet = deviceViewport === 'tablet';

  const gridClass = isMobile
    ? 'grid-cols-1 gap-6 text-center'
    : isTablet
    ? 'grid-cols-1 sm:grid-cols-2 gap-8 items-center text-left'
    : 'grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left';

  const imageAspectClass = isMobile ? 'aspect-[16/9]' : 'aspect-[4/3]';

  return (
    <section id="about" className="py-12 sm:py-20 bg-[var(--surface)]/30 border-y border-[var(--foreground)]/10">
      <Container>
        <div className={`grid ${gridClass}`}>
          <div className="space-y-4 sm:space-y-6">
            <SectionHeading
              badge="Historia"
              title={settings.about_title || 'Sobre Nosotros'}
              centered={isMobile}
            />
            <p className="text-xs sm:text-base lg:text-lg text-[var(--muted)] leading-relaxed whitespace-pre-line break-words">
              {settings.about_text ||
                'Nos dedicamos a ofrecer experiencias de la más alta calidad con profesionales apasionados por su trabajo.'}
            </p>
          </div>

          <div className="relative">
            <div className={`${imageAspectClass} rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[var(--foreground)]/10`}>
              <img
                src={
                  settings.about_image_url ||
                  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'
                }
                alt={settings.about_title || 'Sobre Nosotros'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
