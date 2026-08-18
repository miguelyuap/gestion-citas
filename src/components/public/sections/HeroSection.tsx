import React from 'react';
import { Container } from '../shared/Container';
import { ThemeButton } from '../shared/ThemeButton';
import { TenantSettings, ButtonStyleType } from '@/types/theme';
import { Calendar, MessageCircle, ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  settings: TenantSettings;
  bookingUrl: string;
  buttonStyle?: ButtonStyleType;
  variant?: 'modern' | 'elegant' | 'bold';
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
}

export function HeroSection({
  settings,
  bookingUrl,
  buttonStyle = 'rounded',
  variant = 'modern',
  deviceViewport,
}: HeroSectionProps) {
  const whatsappLink = settings.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`
    : null;

  const isMobile = deviceViewport === 'mobile';
  const isTablet = deviceViewport === 'tablet';
  const isDesktopPreview = deviceViewport === 'desktop';

  const gridClass = isMobile
    ? 'grid-cols-1 gap-6 text-center'
    : isTablet || isDesktopPreview
    ? 'grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 items-center text-left'
    : 'grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left';

  const headingSizeClass = isMobile
    ? 'text-2xl font-extrabold'
    : isTablet
    ? 'text-2xl sm:text-3xl font-extrabold'
    : isDesktopPreview
    ? 'text-2xl sm:text-3xl lg:text-4xl font-extrabold'
    : 'text-4xl sm:text-5xl lg:text-6xl font-extrabold';

  const imageAspectClass = isMobile
    ? 'aspect-[16/9]'
    : isDesktopPreview
    ? 'aspect-[4/3] max-h-[300px]'
    : 'aspect-[4/3]';

  if (variant === 'elegant') {
    return (
      <section className="relative py-10 sm:py-16 lg:py-24 overflow-hidden bg-[var(--background)]">
        <Container>
          <div className={`grid ${gridClass}`}>
            <div className={`space-y-4 sm:space-y-6 ${isMobile ? 'text-center' : 'text-left'}`}>
              {settings.hero_badge && (
                <span className="inline-block text-[10px] sm:text-xs uppercase tracking-widest font-semibold px-3 py-1 rounded-full border border-[var(--primary)]/30 text-[var(--primary)] bg-[var(--primary)]/5">
                  {settings.hero_badge}
                </span>
              )}
              <h1 className={`${headingSizeClass} tracking-tight text-[var(--foreground)] leading-[1.15] break-words`}>
                {settings.hero_title}
              </h1>
              <p className="text-xs sm:text-base text-[var(--muted)] leading-relaxed max-w-xl font-light">
                {settings.hero_subtitle}
              </p>
              <div className={`flex flex-wrap items-center gap-3 pt-2 ${isMobile ? 'justify-center' : 'justify-start'}`}>
                <ThemeButton
                  asAnchor
                  href={bookingUrl}
                  size="sm"
                  buttonStyle={buttonStyle}
                  variant="primary"
                >
                  <Calendar className="w-4 h-4" />
                  {settings.hero_cta_text || 'Reservar Cita'}
                </ThemeButton>

                {whatsappLink && (
                  <ThemeButton
                    asAnchor
                    href={whatsappLink}
                    size="sm"
                    buttonStyle={buttonStyle}
                    variant="secondary"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    WhatsApp
                  </ThemeButton>
                )}
              </div>
            </div>

            <div className="relative">
              <div className={`${imageAspectClass} rounded-2xl overflow-hidden shadow-2xl border border-[var(--foreground)]/10`}>
                <img
                  src={
                    settings.hero_image_url ||
                    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80'
                  }
                  alt={settings.hero_title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  if (variant === 'bold') {
    return (
      <section className="relative py-10 sm:py-16 lg:py-20 bg-[var(--surface)] border-b border-[var(--foreground)]/10">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
            {settings.hero_badge && (
              <span className="inline-block text-xs uppercase tracking-widest font-black px-3 py-1 bg-[var(--primary)] text-white rounded-md shadow-md">
                {settings.hero_badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[var(--foreground)] uppercase leading-none break-words">
              {settings.hero_title}
            </h1>
            <p className="text-xs sm:text-base text-[var(--muted)] font-medium max-w-xl mx-auto">
              {settings.hero_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <ThemeButton
                asAnchor
                href={bookingUrl}
                size="sm"
                buttonStyle={buttonStyle}
                variant="primary"
                className="w-full sm:w-auto text-xs sm:text-sm py-2.5 sm:py-3.5 px-6 shadow-xl justify-center"
              >
                <Calendar className="w-4 h-4" />
                {settings.hero_cta_text || 'Reservar Cita'}
                <ArrowRight className="w-4 h-4 ml-1" />
              </ThemeButton>
              {whatsappLink && (
                <ThemeButton
                  asAnchor
                  href={whatsappLink}
                  size="sm"
                  buttonStyle={buttonStyle}
                  variant="secondary"
                  className="w-full sm:w-auto text-xs sm:text-sm py-2.5 sm:py-3.5 px-6 justify-center"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  WhatsApp
                </ThemeButton>
              )}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  // Default: Modern
  return (
    <section className="relative py-10 sm:py-16 overflow-hidden">
      <Container>
        <div className={`grid ${gridClass}`}>
          <div className={`space-y-3 sm:space-y-5 ${isMobile ? 'text-center' : 'text-left'}`}>
            {settings.hero_badge && (
              <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-pulse" />
                {settings.hero_badge}
              </span>
            )}
            <h1 className={`${headingSizeClass} tracking-tight text-[var(--foreground)] leading-[1.15] break-words`}>
              {settings.hero_title}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-[var(--muted)] leading-relaxed max-w-lg">
              {settings.hero_subtitle}
            </p>
            <div className={`flex flex-wrap items-center gap-3 pt-2 ${isMobile ? 'justify-center' : 'justify-start'}`}>
              <ThemeButton
                asAnchor
                href={bookingUrl}
                size="sm"
                buttonStyle={buttonStyle}
                variant="primary"
              >
                <Calendar className="w-4 h-4" />
                {settings.hero_cta_text || 'Reservar Cita'}
              </ThemeButton>

              {whatsappLink && (
                <ThemeButton
                  asAnchor
                  href={whatsappLink}
                  size="sm"
                  buttonStyle={buttonStyle}
                  variant="secondary"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-500" />
                  WhatsApp
                </ThemeButton>
              )}
            </div>
          </div>

          <div className="relative">
            <div className={`${imageAspectClass} rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[var(--foreground)]/10 bg-[var(--surface)]`}>
              <img
                src={
                  settings.hero_image_url ||
                  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=80'
                }
                alt={settings.hero_title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
