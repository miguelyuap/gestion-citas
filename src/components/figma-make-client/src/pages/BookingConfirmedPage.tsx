import { Calendar, CheckCircle2, Clock, Copy, Home, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import type { View } from "../App";
import { TENANT, formatPrice } from "../data/mock";

interface BookingConfirmedPageProps {
  booking: {
    service: string; specialist: string; date: string; time: string;
    duration: number; price: number; code: string;
  };
  onNavigate: (v: View) => void;
}

const CONFETTI_COLORS = ["#4F35D2", "#7C3AED", "#A78BFA", "#60A5FA", "#C084FC", "#F9A8D4"];

function ConfettiPiece({ i }: { i: number }) {
  const left = `${Math.random() * 100}%`;
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const delay = `${Math.random() * 0.8}s`;
  const duration = `${0.8 + Math.random() * 0.6}s`;
  const size = `${6 + Math.random() * 8}px`;
  const shape = Math.random() > 0.5 ? "50%" : "2px";

  return (
    <div
      className="absolute top-0 pointer-events-none"
      style={{
        left,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: shape,
        animation: `confetti ${duration} ease-out ${delay} both`,
      }}
    />
  );
}

export default function BookingConfirmedPage({ booking, onNavigate }: BookingConfirmedPageProps) {
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(booking.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => <ConfettiPiece key={i} i={i} />)}
        </div>
      )}

      <div className="max-w-md w-full animate-bounce-in relative z-10">
        {/* Success icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-success" />
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full bg-success/10 animate-ping" style={{ animationDuration: "1.5s" }} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">¡Cita agendada!</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Tu cita ha sido confirmada con éxito. Recibirás una confirmación por correo pronto.
          </p>
        </div>

        {/* Booking card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-5 shadow-lg shadow-primary/5">
          {/* Header gradient */}
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ background: "linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)" }}
          >
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">{TENANT.name}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-lg transition-colors"
            >
              <Copy className="w-3 h-3" />
              {copied ? "¡Copiado! ✓" : booking.code}
            </button>
          </div>

          <div className="p-5 space-y-3.5">
            <ConfirmRow label="Servicio" value={booking.service} />
            <ConfirmRow label="Especialista" value={booking.specialist} />
            <ConfirmRow label="Fecha" value={<span className="capitalize">{booking.date}</span>} />
            <ConfirmRow label="Hora" value={booking.time} />
            <ConfirmRow label="Duración" value={<span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.duration} min</span>} />
            <div className="pt-3 border-t border-border">
              <ConfirmRow label="Ubicación" value={<span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{TENANT.address}</span>} />
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="font-display text-xl text-foreground">{formatPrice(booking.price)}</span>
            </div>
          </div>
        </div>

        {/* Code highlight */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3.5 bg-secondary rounded-2xl border border-primary/20">
          <p className="text-xs text-muted-foreground">Código de cita:</p>
          <p className="text-sm font-bold text-primary tracking-widest font-mono">{booking.code}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate("appointments")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)", boxShadow: "0 4px 16px rgba(79,53,210,0.3)" }}
          >
            <Calendar className="w-4 h-4" />
            Ver mis citas
          </button>
          <button
            onClick={() => onNavigate("home")}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-secondary text-secondary-foreground font-semibold text-sm rounded-xl hover:bg-border transition-colors"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right flex items-center gap-1">{value}</span>
    </div>
  );
}
