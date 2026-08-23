'use client';

import React, { useState } from 'react';
import { Container } from '../shared/Container';
import { Staff } from '@/types/database';
import { ButtonStyleType } from '@/types/theme';
import { Star, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface StaffSectionProps {
  staffList: Staff[];
  bookingUrl: string;
  buttonStyle?: ButtonStyleType;
  deviceViewport?: 'desktop' | 'tablet' | 'mobile';
  onNavigateView?: (
    view: 'landing' | 'booking' | 'appointments' | 'profile',
    options?: { serviceId?: string; staffId?: string; branchId?: string }
  ) => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  isAuthenticated?: boolean;
}

const DEFAULT_SPECIALIST_PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
];

export function StaffSection({
  staffList,
  bookingUrl,
  deviceViewport,
  onNavigateView,
  onOpenAuth,
  isAuthenticated = false,
}: StaffSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (!staffList || staffList.length === 0) {
    return null;
  }

  const handleStaffClick = (e: React.MouseEvent, staffId: string) => {
    e.preventDefault();
    if (onNavigateView) {
      onNavigateView('booking', { staffId });
    } else if (!isAuthenticated && onOpenAuth) {
      onOpenAuth('login');
    } else if (typeof window !== 'undefined') {
      window.location.href = `${bookingUrl}?staffId=${staffId}`;
    }
  };

  // 6 especialistas por página en escritorio / tablet, 3 en móvil
  const itemsPerPage = deviceViewport === 'mobile' ? 3 : 6;
  const totalPages = Math.ceil(staffList.length / itemsPerPage);

  const displayedStaff = staffList.slice(
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
    const el = document.getElementById('specialists');
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section id="specialists" className="scroll-mt-24 py-20 md:py-28 bg-[#0C0A1A] relative overflow-hidden font-[var(--font-sans)]">
      <div id="staff" />
      {/* Background orb */}
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(79,53,210,0.2) 0%, transparent 70%)', filter: 'blur(40px)' }}
      />

      <Container>
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-white/10 text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
            Nuestro equipo
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-white mb-4">
            Especialistas que te cuidan
          </h2>
          <p className="text-base text-white/50 max-w-xl mx-auto">
            Profesionales certificados con años de experiencia dedicados a brindarte la mejor atención.
          </p>
        </div>

        <div className={`grid ${gridColsClass}`}>
          {displayedStaff.map((staff, idx) => {
            const photoUrl = staff.avatar_url || DEFAULT_SPECIALIST_PHOTOS[idx % DEFAULT_SPECIALIST_PHOTOS.length];
            const firstName = staff.name.split(' ')[0];

            return (
              <button
                type="button"
                key={staff.id}
                onClick={(e) => handleStaffClick(e, staff.id)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3.8] cursor-pointer bg-zinc-900 shadow-xl border border-transparent hover:border-[var(--secondary,#8B5CF6)]/50 hover:shadow-2xl hover:shadow-[var(--secondary,#8B5CF6)]/25 transition-all duration-300 focus:outline-none block w-full text-left"
              >
                {/* Photo */}
                <img
                  src={photoUrl}
                  alt={staff.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 will-change-transform"
                />

                {/* Always-visible bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Default bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 lg:group-hover:translate-y-[-100%] lg:group-hover:opacity-0">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-white/60 text-xs ml-1">(120+ reseñas)</span>
                  </div>
                  <p className="font-display text-lg text-white">{staff.name}</p>
                  <p className="text-white/60 text-xs mt-0.5 mb-2.5">Especialista certificado</p>

                  {/* Mobile & Tablet Always Visible Button */}
                  <div className="lg:hidden w-full py-2 bg-white text-[var(--secondary,#8B5CF6)] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md">
                    <Calendar className="w-3.5 h-3.5" />
                    Agendar con {firstName}
                  </div>
                </div>

                {/* Desktop Hover overlay con Color Secundario del Tema */}
                <div
                  className="hidden lg:flex absolute inset-0 flex-col justify-end p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-[var(--secondary,#8B5CF6)]/95 backdrop-blur-sm"
                >
                  <p className="font-display text-lg text-white mb-0.5">{staff.name}</p>
                  <p className="text-white/80 text-xs mb-2 font-medium">Especialista certificado</p>
                  <div className="flex items-center gap-1 mb-2.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-white/80 text-xs ml-1 font-medium">4.9 · 120 reseñas</span>
                  </div>
                  <p className="text-white/80 text-xs leading-relaxed mb-3 line-clamp-2">
                    Apasionado por la excelencia en la atención y brindar la mejor experiencia en cada sesión.
                  </p>
                  <div className="w-full py-2.5 bg-white text-[var(--secondary,#8B5CF6)] font-bold text-xs rounded-xl hover:bg-white/90 transition-colors flex items-center justify-center gap-2 active:scale-[0.98] shadow-md">
                    <Calendar className="w-3.5 h-3.5" />
                    Agendar con {firstName}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Paginación de Especialistas */}
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
              className="p-2.5 rounded-xl border border-white/20 bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors shadow-sm active:scale-95"
              aria-label="Página anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-white/70 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10">
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
              className="p-2.5 rounded-xl border border-white/20 bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-colors shadow-sm active:scale-95"
              aria-label="Página siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </Container>
    </section>
  );
}
