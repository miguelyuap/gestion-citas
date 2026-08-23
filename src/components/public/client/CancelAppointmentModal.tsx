'use client';

import React, { useState } from 'react';
import { AlertTriangle, X, Calendar, Clock, Scissors, User } from 'lucide-react';
import { cancelAppointmentAction } from '@/app/(public)/[slug]/book/actions';
import NotificationService from '@/lib/services/notification.service';
import WhatsAppService from '@/lib/services/whatsapp.service';

interface CancelAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  businessName: string;
  businessPhone?: string;
  appointment: any;
  onSuccess: () => void;
}

export function CancelAppointmentModal({
  isOpen,
  onClose,
  tenantSlug,
  businessName,
  businessPhone,
  appointment,
  onSuccess,
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !appointment) return null;

  const dateObj = new Date(appointment.start_time);
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

  const handleConfirmCancel = async () => {
    setLoading(true);
    try {
      const res = await cancelAppointmentAction({
        slug: tenantSlug,
        appointmentId: appointment.id,
        reason,
      });

      if (res.error) {
        NotificationService.error('Error al cancelar', res.error);
      } else {
        NotificationService.success(
          'Cita Cancelada',
          'Tu cita ha sido cancelada correctamente y el horario ha sido liberado.'
        );

        onSuccess();
        onClose();
      }
    } catch (e: any) {
      NotificationService.error('Error inesperado', e?.message || 'Ocurrió un problema.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--foreground)]/10 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--background)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-extrabold text-[var(--foreground)]">Cancelar Reserva</h3>
          <p className="text-xs text-[var(--muted)]">
            ¿Estás seguro de que deseas cancelar la siguiente cita?
          </p>
        </div>

        {/* Resumen de la cita */}
        <div className="p-4 rounded-2xl bg-[var(--background)] border border-[var(--foreground)]/10 space-y-2 text-xs mb-4">
          <div className="flex items-center justify-between font-bold text-[var(--foreground)]">
            <span className="flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[var(--primary)]" />
              {appointment.service?.name || 'Servicio'}
            </span>
            <span className="text-[var(--primary)] font-extrabold">${appointment.total_price}</span>
          </div>

          {appointment.staff?.name && (
            <div className="flex items-center gap-1.5 text-[var(--muted)]">
              <User className="w-3.5 h-3.5 text-[var(--muted)]" />
              <span>{appointment.staff.name}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[var(--muted)] capitalize">
            <Calendar className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>{dateFormatted}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--muted)]">
            <Clock className="w-3.5 h-3.5 text-[var(--muted)]" />
            <span>{timeFormatted}</span>
          </div>
        </div>

        {/* Motivo */}
        <div className="space-y-1 mb-6">
          <label className="block text-xs font-semibold text-[var(--foreground)]">
            Motivo de cancelación (Opcional)
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Escribe brevemente la razón por la que cancelas..."
            className="w-full p-3 text-xs rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        {/* Botones */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-[var(--foreground)]/10 text-[var(--foreground)] font-bold text-xs hover:bg-[var(--background)] transition-colors"
          >
            Volver atrás
          </button>

          <button
            onClick={handleConfirmCancel}
            disabled={loading}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Sí, Cancelar Cita'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
