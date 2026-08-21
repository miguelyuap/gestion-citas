import { useState } from "react";
import {
  Calendar, CalendarDays, CheckCircle2, ChevronRight, Clock, X,
  AlertCircle, MapPin, RotateCcw, Sparkles,
} from "lucide-react";
import type { View } from "../App";
import { APPOINTMENTS, formatPrice } from "../data/mock";
import type { Appointment } from "../data/mock";

interface AppointmentsPageProps {
  onNavigate: (v: View) => void;
  onBooking: () => void;
  selectedAppointment: Appointment | null;
  onSelectAppointment: (a: Appointment | null) => void;
}

type Tab = "upcoming" | "history";

const STATUS_CONFIG = {
  confirmed: { label: "Confirmada", color: "text-success bg-success/10", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pending: { label: "Pendiente", color: "text-warning bg-warning/10", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelada", color: "text-danger bg-danger/10", icon: <X className="w-3.5 h-3.5" /> },
  completed: { label: "Completada", color: "text-muted-foreground bg-muted", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

export default function AppointmentsPage({ onNavigate, onBooking, selectedAppointment, onSelectAppointment }: AppointmentsPageProps) {
  const [tab, setTab] = useState<Tab>("upcoming");

  const upcoming = APPOINTMENTS.filter((a) => ["confirmed", "pending"].includes(a.status));
  const history = APPOINTMENTS.filter((a) => ["completed", "cancelled"].includes(a.status));
  const current = tab === "upcoming" ? upcoming : history;

  if (selectedAppointment) {
    return (
      <AppointmentDetail
        appointment={selectedAppointment}
        onBack={() => onSelectAppointment(null)}
        onReschedule={onBooking}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display text-2xl text-foreground">Mis citas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestiona tus reservas</p>
        </div>
        <button
          onClick={onBooking}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
        >
          <CalendarDays className="w-4 h-4" />
          Nueva cita
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-muted rounded-xl p-1 mb-6">
        {(["upcoming", "history"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "upcoming" ? `Próximas (${upcoming.length})` : `Historial (${history.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      {current.length === 0 ? (
        <EmptyState type={tab} onBooking={onBooking} />
      ) : (
        <div className="space-y-4">
          {current.map((appt) => (
            <AppointmentCard
              key={appt.id}
              appointment={appt}
              onView={() => onSelectAppointment(appt)}
              onReschedule={onBooking}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment: a, onView, onReschedule }: {
  appointment: Appointment;
  onView: () => void;
  onReschedule: () => void;
}) {
  const cfg = STATUS_CONFIG[a.status];
  const date = new Date(a.date);
  const dayNum = date.getDate();
  const month = date.toLocaleDateString("es-CO", { month: "short" });

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-md hover:border-primary/20 transition-all">
      <div className="flex items-stretch">
        {/* Date column */}
        <div className="w-16 bg-secondary flex flex-col items-center justify-center py-4 shrink-0">
          <span className="text-2xl font-display text-foreground">{dayNum}</span>
          <span className="text-xs font-semibold text-muted-foreground uppercase">{month}</span>
        </div>
        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-semibold text-sm text-foreground">{a.serviceName}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
              {cfg.icon}
              {cfg.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">{a.specialistName}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.time}</span>
            <span className="text-foreground font-semibold">{formatPrice(a.price)}</span>
          </div>
          {["confirmed", "pending"].includes(a.status) && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={onView}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                Ver detalle <ChevronRight className="w-3 h-3" />
              </button>
              <span className="text-border">·</span>
              <button
                onClick={onReschedule}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Reprogramar
              </button>
            </div>
          )}
          {a.status === "completed" && (
            <button onClick={onReschedule} className="flex items-center gap-1 text-xs font-semibold text-primary mt-3 hover:underline">
              <RotateCcw className="w-3 h-3" />
              Reservar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AppointmentDetail({ appointment: a, onBack, onReschedule }: {
  appointment: Appointment;
  onBack: () => void;
  onReschedule: () => void;
}) {
  const [showCancel, setShowCancel] = useState(false);
  const cfg = STATUS_CONFIG[a.status];
  const date = new Date(a.date).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="max-w-md mx-auto px-4 py-8 animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronRight className="w-4 h-4 rotate-180" />
        Volver a mis citas
      </button>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="bg-primary px-5 py-4">
          <div className="flex items-center justify-between">
            <span className="text-primary-foreground font-display text-lg">{a.serviceName}</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/15 text-white`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-primary-foreground/70 text-sm mt-1">{a.code}</p>
        </div>

        <div className="p-5 space-y-4">
          <DetailRow icon={<Sparkles />} label="Servicio" value={a.serviceName} />
          <DetailRow icon={<Calendar />} label="Especialista" value={a.specialistName} />
          <DetailRow icon={<CalendarDays />} label="Fecha" value={<span className="capitalize">{date}</span>} />
          <DetailRow icon={<Clock />} label="Hora" value={`${a.time} · ${a.duration ?? 60} min`} />
          <DetailRow icon={<MapPin />} label="Ubicación" value="Calle 85 #15-34, Bogotá" />
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-xl font-display text-foreground">{formatPrice(a.price)}</span>
          </div>
        </div>
      </div>

      {["confirmed", "pending"].includes(a.status) && (
        <div className="flex flex-col gap-3 mt-5">
          <button onClick={onReschedule} className="flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground font-semibold text-sm rounded-xl hover:bg-border transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reprogramar cita
          </button>
          <button
            onClick={() => setShowCancel(true)}
            className="flex items-center justify-center gap-2 py-3 text-danger font-semibold text-sm rounded-xl border border-danger/30 hover:bg-red-50 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar cita
          </button>
        </div>
      )}

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl p-6 animate-slide-up">
            <h3 className="font-display text-xl text-foreground mb-2">¿Cancelar la cita?</h3>
            <p className="text-sm text-muted-foreground mb-6">Esta acción no se puede deshacer. La disponibilidad del horario quedará libre.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2.5 bg-muted text-foreground font-semibold text-sm rounded-xl hover:bg-border transition-colors">
                Mantener
              </button>
              <button onClick={onBack} className="flex-1 py-2.5 bg-danger text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity">
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 [&>svg]:w-4 [&>svg]:h-4">
        {icon}
      </div>
      <div className="flex-1 flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground capitalize text-right">{value}</span>
      </div>
    </div>
  );
}

function EmptyState({ type, onBooking }: { type: Tab; onBooking: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16">
      <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <CalendarDays className="w-8 h-8 text-primary" />
      </div>
      {type === "upcoming" ? (
        <>
          <h3 className="font-display text-xl text-foreground mb-2">¿Todavía no tienes citas?</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-6">Agenda tu primera cita y comienza a disfrutar nuestros servicios.</p>
          <button onClick={onBooking} className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity">
            <Calendar className="w-4 h-4" />
            Agendar cita
          </button>
        </>
      ) : (
        <>
          <h3 className="font-display text-xl text-foreground mb-2">Sin historial aún</h3>
          <p className="text-sm text-muted-foreground max-w-xs">Aquí aparecerán tus citas anteriores una vez que las completes.</p>
        </>
      )}
    </div>
  );
}
