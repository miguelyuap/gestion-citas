'use client';

import React from 'react';
import { Container } from '../shared/Container';
import { ThemeButton } from '../shared/ThemeButton';
import { TenantSettings, ButtonStyleType } from '@/types/theme';
import { Calendar, ArrowRight, CheckCircle2, Star, Play } from 'lucide-react';

interface HeroSectionProps {
  settings: TenantSettings;
  bookingUrl: string;
  buttonStyle?: ButtonStyleType;
  variant?: 'modern' | 'elegant' | 'bold';
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
  onNavigateView?: (
    view: 'landing' | 'booking' | 'appointments' | 'profile',
    options?: { serviceId?: string; staffId?: string; branchId?: string }
  ) => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  isAuthenticated?: boolean;
}

export function HeroSection({
  settings,
  bookingUrl,
  buttonStyle = 'rounded',
  deviceViewport,
  onNavigateView,
  onOpenAuth,
  isAuthenticated = false,
}: HeroSectionProps) {
  const handleBookingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateView) {
      onNavigateView('booking');
    } else if (!isAuthenticated && onOpenAuth) {
      onOpenAuth('login');
    } else if (typeof window !== 'undefined') {
      window.location.href = bookingUrl;
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0C0A1A] min-h-[90vh] flex items-center font-[var(--font-sans)]">
      {/* Animated orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full animate-orb pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,53,210,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none animate-orb"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)',
          filter: 'blur(50px)',
          animationDelay: '3s',
        }}
      />
      <div
        className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full pointer-events-none animate-orb"
        style={{
          background: 'radial-gradient(circle, rgba(79,53,210,0.15) 0%, transparent 70%)',
          filter: 'blur(30px)',
          animationDelay: '6s',
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left — text */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-7 animate-fade-up">
              <div className="relative">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring" />
              </div>
              <span className="text-xs font-semibold text-white/70 tracking-wide uppercase">
                {settings.hero_badge || 'Reserva Online 24/7'}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 animate-fade-up delay-100">
              Reserva tu
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 50%, #C084FC 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                próxima cita
              </span>
              <br />
              fácil y rápido
            </h1>

            <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8 max-w-md animate-fade-up delay-200">
              {settings.hero_subtitle || 'Elige tu servicio, selecciona profesional y horario que prefieras. Confirmación inmediata.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12 animate-fade-up delay-300">
              <button
                type="button"
                onClick={handleBookingClick}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-semibold text-sm text-white transition-all duration-300 active:scale-95 shadow-[0_0_32px_rgba(79,53,210,0.45)] cursor-pointer"
                style={{
                  backgroundColor: 'var(--primary, #4F35D2)',
                }}
              >
                <Calendar className="w-4 h-4" />
                {settings.hero_cta_text || 'Agendar cita ahora'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('services');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm text-white/80 border border-white/15 hover:bg-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-200 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Ver servicios
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 animate-fade-up delay-400">
              <div>
                <p className="font-display text-2xl text-white">500+</p>
                <p className="text-xs text-white/40 mt-0.5">Clientes felices</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="font-display text-2xl text-white">4.9</p>
                <p className="text-xs text-white/40 mt-0.5">Calificación</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="font-display text-2xl text-white">24/7</p>
                <p className="text-xs text-white/40 mt-0.5">Agendamiento</p>
              </div>
            </div>
          </div>

          {/* Right — image */}
          <div className="relative animate-fade-up delay-200">
            <div className="relative animate-float">
              {/* Glow behind image */}
              <div
                className="absolute -inset-4 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(79,53,210,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }}
              />
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl border border-white/10">
                <img
                  src={
                    settings.hero_image_url ||
                    'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={settings.hero_title || 'Atención profesional'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div
        className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #F9F8F6)' }}
      />
    </section>
  );
}
