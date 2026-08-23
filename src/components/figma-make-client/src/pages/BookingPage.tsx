import { useState, useMemo, useRef } from "react";
import {
  ArrowLeft, ArrowRight, Check, Clock, Star, X,
} from "lucide-react";
import type { View } from "../App";
import { SERVICES, SPECIALISTS, AVAILABLE_TIMES, UNAVAILABLE_TIMES, formatPrice } from "../data/mock";

interface BookingPageProps {
  onNavigate: (v: View) => void;
  onComplete: (booking: {
    service: string;
    specialist: string;
    date: string;
    time: string;
    duration: number;
    price: number;
    code: string;
  }) => void;
}

const STEPS = ["Servicio", "Especialista", "Fecha", "Hora", "Confirmar"];

export default function BookingPage({ onNavigate, onComplete }: BookingPageProps) {
  const [step, setStep] = useState(1);
  const [prevStep, setPrevStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const service = SERVICES.find((s) => s.id === selectedService);
  const specialist = SPECIALISTS.find((s) => s.id === selectedSpecialist);

  const availableSpecialists = useMemo(
    () => selectedService ? SPECIALISTS.filter((sp) => sp.serviceIds.includes(selectedService)) : SPECIALISTS,
    [selectedService]
  );

  const goTo = (next: number) => {
    setPrevStep(step);
    setStep(next);
  };

  const handleBack = () => {
    if (step === 1) onNavigate("home");
    else goTo(step - 1);
  };

  const handleNext = () => {
    if (step < 5) goTo(step + 1);
  };

  const canProceed =
    (step === 1 && !!selectedService) ||
    (step === 2 && !!selectedSpecialist) ||
    (step === 3 && !!selectedDate) ||
    (step === 4 && !!selectedTime) ||
    step === 5;

  const handleConfirm = async () => {
    if (!service || !specialist || !selectedDate || !selectedTime) return;
    setIsConfirming(true);
    await new Promise((r) => setTimeout(r, 1200));
    onComplete({
      service: service.name,
      specialist: specialist.name,
      date: selectedDate.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      time: selectedTime,
      duration: service.duration,
      price: service.price,
      code: `OC-${Math.floor(70000 + Math.random() * 10000)}`,
    });
  };

  const direction = step >= prevStep ? "forward" : "back";

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-xl text-foreground">Agendar cita</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Paso {step} de 5 — {STEPS[step - 1]}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center gap-0 mb-3">
            {STEPS.map((label, i) => {
              const n = i + 1;
              const done = n < step;
              const active = n === step;
              return (
                <div key={label} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-400 ${
                        done ? "bg-primary text-primary-foreground scale-100" :
                        active ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110" :
                        "bg-muted text-muted-foreground"
                      }`}
                    >
                      {done ? <Check className="w-4 h-4" /> : n}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium hidden sm:block transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 mx-1 rounded-full overflow-hidden bg-border">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: done ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content with slide animation */}
        <div
          key={step}
          className={direction === "forward" ? "animate-slide-in-right" : "animate-slide-in-left"}
        >
          {step === 1 && (
            <StepService
              selected={selectedService}
              onSelect={(id) => { setSelectedService(id); setSelectedSpecialist(null); }}
            />
          )}
          {step === 2 && (
            <StepSpecialist
              specialists={availableSpecialists}
              selected={selectedSpecialist}
              onSelect={setSelectedSpecialist}
            />
          )}
          {step === 3 && (
            <StepDate selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }} />
          )}
          {step === 4 && (
            <StepTime selected={selectedTime} onSelect={setSelectedTime} />
          )}
          {step === 5 && service && specialist && selectedDate && selectedTime && (
            <StepConfirm service={service} specialist={specialist} date={selectedDate} time={selectedTime} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={handleBack}
            className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {step === 1 ? "Cancelar" : "← Anterior"}
          </button>
          {step < 5 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              style={canProceed ? {
                background: "linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)",
                color: "white",
                boxShadow: "0 4px 16px rgba(79,53,210,0.3)",
              } : { background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isConfirming}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-95"
              style={{
                background: "linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)",
                color: "white",
                boxShadow: "0 4px 16px rgba(79,53,210,0.3)",
                opacity: isConfirming ? 0.75 : 1,
              }}
            >
              {isConfirming ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Confirmando...</>
              ) : (
                <><Check className="w-4 h-4" />Confirmar cita</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step 1: Service ── */
function StepService({ selected, onSelect }: { selected: string | null; onSelect: (id: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-1">Elige tu servicio</h2>
      <p className="text-sm text-muted-foreground mb-6">Selecciona el servicio que deseas reservar.</p>
      <div className="space-y-3">
        {SERVICES.map((service, i) => (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99]"
            style={{
              borderColor: selected === service.id ? "var(--primary)" : "var(--border)",
              background: selected === service.id ? "var(--secondary)" : "var(--card)",
              animationDelay: `${i * 50}ms`,
            }}
          >
            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted">
              <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-foreground text-sm">{service.name}</p>
                <p className="text-sm font-bold text-primary shrink-0">{formatPrice(service.price)}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{service.description}</p>
              <div className="flex items-center gap-1 mt-1.5 text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{service.duration} min</span>
              </div>
            </div>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
              style={{
                borderColor: selected === service.id ? "var(--primary)" : "var(--border)",
                background: selected === service.id ? "var(--primary)" : "transparent",
              }}
            >
              {selected === service.id && <Check className="w-3 h-3 text-white" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 2: Specialist ── */
function StepSpecialist({ specialists, selected, onSelect }: {
  specialists: typeof SPECIALISTS;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-1">Elige tu especialista</h2>
      <p className="text-sm text-muted-foreground mb-6">Selecciona el profesional de tu preferencia.</p>
      <div className="space-y-3">
        {specialists.map((sp) => (
          <button
            key={sp.id}
            onClick={() => onSelect(sp.id)}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99]"
            style={{
              borderColor: selected === sp.id ? "var(--primary)" : "var(--border)",
              background: selected === sp.id ? "var(--secondary)" : "var(--card)",
            }}
          >
            <img src={sp.photo} alt={sp.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">{sp.name}</p>
              <p className="text-xs text-primary font-medium mt-0.5">{sp.specialty}</p>
              <div className="flex items-center gap-1 mt-1.5">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-foreground font-medium">{sp.rating}</span>
                <span className="text-xs text-muted-foreground">({sp.reviews} reseñas)</span>
              </div>
            </div>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
              style={{
                borderColor: selected === sp.id ? "var(--primary)" : "var(--border)",
                background: selected === sp.id ? "var(--primary)" : "transparent",
              }}
            >
              {selected === sp.id && <Check className="w-3 h-3 text-white" />}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Step 3: Date ── */
function StepDate({ selected, onSelect }: { selected: Date | null; onSelect: (d: Date) => void }) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = viewMonth.toLocaleDateString("es-CO", { month: "long", year: "numeric" });

  const UNAVAILABLE = [3, 8, 15, 22, 28];
  const DAYS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const isDisabled = (day: number) => {
    const date = new Date(year, month, day);
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate()) || UNAVAILABLE.includes(day);
  };

  const isSel = (day: number) =>
    selected && selected.getDate() === day && selected.getMonth() === month && selected.getFullYear() === year;

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-1">Elige la fecha</h2>
      <p className="text-sm text-muted-foreground mb-6">Los días en gris no tienen disponibilidad.</p>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <button
            onClick={() => setViewMonth(new Date(year, month - 1, 1))}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <p className="text-sm font-semibold capitalize">{monthName}</p>
          <button
            onClick={() => setViewMonth(new Date(year, month + 1, 1))}
            className="w-8 h-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const disabled = isDisabled(day);
              const sel = isSel(day);
              const tod = isToday(day);
              return (
                <button
                  key={day}
                  disabled={disabled}
                  onClick={() => onSelect(new Date(year, month, day))}
                  className="aspect-square flex items-center justify-center rounded-xl text-sm transition-all duration-150 relative"
                  style={{
                    background: sel ? "var(--primary)" : tod && !sel ? "var(--secondary)" : "transparent",
                    color: sel ? "white" : disabled ? "var(--border)" : "var(--foreground)",
                    fontWeight: sel || tod ? "600" : "400",
                    cursor: disabled ? "not-allowed" : "pointer",
                    transform: sel ? "scale(1.1)" : "scale(1)",
                    boxShadow: sel ? "0 4px 12px rgba(79,53,210,0.35)" : "none",
                  }}
                >
                  {day}
                  {tod && !sel && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {selected && (
        <div className="mt-4 flex items-center gap-2 text-sm text-primary font-medium animate-fade-up">
          <Check className="w-4 h-4" />
          <span className="capitalize">{selected.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</span>
        </div>
      )}
    </div>
  );
}

/* ── Step 4: Time ── */
function StepTime({ selected, onSelect }: { selected: string | null; onSelect: (t: string) => void }) {
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-1">Elige el horario</h2>
      <p className="text-sm text-muted-foreground mb-6">Los horarios tachados ya están ocupados.</p>
      <div className="grid grid-cols-3 gap-3">
        {AVAILABLE_TIMES.map((time, i) => {
          const busy = UNAVAILABLE_TIMES.includes(time);
          const sel = selected === time;
          return (
            <button
              key={time}
              disabled={busy}
              onClick={() => onSelect(time)}
              className="py-3.5 px-2 rounded-xl text-sm font-medium border-2 transition-all duration-200 active:scale-95"
              style={{
                borderColor: sel ? "var(--primary)" : busy ? "var(--border)" : "var(--border)",
                background: sel ? "var(--primary)" : busy ? "var(--muted)" : "var(--card)",
                color: sel ? "white" : busy ? "var(--border)" : "var(--foreground)",
                cursor: busy ? "not-allowed" : "pointer",
                textDecoration: busy ? "line-through" : "none",
                boxShadow: sel ? "0 4px 12px rgba(79,53,210,0.3)" : "none",
                transform: sel ? "scale(1.05)" : "scale(1)",
                animationDelay: `${i * 40}ms`,
              }}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 5: Confirm ── */
function StepConfirm({ service, specialist, date, time }: {
  service: typeof SERVICES[0];
  specialist: typeof SPECIALISTS[0];
  date: Date;
  time: string;
}) {
  const dateStr = date.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <div>
      <h2 className="font-display text-2xl text-foreground mb-1">Confirma tu cita</h2>
      <p className="text-sm text-muted-foreground mb-6">Revisa el resumen antes de confirmar.</p>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {/* Service image header */}
        <div className="relative h-24 overflow-hidden">
          <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/60" />
          <div className="absolute inset-0 flex items-center px-5">
            <div>
              <p className="text-white font-display text-xl">{service.name}</p>
              <p className="text-white/70 text-xs mt-0.5">{formatPrice(service.price)} · {service.duration} min</p>
            </div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <SummaryRow label="Especialista" value={
            <div className="flex items-center gap-2">
              <img src={specialist.photo} alt={specialist.name} className="w-6 h-6 rounded-full object-cover" />
              {specialist.name}
            </div>
          } />
          <SummaryRow label="Fecha" value={<span className="capitalize">{dateStr}</span>} />
          <SummaryRow label="Hora" value={time} />
          <SummaryRow label="Duración" value={`${service.duration} minutos`} />
        </div>
        <div className="px-5 py-4 bg-secondary/50 border-t border-border flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Total a pagar</p>
            <p className="text-2xl font-display text-foreground mt-0.5">{formatPrice(service.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pago en el negocio</p>
            <div className="flex items-center justify-end gap-1 mt-1 text-success">
              <Check className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Reserva gratuita</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-start gap-2.5 p-4 bg-secondary rounded-xl">
        <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-secondary-foreground leading-relaxed">
          Recibirás una confirmación inmediata por correo con el código de tu cita.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground flex items-center gap-2">{value}</span>
    </div>
  );
}
