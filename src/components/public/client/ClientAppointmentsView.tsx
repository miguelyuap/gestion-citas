'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar, CalendarDays, CheckCircle2, ChevronRight, ChevronLeft, Clock, X,
  AlertCircle, MapPin, RotateCcw, Scissors, User,
} from 'lucide-react';
import { getClientAppointmentsAction } from '@/app/(public)/[slug]/book/actions';
import { CancelAppointmentModal } from './CancelAppointmentModal';
import { RescheduleModal } from './RescheduleModal';

interface ClientAppointmentsViewProps {
  tenantSlug: string;
  businessName: string;
  businessPhone?: string;
  workingHours: any[];
  allAppointments: any[];
  onOpenBooking: () => void;
}

type Tab = 'upcoming' | 'history';

const ITEMS_PER_PAGE = 5;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  confirmed: { label: 'Confirmada', color: 'text-[var(--success,#10B981)] bg-[var(--success,#10B981)]/10', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pending: { label: 'Pendiente', color: 'text-[var(--warning,#F59E0B)] bg-[var(--warning,#F59E0B)]/10', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelada', color: 'text-[var(--danger,#EF4444)] bg-[var(--danger,#EF4444)]/10', icon: <X className="w-3.5 h-3.5" /> },
  completed: { label: 'Completada', color: 'text-zinc-600 bg-zinc-100 border border-zinc-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
};

export function ClientAppointmentsView({
  tenantSlug,
  businessName,
  businessPhone,
  workingHours,
  allAppointments,
  onOpenBooking,
}: ClientAppointmentsViewProps) {
  const [tab, setTab] = useState<Tab>('upcoming');
  const [page, setPage] = useState(1);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);

  // Modales
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState<any>(null);
  const [selectedAppointmentForReschedule, setSelectedAppointmentForReschedule] = useState<any>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getClientAppointmentsAction(tenantSlug);
      setUpcoming(res.upcoming || []);
      setHistory(res.history || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [tenantSlug]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setPage(1);
  };

  const current = tab === 'upcoming' ? upcoming : history;
  const totalPages = Math.ceil(current.length / ITEMS_PER_PAGE) || 1;
  const paginatedCurrent = current.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (selectedAppointment) {
    const cfg = STATUS_CONFIG[selectedAppointment.status] || STATUS_CONFIG.pending;
    const dateObj = new Date(selectedAppointment.start_time);
    const dateFormatted = dateObj.toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeFormatted = dateObj.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className="max-w-md mx-auto px-4 py-8 animate-fade-in font-[var(--font-sans)]">
        <button
          onClick={() => setSelectedAppointment(null)}
          className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a mis citas
        </button>

        <div className="bg-[var(--card,#ffffff)] rounded-2xl border border-[var(--border,#E4E2EC)] overflow-hidden shadow-lg">
          <div className="bg-[var(--primary,#4F35D2)] px-5 py-4">
            <div className="flex items-center justify-between">
              <span className="text-white font-display text-lg">
                {selectedAppointment.service?.name || 'Servicio'}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/15 text-white">
                {cfg.label}
              </span>
            </div>
            <p className="text-white/70 text-xs mt-1">Cita #{selectedAppointment.id?.slice(0, 8)}</p>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center text-[var(--primary,#4F35D2)] shrink-0">
                <Scissors className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">Servicio</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{selectedAppointment.service?.name || 'Servicio'}</span>
              </div>
            </div>

            {selectedAppointment.staff?.name && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center text-[var(--primary,#4F35D2)] shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span className="text-sm text-[var(--muted-foreground)]">Especialista</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">{selectedAppointment.staff.name}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center text-[var(--primary,#4F35D2)] shrink-0">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">Fecha</span>
                <span className="text-sm font-medium text-[var(--foreground)] capitalize">{dateFormatted}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center text-[var(--primary,#4F35D2)] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center justify-between gap-2">
                <span className="text-sm text-[var(--muted-foreground)]">Hora</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{timeFormatted}</span>
              </div>
            </div>

            {selectedAppointment.branch?.name && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center text-[var(--primary,#4F35D2)] shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between gap-2">
                  <span className="text-sm text-[var(--muted-foreground)]">Ubicación</span>
                  <span className="text-sm font-medium text-[var(--foreground)]">{selectedAppointment.branch.name}</span>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[var(--border,#E4E2EC)] flex items-center justify-between">
              <span className="text-sm text-[var(--muted-foreground)]">Total</span>
              <span className="text-xl font-display text-[var(--foreground)]">
                ${Number(selectedAppointment.total_price || 0).toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>

        {['confirmed', 'pending'].includes(selectedAppointment.status) && (
          <div className="flex flex-col gap-3 mt-5">
            <button
              onClick={() => setSelectedAppointmentForReschedule(selectedAppointment)}
              className="flex items-center justify-center gap-2 py-3 bg-[var(--secondary,#F0EFFE)] text-[var(--secondary-foreground,#4F35D2)] font-semibold text-sm rounded-xl hover:bg-[var(--border)] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reprogramar cita
            </button>

            <button
              onClick={() => setSelectedAppointmentForCancel(selectedAppointment)}
              className="flex items-center justify-center gap-2 py-3 text-[var(--danger,#EF4444)] font-semibold text-sm rounded-xl border border-[var(--danger,#EF4444)]/30 hover:bg-red-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar cita
            </button>
          </div>
        )}

        <CancelAppointmentModal
          isOpen={!!selectedAppointmentForCancel}
          onClose={() => setSelectedAppointmentForCancel(null)}
          tenantSlug={tenantSlug}
          businessName={businessName}
          businessPhone={businessPhone}
          appointment={selectedAppointmentForCancel}
          onSuccess={() => {
            setSelectedAppointment(null);
            fetchAppointments();
          }}
        />

        <RescheduleModal
          isOpen={!!selectedAppointmentForReschedule}
          onClose={() => setSelectedAppointmentForReschedule(null)}
          tenantSlug={tenantSlug}
          businessName={businessName}
          businessPhone={businessPhone}
          appointment={selectedAppointmentForReschedule}
          workingHours={workingHours}
          allAppointments={allAppointments}
          onSuccess={() => {
            setSelectedAppointment(null);
            fetchAppointments();
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in font-[var(--font-sans)]">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display text-2xl text-[var(--foreground)]">Mis citas</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Gestiona tus reservas</p>
        </div>
        <button
          onClick={onOpenBooking}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary,#4F35D2)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm"
        >
          <CalendarDays className="w-4 h-4" />
          Nueva cita
        </button>
      </div>

      <div className="flex bg-white rounded-2xl p-1.5 mb-6 border border-[var(--border,#E4E2EC)] shadow-xs">
        {(['upcoming', 'history'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl transition-all ${
              tab === t
                ? 'bg-[var(--primary,#4F35D2)] text-white shadow-sm font-bold'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-zinc-50'
            }`}
          >
            {t === 'upcoming' ? `Próximas (${upcoming.length})` : `Historial (${history.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-sm text-[var(--muted-foreground)] animate-pulse">
          Cargando citas...
        </div>
      ) : current.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center mb-4">
            <CalendarDays className="w-8 h-8 text-[var(--primary,#4F35D2)]" />
          </div>
          {tab === 'upcoming' ? (
            <>
              <h3 className="font-display text-xl text-[var(--foreground)] mb-2">¿Todavía no tienes citas?</h3>
              <p className="text-sm text-[var(--muted-foreground)] max-w-xs mb-6">
                Agenda tu primera cita y comienza a disfrutar nuestros servicios.
              </p>
              <button
                onClick={onOpenBooking}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--primary,#4F35D2)] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity shadow-md"
              >
                <Calendar className="w-4 h-4" />
                Agendar cita
              </button>
            </>
          ) : (
            <>
              <h3 className="font-display text-xl text-[var(--foreground)] mb-2">Sin historial aún</h3>
              <p className="text-sm text-[var(--muted-foreground)] max-w-xs">
                Aquí aparecerán tus citas anteriores una vez que las completes.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            {paginatedCurrent.map((appt) => {
              const dateObj = new Date(appt.start_time);
              const dayNum = dateObj.getDate();
              const month = dateObj.toLocaleDateString('es-CO', { month: 'short' });
              const timeFormatted = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
              const cfg = STATUS_CONFIG[appt.status] || STATUS_CONFIG.pending;

              return (
                <div
                  key={appt.id}
                  className="bg-[var(--card,#ffffff)] rounded-2xl border border-[var(--border,#E4E2EC)] overflow-hidden hover:shadow-md hover:border-[var(--primary)]/20 transition-all"
                >
                  <div className="flex items-stretch">
                    <div className="w-16 bg-[var(--secondary,#F0EFFE)] flex flex-col items-center justify-center py-4 shrink-0">
                      <span className="text-2xl font-display text-[var(--foreground)]">{dayNum}</span>
                      <span className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">{month}</span>
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm text-[var(--foreground)]">{appt.service?.name || 'Servicio'}</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>
                      {appt.staff?.name && (
                        <p className="text-xs text-[var(--muted-foreground)] mb-1">Con {appt.staff.name}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[var(--primary)]" />
                          {timeFormatted}
                        </span>
                        <span className="text-[var(--foreground)] font-semibold">
                          ${Number(appt.total_price || 0).toLocaleString('es-CO')}
                        </span>
                      </div>

                      {['confirmed', 'pending'].includes(appt.status) && (
                        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[var(--border,#E4E2EC)]">
                          <button
                            onClick={() => setSelectedAppointment(appt)}
                            className="flex items-center gap-1 text-xs font-semibold text-[var(--primary,#4F35D2)] hover:underline"
                          >
                            Ver detalle <ChevronRight className="w-3 h-3" />
                          </button>
                          <span className="text-[var(--border)]">·</span>
                          <button
                            onClick={() => setSelectedAppointmentForReschedule(appt)}
                            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                          >
                            Reprogramar
                          </button>
                        </div>
                      )}

                      {appt.status === 'completed' && (
                        <button
                          onClick={onOpenBooking}
                          className="flex items-center gap-1 text-xs font-semibold text-[var(--primary,#4F35D2)] mt-3 hover:underline"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Reservar de nuevo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles de Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-[var(--border,#E4E2EC)] text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--border,#E4E2EC)] bg-[var(--card,#ffffff)] font-medium text-xs text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--muted,#F5F3FF)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <span className="text-xs text-[var(--muted-foreground)] font-medium">
                Página <strong className="text-[var(--foreground)] font-semibold">{page}</strong> de{' '}
                <strong className="text-[var(--foreground)] font-semibold">{totalPages}</strong>
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--border,#E4E2EC)] bg-[var(--card,#ffffff)] font-medium text-xs text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--muted,#F5F3FF)] transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <CancelAppointmentModal
        isOpen={!!selectedAppointmentForCancel}
        onClose={() => setSelectedAppointmentForCancel(null)}
        tenantSlug={tenantSlug}
        businessName={businessName}
        businessPhone={businessPhone}
        appointment={selectedAppointmentForCancel}
        onSuccess={fetchAppointments}
      />

      <RescheduleModal
        isOpen={!!selectedAppointmentForReschedule}
        onClose={() => setSelectedAppointmentForReschedule(null)}
        tenantSlug={tenantSlug}
        businessName={businessName}
        businessPhone={businessPhone}
        appointment={selectedAppointmentForReschedule}
        workingHours={workingHours}
        allAppointments={allAppointments}
        onSuccess={fetchAppointments}
      />
    </div>
  );
}

