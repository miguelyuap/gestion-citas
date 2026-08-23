import { useState, useEffect, useRef } from "react";
import {
  ArrowRight, CheckCircle2, Clock, MapPin, Phone, Mail,
  Scissors, Star, ChevronRight, Calendar,
  UserCheck, CalendarCheck, ChevronLeft, Play,
} from "lucide-react";
import type { View } from "../App";
import { TENANT, SERVICES, SPECIALISTS, TESTIMONIALS, formatPrice } from "../data/mock";
import { useScrollReveal, useStaggerReveal } from "../hooks/useScrollReveal";
import { useCounter } from "../hooks/useCounter";

interface HomePageProps {
  onNavigate: (v: View) => void;
  onBooking: () => void;
}

export default function HomePage({ onNavigate, onBooking }: HomePageProps) {
  return (
    <div>
      <HeroSection onBooking={onBooking} />
      <ServicesSection onBooking={onBooking} />
      <SpecialistsSection onBooking={onBooking} />
      <HowItWorksSection />
      <TestimonialsSection />
      <BusinessInfoSection />
      {/* Mobile floating CTA */}
      <MobileFloatingCTA onBooking={onBooking} />
    </div>
  );
}

/* ─────────────────────────── HERO ─────────────────────────── */
function HeroSection({ onBooking }: { onBooking: () => void }) {
  const { ref: statsRef, visible: statsVisible } = useScrollReveal(0.3);
  const count1 = useCounter(500, 1500, statsVisible);
  const count2 = useCounter(49, 1200, statsVisible);
  const count3 = useCounter(3, 800, statsVisible);

  return (
    <section className="relative overflow-hidden bg-[#0C0A1A] min-h-[90vh] flex items-center">
      {/* Animated orbs */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full animate-orb pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,53,210,0.35) 0%, transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "orb 14s ease-in-out 3s infinite",
        }}
      />
      <div
        className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(79,53,210,0.15) 0%, transparent 70%)",
          filter: "blur(30px)",
          animation: "orb 18s ease-in-out 6s infinite",
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
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
                {TENANT.heroBadge}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 animate-fade-up delay-100">
              Reserva tu
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #A78BFA 0%, #60A5FA 50%, #C084FC 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                próxima cita
              </span>
              <br />
              fácil y rápido
            </h1>

            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-md animate-fade-up delay-200">
              {TENANT.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-12 animate-fade-up delay-300">
              <button
                onClick={onBooking}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-semibold text-sm transition-all duration-300 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)",
                  boxShadow: "0 0 32px rgba(79,53,210,0.45), 0 4px 16px rgba(0,0,0,0.3)",
                }}
              >
                <Calendar className="w-4 h-4" />
                Agendar cita ahora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-semibold text-sm text-white/80 border border-white/15 hover:bg-white/8 hover:border-white/30 transition-all duration-200 active:scale-95"
                style={{ backdropFilter: "blur(10px)" }}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Ver servicios
              </button>
            </div>

            {/* Stats */}
            <div ref={statsRef} className="flex items-center gap-6 animate-fade-up delay-400">
              <StatBadge label="Clientes" value={`${count1}+`} active={statsVisible} />
              <div className="w-px h-10 bg-white/10" />
              <StatBadge label="Calificación" value={`${(count2 / 10).toFixed(1)}`} active={statsVisible} />
              <div className="w-px h-10 bg-white/10" />
              <StatBadge label="Especialistas" value={`${count3}`} active={statsVisible} />
            </div>
          </div>

          {/* Right — image */}
          <div className="relative animate-fade-up delay-200">
            <div className="relative animate-float">
              {/* Glow behind image */}
              <div
                className="absolute -inset-4 rounded-3xl pointer-events-none"
                style={{ background: "radial-gradient(ellipse, rgba(79,53,210,0.3) 0%, transparent 70%)", filter: "blur(20px)" }}
              />
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl border border-white/10">
                <img
                  src={TENANT.heroImage}
                  alt="Studio Avara — espacio de bienestar"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </div>

            {/* Floating appointment card */}
            <div
              className="absolute -bottom-5 -left-6 bg-white/10 border border-white/20 rounded-2xl p-4 animate-float-delayed shadow-xl"
              style={{ backdropFilter: "blur(16px)" }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Cita confirmada</p>
                  <p className="text-xs text-white/50 mt-0.5">Hoy · 10:00 AM · Laura M.</p>
                </div>
              </div>
            </div>

            {/* Floating rating badge */}
            <div
              className="absolute -top-4 -right-4 bg-white/10 border border-white/20 rounded-2xl p-3.5 animate-float shadow-xl"
              style={{ backdropFilter: "blur(16px)", animationDelay: "0.8s" }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-xs font-bold text-white">4.9 · 304 reseñas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade to page background */}
      <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, #F9F8F6)" }}
      />
    </section>
  );
}

