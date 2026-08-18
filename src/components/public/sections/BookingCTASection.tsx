import React from 'react';
import { Container } from '../shared/Container';
import { ThemeButton } from '../shared/ThemeButton';
import { ButtonStyleType } from '@/types/theme';
import { Calendar, Sparkles } from 'lucide-react';

interface BookingCTASectionProps {
  bookingUrl: string;
  buttonStyle?: ButtonStyleType;
}

export function BookingCTASection({
  bookingUrl,
  buttonStyle = 'rounded',
}: BookingCTASectionProps) {
  return (
    <section className="py-20 bg-gradient-to-r from-[var(--primary)]/20 via-[var(--surface)] to-[var(--secondary)]/20 border-y border-[var(--foreground)]/10 text-center relative overflow-hidden">
      <Container className="relative z-10 space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold border border-[var(--primary)]/20">
          <Sparkles className="w-4 h-4" />
          ¿LISTO PARA TU PRÓXIMA CITA?
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
          Reserva tu lugar en menos de un minuto
        </h2>
        <p className="text-base sm:text-lg text-[var(--muted)] max-w-xl mx-auto">
          Elige el servicio, el profesional y el horario que mejor se adapten a tu día. Sin esperas y totalmente digital.
        </p>
        <div className="pt-4 flex justify-center">
          <ThemeButton
            asAnchor
            href={bookingUrl}
            size="lg"
            buttonStyle={buttonStyle}
            variant="primary"
            className="shadow-2xl text-lg px-10 py-5"
          >
            <Calendar className="w-6 h-6" />
            RESERVAR AHORA
          </ThemeButton>
        </div>
      </Container>
    </section>
  );
}
