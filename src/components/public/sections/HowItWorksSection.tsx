'use client';

import React from 'react';
import { Container } from '../shared/Container';
import { Scissors, UserCheck, Calendar, CalendarCheck } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    icon: <Scissors className="w-6 h-6 text-[#4F35D2]" />,
    title: 'Elige tu servicio',
    desc: 'Explora y selecciona el servicio que más se adapta a ti.',
  },
  {
    step: 2,
    icon: <UserCheck className="w-6 h-6 text-[#4F35D2]" />,
    title: 'Selecciona especialista',
    desc: 'Escoge al profesional de tu preferencia.',
  },
  {
    step: 3,
    icon: <Calendar className="w-6 h-6 text-[#4F35D2]" />,
    title: 'Elige fecha y hora',
    desc: 'Selecciona el día y horario disponible.',
  },
  {
    step: 4,
    icon: <CalendarCheck className="w-6 h-6 text-[#4F35D2]" />,
    title: 'Confirma tu cita',
    desc: 'Confirmación inmediata en tu correo.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28 bg-[#F9F8F6] relative overflow-hidden font-[var(--font-sans)]">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 bg-[#F0EFFE] text-[#4F35D2]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F35D2]" />
            ¿Cómo funciona?
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-[#18181B] mb-3">
            En 4 pasos, listo
          </h2>
          <p className="text-base text-[#71717A] max-w-xl mx-auto">
            Agendar nunca había sido tan sencillo.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto mt-14">
          {/* Horizontal Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-[2px] bg-[#4F35D2] z-0" />

          {/* Grid of steps */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {STEPS.map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center group">
                {/* Step box with number badge */}
                <div className="relative mb-5">
                  <div className="w-20 h-20 rounded-2xl bg-white border border-[#E4E2EC] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#4F35D2] text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {step.step}
                  </div>
                </div>

                <h3 className="font-display text-lg text-[#18181B] mb-2">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#71717A] leading-relaxed max-w-[210px]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