function StatBadge({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div>
      <p
        className="font-display text-2xl text-white transition-all duration-700"
        style={{ opacity: active ? 1 : 0, transform: active ? "none" : "translateY(8px)" }}
      >
        {value}
      </p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
    </div>
  );
}

/* ─────────────────────────── SERVICES ─────────────────────────── */
function ServicesSection({ onBooking }: { onBooking: () => void }) {
  const { ref, getItemProps } = useStaggerReveal(SERVICES.length);

  return (
    <section id="services" className="py-20 md:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Nuestros servicios"
          title="Todo lo que necesitas"
          subtitle="Servicios profesionales diseñados para darte la mejor experiencia."
        />
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {SERVICES.map((service, i) => (
            <div key={service.id} {...getItemProps(i)}>
              <ServiceCard service={service} onBook={onBooking} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, onBook }: { service: typeof SERVICES[0]; onBook: () => void }) {
  return (
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border cursor-pointer transition-all duration-400 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20">
      {/* Image with overlay */}
      <div className="relative overflow-hidden aspect-[4/3] bg-muted">
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        {/* Slide-up CTA */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-350">
          <button
            onClick={onBook}
            className="w-full py-2.5 bg-white text-primary font-bold text-sm rounded-xl hover:bg-primary-foreground transition-colors"
          >
            Agendar ahora →
          </button>
        </div>
        {/* Category pill */}
        <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/40 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
          {service.category}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-lg text-foreground">{service.name}</h3>
          <span className="text-base font-bold text-primary shrink-0">{formatPrice(service.price)}</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{service.description}</p>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{service.duration} min</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── SPECIALISTS ─────────────────────────── */
function SpecialistsSection({ onBooking }: { onBooking: () => void }) {
  const { ref, getItemProps } = useStaggerReveal(SPECIALISTS.length);

  return (
    <section className="py-20 md:py-28 bg-[#0C0A1A] relative overflow-hidden">
      {/* Background orbs */}
      <div
        className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(79,53,210,0.2) 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Nuestro equipo"
          title="Especialistas que te cuidan"
          subtitle="Profesionales certificados con años de experiencia."
          dark
        />
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {SPECIALISTS.map((sp, i) => (
            <div key={sp.id} {...getItemProps(i)}>
              <SpecialistCard specialist={sp} onBook={onBooking} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SpecialistCard({ specialist: sp, onBook }: { specialist: typeof SPECIALISTS[0]; onBook: () => void }) {
  const services = sp.serviceIds.map((id) => SERVICES.find((s) => s.id === id)?.name).filter(Boolean);

  return (
    <div className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer bg-zinc-900">
      {/* Photo */}
      <img
        src={sp.photo}
        alt={sp.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Always-visible bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Default bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-5 transition-all duration-400 group-hover:translate-y-[-100%] group-hover:opacity-0">
        <div className="flex items-center gap-1 mb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-white/60 text-xs ml-1">({sp.reviews})</span>
        </div>
        <p className="font-display text-xl text-white">{sp.name}</p>
        <p className="text-white/60 text-sm mt-0.5">{sp.specialty}</p>
      </div>

      {/* Hover overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-400"
        style={{ background: "linear-gradient(to top, rgba(79,53,210,0.97) 60%, rgba(79,53,210,0.7) 100%)" }}
      >
        <p className="font-display text-xl text-white mb-1">{sp.name}</p>
        <p className="text-white/70 text-sm mb-3">{sp.specialty}</p>
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-white/60 text-xs ml-1">{sp.rating} · {sp.reviews} reseñas</span>
        </div>
        <p className="text-white/70 text-xs leading-relaxed mb-4 line-clamp-3">{sp.bio}</p>
        <div className="flex flex-wrap gap-1.5 mb-5">
          {services.slice(0, 3).map((name) => (
            <span key={name} className="text-xs bg-white/15 text-white/90 px-2.5 py-1 rounded-full">
              {name}
            </span>
          ))}
        </div>
        <button
          onClick={onBook}
          className="w-full py-3 bg-white text-primary font-bold text-sm rounded-xl hover:bg-primary-foreground transition-colors active:scale-[0.98]"
        >
          Agendar con {sp.name.split(" ")[0]}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────── HOW IT WORKS ─────────────────────────── */
const HOW_IT_WORKS = [
  { step: 1, icon: <Scissors className="w-6 h-6" />, title: "Elige tu servicio", desc: "Explora y selecciona el servicio que más se adapta a ti." },
  { step: 2, icon: <UserCheck className="w-6 h-6" />, title: "Selecciona especialista", desc: "Escoge al profesional de tu preferencia." },
  { step: 3, icon: <Calendar className="w-6 h-6" />, title: "Elige fecha y hora", desc: "Selecciona el día y horario disponible." },
  { step: 4, icon: <CalendarCheck className="w-6 h-6" />, title: "Confirma tu cita", desc: "Confirmación inmediata en tu correo." },
];

function HowItWorksSection() {
  const { ref, getItemProps } = useStaggerReveal(HOW_IT_WORKS.length, 0.2);
  const { ref: lineRef, visible: lineVisible } = useScrollReveal(0.3);

  return (
    <section className="py-20 md:py-28 bg-secondary/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader badge="¿Cómo funciona?" title="En 4 pasos, listo" subtitle="Agendar nunca había sido tan sencillo." />

        {/* Animated connecting line (desktop) */}
        <div ref={lineRef} className="hidden md:block relative h-0.5 bg-border mx-20 mt-14 mb-[-2.5rem] overflow-hidden">
          <div
            className="absolute inset-0 bg-primary origin-left transition-all duration-1500 ease-out"
            style={{ transform: lineVisible ? "scaleX(1)" : "scaleX(0)" }}
          />
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-14">
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.step} {...getItemProps(i)} className="flex flex-col items-center text-center">
              {/* Step circle */}
              <div className="relative mb-5 z-10">
                <div className="w-16 h-16 rounded-2xl bg-card border-2 border-border flex items-center justify-center text-primary shadow-md">
                  {step.icon}
                </div>
                <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg">
                  {step.step}
                </div>
              </div>
              <h3 className="font-display text-lg text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── TESTIMONIALS ─────────────────────────── */
function TestimonialsSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ref, visible } = useScrollReveal(0.2);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, [paused]);

  const prev = () => { setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length); setPaused(true); };
  const next = () => { setCurrent((c) => (c + 1) % TESTIMONIALS.length); setPaused(true); };

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 bg-background relative overflow-hidden"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition: "all 0.6s ease" }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Testimonios"
          title="Lo que dicen nuestros clientes"
          subtitle="Más de 500 personas confían en Studio Avara."
        />

        <div className="relative mt-12">
          {/* Cards */}
          <div className="overflow-hidden rounded-3xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {TESTIMONIALS.map((t) => (
                <div key={t.id} className="min-w-full px-2">
                  <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="font-display text-xl md:text-2xl text-foreground leading-relaxed mb-8">
                      &ldquo;{t.comment}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-secondary" />
                      <div>
                        <p className="font-semibold text-foreground">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.service}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-7">
            <button onClick={prev} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setPaused(true); }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: current === i ? "24px" : "8px",
                    height: "8px",
                    background: current === i ? "var(--primary)" : "var(--border)",
                  }}
                />
              ))}
            </div>
            <button onClick={next} className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── BUSINESS INFO ─────────────────────────── */
function BusinessInfoSection() {
  const { ref, visible } = useScrollReveal(0.15);

  return (
    <section
      ref={ref}
      className="py-20 md:py-28 bg-muted/40"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(32px)", transition: "all 0.6s ease" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <SectionHeader badge="Encuéntranos" title="Visítanos" subtitle="Estamos aquí para atenderte." align="left" />
            <div className="space-y-4 mt-8">
              <InfoRow icon={<MapPin />} label="Dirección" value={TENANT.address} />
              <InfoRow icon={<Clock />} label="Horarios" value={TENANT.hours} />
              <InfoRow icon={<Phone />} label="Teléfono" value={TENANT.phone} />
              <InfoRow icon={<Mail />} label="Email" value={TENANT.email} />
            </div>
            <div className="flex items-center gap-3 mt-7">
              <SocialChip label="@studioavara" />
              <SocialChip label="Studio Avara" />
            </div>
          </div>
          {/* Map placeholder */}
          <div className="rounded-2xl overflow-hidden border border-border aspect-[4/3] bg-secondary relative flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <MapPin className="w-7 h-7 text-primary" />
              </div>
              <p className="font-display text-xl text-foreground mb-1">{TENANT.name}</p>
              <p className="text-sm text-muted-foreground">{TENANT.address}</p>
              <a
                href={`https://maps.google.com?q=${encodeURIComponent(TENANT.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Ver en Google Maps
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── MOBILE FLOATING CTA ─────────────────────────── */
function MobileFloatingCTA({ onBooking }: { onBooking: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="md:hidden fixed bottom-20 left-1/2 z-40 transition-all duration-400"
      style={{
        transform: `translateX(-50%) ${visible ? "translateY(0)" : "translateY(20px)"}`,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <button
        onClick={onBooking}
        className="flex items-center gap-2.5 px-6 py-3.5 rounded-full font-semibold text-sm text-white shadow-2xl transition-all active:scale-95"
        style={{
          background: "linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)",
          boxShadow: "0 8px 32px rgba(79,53,210,0.5)",
        }}
      >
        <Calendar className="w-4 h-4" />
        Agendar cita
        <Sparkles className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ─────────────────────────── SHARED ─────────────────────────── */
function SectionHeader({
  badge, title, subtitle, align = "center", dark = false,
}: {
  badge: string; title: string; subtitle: string; align?: "center" | "left"; dark?: boolean;
}) {
  return (
    <div className={align === "center" ? "text-center" : ""}>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${dark ? "bg-white/10 text-white/70" : "bg-secondary text-secondary-foreground"}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
        {badge}
      </div>
      <h2 className={`font-display text-3xl md:text-4xl mb-4 ${dark ? "text-white" : "text-foreground"} ${align === "center" ? "" : "max-w-xs"}`}>
        {title}
      </h2>
      <p className={`text-base leading-relaxed ${dark ? "text-white/50" : "text-muted-foreground"} ${align === "center" ? "max-w-xl mx-auto" : "max-w-sm"}`}>
        {subtitle}
      </p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0 text-primary [&>svg]:w-4 [&>svg]:h-4">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function SocialChip({ label }: { label: string }) {
  return (
    <a href="#" className="flex items-center gap-2 px-4 py-2.5 bg-foreground text-primary-foreground text-sm font-medium rounded-xl hover:opacity-80 transition-opacity">
      {label}
    </a>
  );
}

// Missing icon - using local
function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M5 17l.75 2.25L8 20l-2.25.75L5 23l-.75-2.25L2 20l2.25-.75L5 17z" />
      <path d="M19 1l.5 1.5L21 3l-1.5.5L19 5l-.5-1.5L17 3l1.5-.5L19 1z" />
    </svg>
  );
}
