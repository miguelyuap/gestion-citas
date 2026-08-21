'use client';

import React, { useState, useMemo, useTransition, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Scissors,
  MapPin,
  Check,
  ArrowLeft,
  ArrowRight,
  Star,
  Copy,
  Home,
  Building2,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { generateAvailableSlots, getEffectiveWorkingHour } from '@/lib/availability';
import { Appointment, Service, Staff, TimeSlot, WorkingHour, Branch } from '@/types/database';
import { createPublicAppointmentAction } from '@/app/(public)/[slug]/book/actions';
import NotificationService from '@/lib/services/notification.service';
import WhatsAppService from '@/lib/services/whatsapp.service';

interface TimeSlotPickerProps {
  tenantSlug?: string;
  businessName?: string;
  businessPhone?: string;
  service: Service;
  services?: Service[];
  branches?: Branch[];
  staffMembers: Staff[];
  workingHours?: WorkingHour[];
  workingHoursMap?: Record<string, WorkingHour[]>;
  existingAppointmentsMap?: Record<string, Appointment[]>;
  allAppointments?: Appointment[];
  currentClient?: any;
  onConfirmBooking?: (bookingDetails: {
    staff: Staff;
    service: Service;
    date: Date;
    slot: TimeSlot;
  }) => void;
  onViewAppointments?: () => void;
  onNavigateHome?: () => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  initialStaffId?: string;
  initialServiceId?: string;
  initialBranchId?: string;
}

const CONFETTI_COLORS = ['#4F35D2', '#7C3AED', '#A78BFA', '#60A5FA', '#C084FC', '#F9A8D4'];

function ConfettiPiece({ i }: { i: number }) {
  const left = `${Math.random() * 100}%`;
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const delay = `${Math.random() * 0.8}s`;
  const duration = `${0.8 + Math.random() * 0.6}s`;
  const size = `${6 + Math.random() * 8}px`;
  const shape = Math.random() > 0.5 ? '50%' : '2px';

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

const DEFAULT_SERVICE_IMAGES = [
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80',
];

const DEFAULT_STAFF_PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
];

export function TimeSlotPicker({
  tenantSlug,
  businessName = 'el negocio',
  businessPhone,
  service,
  services = [],
  branches = [],
  staffMembers,
  workingHours,
  workingHoursMap,
  existingAppointmentsMap = {},
  allAppointments = [],
  currentClient,
  onConfirmBooking,
  onViewAppointments,
  onNavigateHome,
  onOpenAuth,
  initialStaffId,
  initialServiceId,
  initialBranchId,
}: TimeSlotPickerProps) {
  const [step, setStep] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Filtrar sucursales activas
  const activeBranches = useMemo(() => branches.filter((b) => b.is_active), [branches]);
  const hasMultipleBranches = activeBranches.length > 1;

  const STEPS = useMemo(() => {
    return hasMultipleBranches
      ? ['Sucursal', 'Servicio', 'Especialista', 'Fecha', 'Hora', 'Confirmar']
      : ['Servicio', 'Especialista', 'Fecha', 'Hora', 'Confirmar'];
  }, [hasMultipleBranches]);

  const maxSteps = STEPS.length;

  // Lista unificada de workingHours
  const flatWorkingHours = useMemo(() => {
    if (workingHours && workingHours.length > 0) return workingHours;
    if (workingHoursMap) {
      return Object.values(workingHoursMap).flat();
    }
    return [];
  }, [workingHours, workingHoursMap]);

  // Selección de servicio
  const [selectedService, setSelectedService] = useState<Service>(() => {
    if (initialServiceId && services.length > 0) {
      const found = services.find((s) => s.id === initialServiceId);
      if (found) return found;
    }
    return service || services[0];
  });

  // Selección de sucursal
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(() => {
    if (initialBranchId && branches.length > 0) {
      const found = branches.find((b) => b.id === initialBranchId);
      if (found) return found;
    }
    return activeBranches.length > 0 ? activeBranches[0] : null;
  });

  // Filtrar personal por sucursal seleccionada
  const filteredStaff = useMemo(() => {
    if (!selectedBranch) return staffMembers;
    return staffMembers.filter((s) => !s.branch_id || s.branch_id === selectedBranch.id);
  }, [staffMembers, selectedBranch]);

  // Selección de profesional
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(() => {
    if (initialStaffId && staffMembers.length > 0) {
      const found = staffMembers.find((s) => s.id === initialStaffId);
      if (found) return found;
    }
    return filteredStaff[0] || staffMembers[0] || null;
  });

  // Si cambia la sucursal seleccionada y el personal actual no pertenece a la nueva sucursal, seleccionar el primero disponible
  useEffect(() => {
    if (selectedBranch && selectedStaff && selectedStaff.branch_id && selectedStaff.branch_id !== selectedBranch.id) {
      if (filteredStaff.length > 0) {
        setSelectedStaff(filteredStaff[0]);
      }
    }
  }, [selectedBranch, selectedStaff, filteredStaff]);

  useEffect(() => {
    if (initialStaffId && staffMembers.length > 0) {
      const found = staffMembers.find((s) => s.id === initialStaffId);
      if (found) setSelectedStaff(found);
    }
  }, [initialStaffId, staffMembers]);

  useEffect(() => {
    if (initialServiceId && services.length > 0) {
      const found = services.find((s) => s.id === initialServiceId);
      if (found) setSelectedService(found);
    }
  }, [initialServiceId, services]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [isPending, startTransition] = useTransition();
  const [bookedSuccess, setBookedSuccess] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  // Estados de paginación para servicios y especialistas (4 por página)
  const [servicePage, setServicePage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);

  const SERVICES_PER_PAGE = 4;
  const totalServicePages = Math.ceil(services.length / SERVICES_PER_PAGE) || 1;
  const paginatedServices = useMemo(() => {
    return services.slice((servicePage - 1) * SERVICES_PER_PAGE, servicePage * SERVICES_PER_PAGE);
  }, [services, servicePage]);

  const STAFF_PER_PAGE = 4;
  const totalStaffPages = Math.ceil(filteredStaff.length / STAFF_PER_PAGE) || 1;
  const paginatedStaff = useMemo(() => {
    return filteredStaff.slice((staffPage - 1) * STAFF_PER_PAGE, staffPage * STAFF_PER_PAGE);
  }, [filteredStaff, staffPage]);

  useEffect(() => {
    setStaffPage(1);
  }, [selectedBranch, filteredStaff]);

  // Verificar si un día específico tiene al menos un turno disponible
  const isDateAvailable = (date: Date): boolean => {
    if (!selectedStaff) return false;

    const dayOfWeek = date.getDay();
    const effectiveWorkingHour = getEffectiveWorkingHour(
      flatWorkingHours,
      selectedStaff.id,
      dayOfWeek
    );

    if (!effectiveWorkingHour || effectiveWorkingHour.is_day_off) {
      return false;
    }

    const staffAppointments =
      existingAppointmentsMap[selectedStaff.id] ||
      allAppointments.filter((a) => a.staff_id === selectedStaff.id);

    const generatedSlots = generateAvailableSlots({
      selectedDate: date,
      serviceDurationMinutes: selectedService.duration_minutes,
      bufferMinutes: selectedService.buffer_time_minutes || 0,
      slotIntervalMinutes: 30,
      workingHour: effectiveWorkingHour,
      existingAppointments: staffAppointments,
    });

    return generatedSlots.some((s) => s.available);
  };

  // Filtrar ÚNICAMENTE las fechas que cuentan con disponibilidad real
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    for (let i = 0; i < 30 && dates.length < 14; i++) {
      const candidate = addDays(new Date(), i);
      if (isDateAvailable(candidate)) {
        dates.push(candidate);
      }
    }
    return dates;
  }, [selectedStaff, selectedService, flatWorkingHours, existingAppointmentsMap, allAppointments]);

  // Asegurar que selectedDate sea una fecha válida con disponibilidad
  useEffect(() => {
    if (availableDates.length > 0) {
      const exists = availableDates.some((d) => isSameDay(d, selectedDate));
      if (!exists) {
        setSelectedDate(availableDates[0]);
      }
    }
  }, [availableDates]);

  // Slots de horarios
  const slots = useMemo(() => {
    if (!selectedStaff) return [];

    const dayOfWeek = selectedDate.getDay();
    const effectiveWorkingHour = getEffectiveWorkingHour(
      flatWorkingHours,
      selectedStaff.id,
      dayOfWeek
    );

    const staffAppointments =
      existingAppointmentsMap[selectedStaff.id] ||
      allAppointments.filter((a) => a.staff_id === selectedStaff.id);

    return generateAvailableSlots({
      selectedDate,
      serviceDurationMinutes: selectedService.duration_minutes,
      bufferMinutes: selectedService.buffer_time_minutes || 0,
      slotIntervalMinutes: 30,
      workingHour: effectiveWorkingHour,
      existingAppointments: staffAppointments,
    });
  }, [selectedStaff, selectedDate, selectedService, flatWorkingHours, existingAppointmentsMap, allAppointments]);

  // Identificar qué pantalla mostrar según el paso actual
  const currentStepKey = useMemo(() => {
    if (hasMultipleBranches) {
      switch (step) {
        case 1: return 'branch';
        case 2: return 'service';
        case 3: return 'staff';
        case 4: return 'date';
        case 5: return 'time';
        case 6: return 'confirm';
        default: return 'branch';
      }
    } else {
      switch (step) {
        case 1: return 'service';
        case 2: return 'staff';
        case 3: return 'date';
        case 4: return 'time';
        case 5: return 'confirm';
        default: return 'service';
      }
    }
  }, [hasMultipleBranches, step]);

  const canProceed = useMemo(() => {
    switch (currentStepKey) {
      case 'branch': return !!selectedBranch;
      case 'service': return !!selectedService;
      case 'staff': return !!selectedStaff;
      case 'date': return !!selectedDate;
      case 'time': return !!selectedSlot;
      case 'confirm': return true;
      default: return false;
    }
  }, [currentStepKey, selectedBranch, selectedService, selectedStaff, selectedDate, selectedSlot]);

  const handleNext = () => {
    if (step < maxSteps && canProceed) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      if (onNavigateHome) {
        onNavigateHome();
      } else if (typeof window !== 'undefined') {
        window.location.href = `/${tenantSlug}`;
      }
    }
  };

  const handleBookingSubmit = () => {
    if (!currentClient) {
      NotificationService.info(
        'Inicio de Sesión Requerido',
        'Para poder agendar tu cita debes iniciar sesión o crear tu cuenta.'
      );
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    if (!selectedStaff || !selectedSlot || !tenantSlug) {
      NotificationService.warning('Selección Incompleta', 'Por favor selecciona un profesional, fecha y hora.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await createPublicAppointmentAction({
          slug: tenantSlug,
          serviceId: selectedService.id,
          staffId: selectedStaff.id,
          branchId: selectedBranch?.id,
          startTimeIso: selectedSlot.start.toISOString(),
          clientName: currentClient.name,
          clientEmail: currentClient.email,
          clientPhone: currentClient.phone,
        });

        if (res.error) {
          NotificationService.error('Error al Agendar', res.error);
        } else {
          setBookedSuccess(true);
          setShowConfetti(true);
          setCreatedAppointment(res.appointment);
          setTimeout(() => setShowConfetti(false), 3000);

          if (onConfirmBooking) {
            onConfirmBooking({
              staff: selectedStaff,
              service: selectedService,
              date: selectedDate,
              slot: selectedSlot,
            });
          }
        }
      } catch (err: any) {
        NotificationService.error('Error del Servidor', err.message || 'No se pudo completar la reserva.');
      }
    });
  };

  // PANTALLA DE ÉXITO EXACTA DE BookingConfirmedPage
  if (bookedSuccess && selectedSlot && selectedStaff) {
    const appointmentCode = createdAppointment?.id ? `OC-${createdAppointment.id.slice(0, 5).toUpperCase()}` : 'OC-78492';
    const dateStr = format(selectedSlot.start, "EEEE d 'de' MMMM, yyyy", { locale: es });
    const timeFormatted = selectedSlot.formattedStart;

    const handleCopyCode = () => {
      navigator.clipboard.writeText(appointmentCode).catch(() => {});
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 relative overflow-hidden font-[var(--font-sans)]">
        {showConfetti && (
          <div className="absolute inset-x-0 top-0 h-full pointer-events-none overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <ConfettiPiece key={i} i={i} />
            ))}
          </div>
        )}

        <div className="max-w-md w-full animate-bounce-in relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-5">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: '1.5s' }} />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-[var(--foreground,#18181B)] mb-3">¡Cita agendada!</h1>
            <p className="text-[var(--muted-foreground,#71717A)] text-sm leading-relaxed max-w-xs">
              Tu cita ha sido confirmada con éxito. Recibirás una notificación en tu WhatsApp.
            </p>
          </div>

          <div className="bg-[var(--card,#ffffff)] rounded-2xl border border-[var(--border,#E4E2EC)] overflow-hidden mb-5 shadow-lg">
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)' }}
            >
              <div className="flex items-center gap-2 text-white">
                <CalendarIcon className="w-4 h-4" />
                <span className="text-sm font-semibold">{businessName}</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <Copy className="w-3 h-3" />
                {copiedCode ? '¡Copiado! ✓' : appointmentCode}
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--muted-foreground)]">Servicio</span>
                <span className="font-medium text-[var(--foreground)]">{selectedService.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--muted-foreground)]">Especialista</span>
                <span className="font-medium text-[var(--foreground)]">{selectedStaff.name}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--muted-foreground)]">Fecha</span>
                <span className="font-medium text-[var(--foreground)] capitalize">{dateStr}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--muted-foreground)]">Hora</span>
                <span className="font-medium text-[var(--foreground)]">{timeFormatted}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs text-[var(--muted-foreground)]">Duración</span>
                <span className="font-medium text-[var(--foreground)] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[var(--primary,#4F35D2)]" />
                  {selectedService.duration_minutes} min
                </span>
              </div>
              {selectedBranch && (
                <div className="pt-3 border-t border-[var(--border,#E4E2EC)] flex items-center justify-between gap-4">
                  <span className="text-xs text-[var(--muted-foreground)]">Sucursal</span>
                  <span className="font-medium text-[var(--foreground)] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[var(--primary,#4F35D2)]" />
                    {selectedBranch.name} {selectedBranch.address ? `(${selectedBranch.address})` : ''}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-[var(--border,#E4E2EC)] flex items-center justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Total</span>
                <span className="font-display text-xl text-[var(--foreground)]">
                  ${Number(selectedService.price).toLocaleString('es-CO')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6 p-3.5 bg-[var(--secondary,#F0EFFE)] rounded-2xl border border-[var(--primary)]/20">
            <p className="text-xs text-[var(--muted-foreground)]">Código de cita:</p>
            <p className="text-sm font-bold text-[var(--primary,#4F35D2)] tracking-widest font-mono">{appointmentCode}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {onViewAppointments && (
              <button
                onClick={onViewAppointments}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 text-white font-semibold text-sm rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
                style={{ background: 'linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)' }}
              >
                <CalendarIcon className="w-4 h-4" />
                Ver mis citas
              </button>
            )}
            <button
              onClick={() => {
                if (onNavigateHome) {
                  onNavigateHome();
                } else if (typeof window !== 'undefined') {
                  window.location.href = `/${tenantSlug}`;
                }
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[var(--secondary,#F0EFFE)] text-[var(--secondary-foreground,#4F35D2)] font-semibold text-sm rounded-xl hover:bg-[var(--border)] transition-colors"
            >
              <Home className="w-4 h-4" />
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // PASOS DE AGENDAMIENTO DINÁMICOS
  return (
    <div className="max-w-2xl mx-auto px-4 py-4 font-[var(--font-sans)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handleBack}
          className="w-9 h-9 rounded-xl border border-[var(--border,#E4E2EC)] flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-display text-xl text-[var(--foreground)]">Agendar cita</h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Paso {step} de {maxSteps} — {STEPS[step - 1]}
          </p>
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
                      done
                        ? 'bg-[var(--primary,#4F35D2)] text-white scale-100'
                        : active
                        ? 'bg-[var(--primary,#4F35D2)] text-white ring-4 ring-[var(--primary)]/20 scale-110'
                        : 'bg-[var(--muted,#F5F3FF)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    {done ? <Check className="w-4 h-4" /> : n}
                  </div>
                  <span
                    className={`text-[10px] mt-1 font-medium hidden sm:block transition-colors ${
                      active ? 'text-[var(--primary,#4F35D2)]' : 'text-[var(--muted-foreground)]'
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 rounded-full overflow-hidden bg-[var(--border,#E4E2EC)]">
                    <div
                      className="h-full bg-[var(--primary,#4F35D2)] transition-all duration-500"
                      style={{ width: done ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="animate-fade-in">
        {/* Paso: Sucursal (Si hay múltiples sucursales activas) */}
        {currentStepKey === 'branch' && (
          <div>
            <h2 className="font-display text-2xl text-[var(--foreground)] mb-1">Elige tu sucursal</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Selecciona la ubicación donde deseas agendar tu atención.
            </p>
            <div className="space-y-3">
              {activeBranches.map((branch) => {
                const isSel = selectedBranch?.id === branch.id;
                return (
                  <button
                    key={branch.id}
                    onClick={() => setSelectedBranch(branch)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99]"
                    style={{
                      borderColor: isSel ? 'var(--primary,#4F35D2)' : 'var(--border,#E4E2EC)',
                      background: isSel ? 'var(--secondary,#F0EFFE)' : 'var(--card,#ffffff)',
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-[var(--primary,#4F35D2)]/10 text-[var(--primary,#4F35D2)] flex items-center justify-center shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--foreground)] text-base">{branch.name}</p>
                      {branch.address && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[var(--primary,#4F35D2)]" />
                          {branch.address}
                        </p>
                      )}
                      {branch.phone && (
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {branch.phone}
                        </p>
                      )}
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{
                        borderColor: isSel ? 'var(--primary,#4F35D2)' : 'var(--border,#E4E2EC)',
                        background: isSel ? 'var(--primary,#4F35D2)' : 'transparent',
                      }}
                    >
                      {isSel && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Paso: Servicio */}
        {currentStepKey === 'service' && (
          <div>
            <h2 className="font-display text-2xl text-[var(--foreground)] mb-1">Elige tu servicio</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">Selecciona el servicio que deseas reservar.</p>
            <div className="space-y-3">
              {paginatedServices.map((srv, i) => {
                const isSel = selectedService.id === srv.id;
                const imgUrl = DEFAULT_SERVICE_IMAGES[i % DEFAULT_SERVICE_IMAGES.length];
                return (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedService(srv)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99]"
                    style={{
                      borderColor: isSel ? 'var(--primary,#4F35D2)' : 'var(--border,#E4E2EC)',
                      background: isSel ? 'var(--secondary,#F0EFFE)' : 'var(--card,#ffffff)',
                    }}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[var(--muted,#F5F3FF)]">
                      <img src={imgUrl} alt={srv.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-[var(--foreground)] text-sm">{srv.name}</p>
                        <p className="text-sm font-bold text-[var(--primary,#4F35D2)] shrink-0">
                          ${Number(srv.price).toLocaleString('es-CO')}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">{srv.description}</p>
                      <div className="flex items-center gap-1 mt-1.5 text-[var(--muted-foreground)]">
                        <Clock className="w-3 h-3 text-[var(--primary)]" />
                        <span className="text-xs">{srv.duration_minutes} min</span>
                      </div>
                    </div>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                      style={{
                        borderColor: isSel ? 'var(--primary,#4F35D2)' : 'var(--border,#E4E2EC)',
                        background: isSel ? 'var(--primary,#4F35D2)' : 'transparent',
                      }}
                    >
                      {isSel && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Paginación de Servicios */}
            {totalServicePages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border,#E4E2EC)]">
                <button
                  type="button"
                  onClick={() => setServicePage((p) => Math.max(1, p - 1))}
                  disabled={servicePage === 1}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border,#E4E2EC)] bg-white font-medium text-xs text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  Página <strong className="text-[var(--foreground)] font-semibold">{servicePage}</strong> de{' '}
                  <strong className="text-[var(--foreground)] font-semibold">{totalServicePages}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setServicePage((p) => Math.min(totalServicePages, p + 1))}
                  disabled={servicePage === totalServicePages}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border,#E4E2EC)] bg-white font-medium text-xs text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-xs"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Paso: Especialista */}
        {currentStepKey === 'staff' && (
          <div>
            <h2 className="font-display text-2xl text-[var(--foreground)] mb-1">Elige tu especialista</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Selecciona el profesional de tu preferencia {selectedBranch ? `en sucursal ${selectedBranch.name}` : ''}.
            </p>
            {filteredStaff.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[var(--muted,#F5F3FF)] border border-[var(--border,#E4E2EC)] text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-[var(--foreground)]">No hay especialistas asignados a esta sucursal</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Por favor regresa al paso anterior y elige otra sucursal.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedStaff.map((staff, i) => {
                    const isSel = selectedStaff?.id === staff.id;
                    const photoUrl = staff.avatar_url || DEFAULT_STAFF_PHOTOS[i % DEFAULT_STAFF_PHOTOS.length];
                    return (
                      <button
                        key={staff.id}
                        onClick={() => setSelectedStaff(staff)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.99]"
                        style={{
                          borderColor: isSel ? 'var(--primary,#4F35D2)' : 'var(--border,#E4E2EC)',
                          background: isSel ? 'var(--secondary,#F0EFFE)' : 'var(--card,#ffffff)',
                        }}
                      >
                        <img src={photoUrl} alt={staff.name} className="w-14 h-14 rounded-2xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--foreground)] text-sm">{staff.name}</p>
                          <p className="text-xs text-[var(--primary,#4F35D2)] font-medium mt-0.5">Especialista certificado</p>
                          <div className="flex items-center gap-1 mt-1.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-[var(--foreground)] font-medium">4.9</span>
                            <span className="text-xs text-[var(--muted-foreground)]">(120+ reseñas)</span>
                          </div>
                        </div>
                        <div
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{
                            borderColor: isSel ? 'var(--primary,#4F35D2)' : 'var(--border,#E4E2EC)',
                            background: isSel ? 'var(--primary,#4F35D2)' : 'transparent',
                          }}
                        >
                          {isSel && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Paginación de Especialistas */}
                {totalStaffPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--border,#E4E2EC)]">
                    <button
                      type="button"
                      onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                      disabled={staffPage === 1}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border,#E4E2EC)] bg-white font-medium text-xs text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-xs"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </button>
                    <span className="text-xs font-medium text-[var(--muted-foreground)]">
                      Página <strong className="text-[var(--foreground)] font-semibold">{staffPage}</strong> de{' '}
                      <strong className="text-[var(--foreground)] font-semibold">{totalStaffPages}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setStaffPage((p) => Math.min(totalStaffPages, p + 1))}
                      disabled={staffPage === totalStaffPages}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border,#E4E2EC)] bg-white font-medium text-xs text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors shadow-xs"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Paso: Fecha (Filtra automáticamente solo días con disponibilidad activa) */}
        {currentStepKey === 'date' && (
          <div>
            <h2 className="font-display text-2xl text-[var(--foreground)] mb-1">Elige la fecha</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">Selecciona una fecha disponible para tu atención.</p>
            {availableDates.length === 0 ? (
              <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                <p className="text-sm font-bold text-amber-900">Sin fechas disponibles para este especialista</p>
                <p className="text-xs text-amber-700">
                  Por favor regresa al paso anterior y elige otro especialista o sucursal.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {availableDates.map((day, idx) => {
                  const isSel = isSameDay(day, selectedDate);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedSlot(null);
                      }}
                      className="p-3.5 rounded-2xl border-2 text-center transition-all duration-150 relative"
                      style={{
                        borderColor: isSel ? 'var(--primary,#4F35D2)' : 'var(--border,#E4E2EC)',
                        background: isSel ? 'var(--primary,#4F35D2)' : 'var(--card,#ffffff)',
                        color: isSel ? 'white' : 'var(--foreground,#18181B)',
                        boxShadow: isSel ? '0 4px 12px rgba(79,53,210,0.35)' : 'none',
                      }}
                    >
                      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                        {format(day, 'EEE', { locale: es })}
                      </p>
                      <p className="text-xl font-extrabold my-0.5">{format(day, 'd')}</p>
                      <p className="text-[10px] uppercase tracking-wider opacity-80">
                        {format(day, 'MMM', { locale: es })}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Paso: Hora */}
        {currentStepKey === 'time' && (
          <div>
            <h2 className="font-display text-2xl text-[var(--foreground)] mb-1">Elige el horario</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Horarios disponibles para el {format(selectedDate, "d 'de' MMMM", { locale: es })}.
            </p>
            {slots.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[var(--muted,#F5F3FF)] border border-[var(--border,#E4E2EC)] text-center space-y-2">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-[var(--foreground)]">Sin turnos disponibles en esta fecha</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Por favor regresa al paso de Fecha y selecciona otro día.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {slots.map((slot, i) => {
                  const isSel = selectedSlot?.formattedStart === slot.formattedStart;
                  return (
                    <button
                      key={i}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className="py-3.5 px-2 rounded-xl text-sm font-semibold border-2 transition-all duration-200 active:scale-95"
                      style={{
                        borderColor: isSel ? 'var(--primary,#4F35D2)' : 'var(--border,#E4E2EC)',
                        background: isSel ? 'var(--primary,#4F35D2)' : slot.available ? 'var(--card,#ffffff)' : 'var(--muted,#F5F3FF)',
                        color: isSel ? 'white' : slot.available ? 'var(--foreground)' : 'var(--muted-foreground)',
                        cursor: slot.available ? 'pointer' : 'not-allowed',
                        textDecoration: slot.available ? 'none' : 'line-through',
                      }}
                    >
                      {slot.formattedStart}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Paso: Confirmar */}
        {currentStepKey === 'confirm' && selectedStaff && selectedSlot && (
          <div>
            <h2 className="font-display text-2xl text-[var(--foreground)] mb-1">Confirma tu cita</h2>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">Revisa el resumen antes de confirmar.</p>
            <div className="bg-[var(--card,#ffffff)] rounded-2xl border border-[var(--border,#E4E2EC)] overflow-hidden shadow-lg">
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ background: 'var(--primary,#4F35D2)' }}
              >
                <div>
                  <p className="text-white font-display text-xl">{selectedService.name}</p>
                  <p className="text-white/70 text-xs mt-0.5">
                    ${Number(selectedService.price).toLocaleString('es-CO')} · {selectedService.duration_minutes} min
                  </p>
                </div>
              </div>
              <div className="p-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--muted-foreground)]">Especialista</span>
                  <span className="font-medium text-[var(--foreground)]">{selectedStaff.name}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--muted-foreground)]">Fecha</span>
                  <span className="font-medium text-[var(--foreground)] capitalize">
                    {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[var(--muted-foreground)]">Hora</span>
                  <span className="font-medium text-[var(--foreground)]">{selectedSlot.formattedStart} hs</span>
                </div>
                {selectedBranch && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[var(--muted-foreground)]">Sucursal</span>
                    <span className="font-medium text-[var(--foreground)]">
                      {selectedBranch.name} {selectedBranch.address ? `(${selectedBranch.address})` : ''}
                    </span>
                  </div>
                )}
              </div>
              <div className="px-5 py-4 bg-[var(--secondary,#F0EFFE)]/50 border-t border-[var(--border,#E4E2EC)] flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Total a pagar</p>
                  <p className="text-2xl font-display text-[var(--foreground)] mt-0.5">
                    ${Number(selectedService.price).toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--muted-foreground)]">Confirmación en WhatsApp</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[var(--success,#10B981)]">
                    <Check className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Reserva inmediata</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controles de Navegación de Pasos */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border,#E4E2EC)]">
        <button
          onClick={handleBack}
          className="px-5 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          {step === 1 ? 'Cancelar' : '← Anterior'}
        </button>

        {step < maxSteps ? (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white shadow-md"
            style={
              canProceed
                ? {
                    background: 'var(--primary,#4F35D2)',
                    boxShadow: '0 4px 16px rgba(79,53,210,0.3)',
                  }
                : { background: 'var(--border,#E4E2EC)', color: 'var(--muted-foreground)' }
            }
          >
            Siguiente
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleBookingSubmit}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl transition-all active:scale-95 text-white shadow-md"
            style={{
              background: 'var(--primary,#4F35D2)',
              boxShadow: '0 4px 16px rgba(79,53,210,0.3)',
              opacity: isPending ? 0.75 : 1,
            }}
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Confirmar cita
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
