'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserCheck,
  UserX,
  Plus,
  Phone,
  Mail,
  User,
  Briefcase,
  Layers,
  CalendarDays,
  List,
  Eye,
  X,
  Check,
} from 'lucide-react';
import {
  AppointmentStatus,
  AppointmentWithDetails,
  Client,
  Service,
  Staff,
  TimeSlot,
  WorkingHour,
} from '@/types/database';
import NotificationService from '@/lib/services/notification.service';
import { generateAvailableSlots } from '@/lib/availability';
import { format, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  confirmAppointmentAction,
  cancelAppointmentAction,
  updateAppointmentStatusAction,
  createAdminAppointmentAction,
} from './actions';

interface Props {
  initialAppointments: AppointmentWithDetails[];
  staffList: Staff[];
  servicesList: Service[];
  clientsList: Client[];
  workingHoursList: WorkingHour[];
}

type ViewMode = 'list' | 'cards' | 'calendar';
type DateFilter = 'all' | 'today' | 'tomorrow' | 'this_week' | 'custom';

export default function AppointmentsClient({
  initialAppointments,
  staffList,
  servicesList,
  clientsList,
  workingHoursList,
}: Props) {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(initialAppointments);
  const [isPending, startTransition] = useTransition();

  // Filtros y Búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [staffFilter, setStaffFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Vista
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  // Modales
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<AppointmentWithDetails | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [canReschedule, setCanReschedule] = useState(true);

  // Modal Nueva Cita (Totalmente condicionado por Schedules)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<{
    service_id: string;
    staff_id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    selected_date: Date | null;
    selected_slot: TimeSlot | null;
    notes: string;
  }>({
    service_id: '',
    staff_id: '',
    client_name: '',
    client_email: '',
    client_phone: '',
    selected_date: null,
    selected_slot: null,
    notes: '',
  });

  // Próximos 30 días para el selector de Fecha en "Nueva Cita"
  const upcomingDays = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 30 }, (_, i) => addDays(today, i));
  }, []);

  // Helper: Comprobar si un especialista trabaja en un día específico según working_hours
  const checkStaffAvailabilityOnDate = (staffId: string, date: Date) => {
    if (!staffId) return false;
    const dow = date.getDay(); // 0 = Domingo, 1 = Lunes...
    const specificWh = workingHoursList.find(
      (wh) => wh.staff_id === staffId && wh.day_of_week === dow
    );
    const generalWh = workingHoursList.find(
      (wh) => wh.staff_id === null && wh.day_of_week === dow
    );
    const activeWh = specificWh || generalWh;
    return activeWh ? !activeWh.is_day_off : false;
  };

  // Calcular Slots de Tiempo Disponibles según Especialista, Fecha y Servicio
  const availableSlotsForCreate = useMemo(() => {
    if (!createForm.staff_id || !createForm.service_id || !createForm.selected_date) {
      return [];
    }

    const service = servicesList.find((s) => s.id === createForm.service_id);
    if (!service) return [];

    const dow = createForm.selected_date.getDay();
    const specificWh = workingHoursList.find(
      (wh) => wh.staff_id === createForm.staff_id && wh.day_of_week === dow
    );
    const generalWh = workingHoursList.find(
      (wh) => wh.staff_id === null && wh.day_of_week === dow
    );
    const activeWh = specificWh || generalWh;

    const staffAppointments = appointments.filter((app) => app.staff_id === createForm.staff_id);

    // Usar la duración del servicio como intervalo de tiempo (ej: 60 min -> slots de 1 hora: 08:00 - 09:00, 09:00 - 10:00)
    const intervalMinutes = service.duration_minutes > 0 ? service.duration_minutes : 30;

    return generateAvailableSlots({
      selectedDate: createForm.selected_date,
      serviceDurationMinutes: service.duration_minutes,
      bufferMinutes: service.buffer_time_minutes || 0,
      workingHour: activeWh,
      existingAppointments: staffAppointments,
      slotIntervalMinutes: intervalMinutes,
    });
  }, [
    createForm.staff_id,
    createForm.service_id,
    createForm.selected_date,
    servicesList,
    workingHoursList,
    appointments,
  ]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === 'pending').length;
    const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
    const cancelled = appointments.filter((a) => a.status === 'cancelled').length;
    const completed = appointments.filter((a) => a.status === 'completed').length;
    return { total, pending, confirmed, cancelled, completed };
  }, [appointments]);

  // Filtrado de citas
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      // Búsqueda por texto (Cliente, Email, Teléfono, Servicio, Profesional)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const clientMatch =
          app.client?.name.toLowerCase().includes(q) ||
          app.client?.email.toLowerCase().includes(q) ||
          app.client?.phone.toLowerCase().includes(q);
        const serviceMatch = app.service?.name.toLowerCase().includes(q);
        const staffMatch = app.staff?.name.toLowerCase().includes(q);
        const appNumMatch = app.id.toLowerCase().includes(q);
        if (!clientMatch && !serviceMatch && !staffMatch && !appNumMatch) {
          return false;
        }
      }

      // Filtro por Estado
      if (statusFilter !== 'all' && app.status !== statusFilter) {
        return false;
      }

      // Filtro por Profesional
      if (staffFilter !== 'all' && app.staff_id !== staffFilter) {
        return false;
      }

      // Filtro por Servicio
      if (serviceFilter !== 'all' && app.service_id !== serviceFilter) {
        return false;
      }

      // Filtro por Fecha
      if (dateFilter !== 'all') {
        const appDate = new Date(app.start_time);
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const appDateStr = appDate.toISOString().split('T')[0];

        if (dateFilter === 'today') {
          if (appDateStr !== todayStr) return false;
        } else if (dateFilter === 'tomorrow') {
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          if (appDateStr !== tomorrowStr) return false;
        } else if (dateFilter === 'this_week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          if (appDate < startOfWeek || appDate > endOfWeek) return false;
        } else if (dateFilter === 'custom') {
          if (startDate && appDateStr < startDate) return false;
          if (endDate && appDateStr > endDate) return false;
        }
      }

      return true;
    });
  }, [appointments, searchQuery, statusFilter, staffFilter, serviceFilter, dateFilter, startDate, endDate]);

  // Acciones: Confirmar Cita
  const handleConfirm = (app: AppointmentWithDetails) => {
    NotificationService.confirm(
      '¿Confirmar Cita?',
      `¿Deseas confirmar la cita de ${app.client?.name || 'el cliente'} para el ${new Date(
        app.start_time
      ).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}?`,
      'Sí, Confirmar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await confirmAppointmentAction(app.id);
          if (res.error) {
            NotificationService.error('Error al confirmar', res.error);
          } else {
            NotificationService.success(
              '¡Cita Confirmada!',
              'El estado ha sido actualizado a Confirmada y se registró la notificación.'
            );
            if (res.appointment) {
              setAppointments((prev) =>
                prev.map((item) => (item.id === app.id ? (res.appointment as AppointmentWithDetails) : item))
              );
            }
          }
        });
      }
    });
  };

  // Acciones: Abrir Modal Cancelación
  const openCancelModal = (app: AppointmentWithDetails) => {
    setAppointmentToCancel(app);
    setCancellationReason('');
    setCanReschedule(true);
    setIsCancelModalOpen(true);
  };

  // Acciones: Procesar Cancelación con Motivo
  const handleCancelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentToCancel) return;

    if (!cancellationReason.trim()) {
      NotificationService.warning('Campo Obligatorio', 'Debes ingresar el motivo de cancelación.');
      return;
    }

    NotificationService.confirm(
      '¿Cancelar Cita?',
      `¿Confirmas la cancelación de la cita de ${appointmentToCancel.client?.name}?`,
      'Sí, Cancelar',
      'Volver'
    ).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await cancelAppointmentAction(
            appointmentToCancel.id,
            cancellationReason,
            canReschedule
          );
          if (res.error) {
            NotificationService.error('Error al cancelar', res.error);
          } else {
            NotificationService.success(
              'Cita Cancelada',
              'La cita ha sido cancelada correctamente con el motivo especificado.'
            );
            if (res.appointment) {
              setAppointments((prev) =>
                prev.map((item) =>
                  item.id === appointmentToCancel.id ? (res.appointment as AppointmentWithDetails) : item
                )
              );
            }
            setIsCancelModalOpen(false);
            setAppointmentToCancel(null);
          }
        });
      }
    });
  };

  // Acciones: Cambiar a Completada o No Asistió
  const handleStatusChange = (app: AppointmentWithDetails, newStatus: AppointmentStatus) => {
    const statusLabels: Record<string, string> = {
      completed: 'Completada',
      no_show: 'No Asistió (No Show)',
      pending: 'Pendiente',
    };

    NotificationService.confirm(
      `¿Marcar como ${statusLabels[newStatus]}?`,
      `Cambiar estado de la cita de ${app.client?.name} a "${statusLabels[newStatus]}".`,
      'Sí, Cambiar',
      'Cancelar'
    ).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await updateAppointmentStatusAction(app.id, newStatus);
          if (res.error) {
            NotificationService.error('Error', res.error);
          } else {
            NotificationService.success('Estado Actualizado', `La cita fue marcada como ${statusLabels[newStatus]}.`);
            if (res.appointment) {
              setAppointments((prev) =>
                prev.map((item) => (item.id === app.id ? (res.appointment as AppointmentWithDetails) : item))
              );
            }
          }
        });
      }
    });
  };

  // Crear cita manual por el admin (Validada estrictamente por Backend y Frontend)
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!createForm.service_id) {
      NotificationService.warning('Selecciona un Servicio', 'Debes seleccionar el servicio para la cita.');
      return;
    }

    if (!createForm.staff_id) {
      NotificationService.warning('Selecciona un Especialista', 'Debes seleccionar el especialista.');
      return;
    }

    if (!createForm.selected_date) {
      NotificationService.warning('Selecciona una Fecha', 'Debes seleccionar una fecha disponible.');
      return;
    }

    if (!createForm.selected_slot) {
      NotificationService.warning('Selecciona una Hora', 'Debes elegir un horario disponible de la lista.');
      return;
    }

    // Construir ISO string desde selected_date + selected_slot.formattedStart
    const [hours, minutes] = createForm.selected_slot.formattedStart.split(':').map(Number);
    const fullStartDate = new Date(createForm.selected_date);
    fullStartDate.setHours(hours, minutes, 0, 0);

    const formData = new FormData();
    formData.append('service_id', createForm.service_id);
    formData.append('staff_id', createForm.staff_id);
    formData.append('client_name', createForm.client_name);
    formData.append('client_email', createForm.client_email);
    formData.append('client_phone', createForm.client_phone);
    formData.append('start_time', fullStartDate.toISOString());
    formData.append('notes', createForm.notes);

    startTransition(async () => {
      const res = await createAdminAppointmentAction(formData);
      if (res.error) {
        NotificationService.error('No se pudo agendar la cita', res.error);
      } else {
        NotificationService.success('¡Cita Agendada!', 'La nueva cita ha sido registrada con éxito.');
        if (res.appointment) {
          setAppointments((prev) => [res.appointment as AppointmentWithDetails, ...prev]);
        }
        setIsCreateModalOpen(false);
        setCreateForm({
          service_id: '',
          staff_id: '',
          client_name: '',
          client_email: '',
          client_phone: '',
          selected_date: null,
          selected_slot: null,
          notes: '',
        });
      }
    });
  };

  // Helper de Badge de Estado
  const renderStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Pendiente
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmada
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" /> Cancelada
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <UserCheck className="w-3.5 h-3.5" /> Completada
          </span>
        );
      case 'no_show':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/30">
            <UserX className="w-3.5 h-3.5" /> No Asistió
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <CalendarIcon className="w-4 h-4" /> Gestión Administrativa
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Panel de Citas & Agenda</h1>
          <p className="text-sm text-slate-400">
            Control integral de turnos, confirmaciones, motivos de cancelación y asignación de personal.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateForm({
              service_id: servicesList[0]?.id || '',
              staff_id: staffList[0]?.id || '',
              client_name: '',
              client_email: '',
              client_phone: '',
              selected_date: null,
              selected_slot: null,
              notes: '',
            });
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nueva Cita
        </button>
      </div>

      {/* Tarjetas de Estadísticas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Citas</span>
          <span className="text-2xl sm:text-3xl font-black text-white mt-2">{stats.total}</span>
        </div>

        <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Pendientes</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">{stats.pending}</span>
        </div>

        <div className="bg-slate-900/80 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Confirmadas</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">{stats.confirmed}</span>
        </div>

        <div className="bg-slate-900/80 border border-rose-500/20 rounded-2xl p-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Canceladas</span>
          <span className="text-2xl sm:text-3xl font-black text-rose-400 mt-2">{stats.cancelled}</span>
        </div>

        <div className="bg-slate-900/80 border border-blue-500/20 rounded-2xl p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Completadas</span>
          <span className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">{stats.completed}</span>
        </div>
      </div>

      {/* Control de Filtros, Búsqueda y Modos de Vista */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, email, teléfono, servicio o profesional..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selector de Modo de Vista */}
          <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-end lg:self-auto">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" /> Tarjetas
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <List className="w-4 h-4" /> Tabla
            </button>

            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                viewMode === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <CalendarDays className="w-4 h-4" /> Calendario
            </button>
          </div>
        </div>

        {/* Fila de Filtros Desplegables */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80">
          {/* Filtro Estado */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmadas</option>
              <option value="cancelled">Canceladas</option>
              <option value="completed">Completadas</option>
              <option value="no_show">No Asistió</option>
            </select>
          </div>

          {/* Filtro Profesional */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Profesional
            </label>
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todo el personal</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Servicio */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Servicio
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Todos los servicios</option>
              {servicesList.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  {srv.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Fecha Prerregistro */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Fecha
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">Cualquier fecha</option>
              <option value="today">Hoy</option>
              <option value="tomorrow">Mañana</option>
              <option value="this_week">Esta Semana</option>
              <option value="custom">Rango Personalizado</option>
            </select>
          </div>

          {/* Rango de Fecha Personalizado */}
          {dateFilter === 'custom' && (
            <div className="col-span-2 sm:col-span-4 lg:col-span-1 grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Desde</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Hasta</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados de Citas */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto stroke-1" />
          <h3 className="text-lg font-bold text-white">No se encontraron citas</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            No existen citas agendadas que coincidan con los criterios de búsqueda o filtros seleccionados.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setStaffFilter('all');
              setServiceFilter('all');
              setDateFilter('all');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition mt-2"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <>
          {/* MODO TARJETAS */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAppointments.map((app) => {
                const startDateObj = new Date(app.start_time);
                const endDateObj = new Date(app.end_time);

                return (
                  <div
                    key={app.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-3xl p-6 transition shadow-xl space-y-5 flex flex-col justify-between group"
                  >
                    {/* Encabezado */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-2 border-b border-slate-800/60 pb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: app.staff?.color || '#6366f1' }}
                            title={`Profesional: ${app.staff?.name}`}
                          />
                          <div>
                            <div className="text-sm font-extrabold text-white capitalize">
                              {startDateObj.toLocaleDateString('es-CO', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </div>
                            <div className="text-xs font-mono text-indigo-400">
                              {startDateObj.toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {endDateObj.toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>

                        {renderStatusBadge(app.status)}
                      </div>

                      {/* Cliente */}
                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cliente</div>
                        <div className="text-base font-bold text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-400" /> {app.client?.name || 'Cliente sin nombre'}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-0.5">
                          {app.client?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" /> {app.client.phone}
                            </span>
                          )}
                          {app.client?.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-500" /> {app.client.email}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Servicio y Especialista */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-950/80 rounded-2xl p-3 border border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Servicio</span>
                          <span className="font-semibold text-slate-200 truncate block">
                            {app.service?.name || 'Servicio General'}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            ${Number(app.total_price).toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block text-[10px] uppercase font-bold">Especialista</span>
                          <span className="font-semibold text-slate-200 truncate block">
                            {app.staff?.name || 'Sin asignar'}
                          </span>
                        </div>
                      </div>

                      {/* Motivo de Cancelación si aplica */}
                      {app.status === 'cancelled' && app.cancellation_reason && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 text-xs text-rose-300 space-y-1">
                          <div className="font-bold flex items-center gap-1 text-rose-400">
                            <XCircle className="w-3.5 h-3.5" /> Motivo de Cancelación:
                          </div>
                          <p className="italic text-[11px] line-clamp-2">"{app.cancellation_reason}"</p>
                        </div>
                      )}
                    </div>

                    {/* Botones de Acción */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setSelectedAppointment(app);
                          setIsDetailOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                        title="Ver detalles completos"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" /> Detalles
                      </button>

                      <div className="flex items-center gap-1.5">
                        {app.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(app)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmar
                          </button>
                        )}

                        {app.status !== 'cancelled' && app.status !== 'completed' && (
                          <button
                            onClick={() => openCancelModal(app)}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        )}

                        {app.status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusChange(app, 'completed')}
                            disabled={isPending}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold transition"
                            title="Marcar cita como finalizada"
                          >
                            <UserCheck className="w-3.5 h-3.5" /> Completar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODO TABLA / LISTA */}
          {viewMode === 'list' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/80 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4">Fecha & Hora</th>
                      <th className="px-6 py-4">Cliente</th>
                      <th className="px-6 py-4">Servicio</th>
                      <th className="px-6 py-4">Profesional</th>
                      <th className="px-6 py-4">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredAppointments.map((app) => {
                      const startDateObj = new Date(app.start_time);
                      const endDateObj = new Date(app.end_time);

                      return (
                        <tr key={app.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-bold text-white capitalize">
                              {startDateObj.toLocaleDateString('es-CO', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </div>
                            <div className="text-xs text-indigo-400 font-mono">
                              {startDateObj.toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {endDateObj.toLocaleTimeString('es-CO', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{app.client?.name || 'Cliente sin nombre'}</div>
                            <div className="text-xs text-slate-400">
                              {app.client?.phone || app.client?.email || 'Sin datos de contacto'}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-200">{app.service?.name}</div>
                            <div className="text-xs text-slate-400">${Number(app.total_price).toLocaleString()}</div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: app.staff?.color || '#6366f1' }}
                              />
                              <span className="font-medium text-slate-200">{app.staff?.name}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(app.status)}</td>

                          <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => {
                                setSelectedAppointment(app);
                                setIsDetailOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                            >
                              Ver
                            </button>

                            {app.status === 'pending' && (
                              <button
                                onClick={() => handleConfirm(app)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition"
                              >
                                Confirmar
                              </button>
                            )}

                            {app.status !== 'cancelled' && app.status !== 'completed' && (
                              <button
                                onClick={() => openCancelModal(app)}
                                className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-xs font-bold text-rose-300 hover:text-white transition"
                              >
                                Cancelar
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODO CALENDARIO / CRONOGRAMA */}
          {viewMode === 'calendar' && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-indigo-400" /> Cronograma de Citas Agendadas
                </h3>
                <span className="text-xs text-slate-400">
                  Mostrando {filteredAppointments.length} cita(s) en orden cronológico
                </span>
              </div>

              <div className="space-y-4">
                {filteredAppointments
                  .slice()
                  .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                  .map((app) => {
                    const start = new Date(app.start_time);
                    const end = new Date(app.end_time);

                    return (
                      <div
                        key={app.id}
                        className="bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-indigo-600/20 border border-indigo-500/30 rounded-2xl px-4 py-3 text-center min-w-[100px]">
                            <div className="text-xs font-bold uppercase text-indigo-400">
                              {start.toLocaleDateString('es-CO', { weekday: 'short' })}
                            </div>
                            <div className="text-xl font-black text-white">{start.getDate()}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {start.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white text-base">
                                {app.client?.name || 'Cliente'}
                              </span>
                              {renderStatusBadge(app.status)}
                            </div>
                            <div className="text-xs text-slate-300 flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> {app.service?.name}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-purple-400" /> {app.staff?.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-auto">
                          <button
                            onClick={() => {
                              setSelectedAppointment(app);
                              setIsDetailOpen(true);
                            }}
                            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition"
                          >
                            Ver Detalles
                          </button>

                          {app.status === 'pending' && (
                            <button
                              onClick={() => handleConfirm(app)}
                              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition"
                            >
                              Confirmar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL: DETALLE COMPLETO DE CITA */}
      {isDetailOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsDetailOpen(false);
                setSelectedAppointment(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {renderStatusBadge(selectedAppointment.status)}
                <span className="text-xs font-mono text-slate-400">ID: {selectedAppointment.id.substring(0, 8)}...</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Detalle de la Cita</h2>
              <p className="text-xs text-slate-400">
                Creada el{' '}
                {new Date(selectedAppointment.created_at).toLocaleString('es-CO', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <div className="space-y-4 divide-y divide-slate-800/80">
              {/* Cliente */}
              <div className="pt-2 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Datos del Cliente
                </h4>
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-sm">
                  <div className="font-bold text-white text-base">{selectedAppointment.client?.name}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedAppointment.client?.email || 'Sin correo'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{selectedAppointment.client?.phone || 'Sin teléfono'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Servicio y Personal */}
              <div className="pt-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> Servicio y Especialista
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 block font-semibold">Servicio</span>
                    <span className="font-extrabold text-white block">{selectedAppointment.service?.name}</span>
                    <span className="text-xs text-indigo-400 block font-mono">
                      ${Number(selectedAppointment.total_price).toLocaleString()} ({selectedAppointment.service?.duration_minutes} min)
                    </span>
                  </div>

                  <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400 block font-semibold">Profesional</span>
                    <span className="font-extrabold text-white block">{selectedAppointment.staff?.name}</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: selectedAppointment.staff?.color || '#6366f1' }}
                      />
                      <span>Asignado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horario */}
              <div className="pt-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Horario Programado
                </h4>
                <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Fecha</span>
                    <span className="font-bold text-white capitalize">
                      {new Date(selectedAppointment.start_time).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-right font-mono text-sm text-indigo-400 font-bold">
                    {new Date(selectedAppointment.start_time).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    -{' '}
                    {new Date(selectedAppointment.end_time).toLocaleTimeString('es-CO', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              {/* Cancelación si aplica */}
              {selectedAppointment.status === 'cancelled' && (
                <div className="pt-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" /> Registro de Cancelación
                  </h4>
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400 block font-semibold">Motivo:</span>
                      <p className="text-rose-200 font-medium italic mt-0.5">
                        "{selectedAppointment.cancellation_reason || 'Sin motivo especificado'}"
                      </p>
                    </div>
                    <div className="text-[11px] text-slate-300 pt-1 border-t border-rose-500/20">
                      Permite reprogramación:{' '}
                      <span className="font-bold text-white">
                        {selectedAppointment.can_reschedule ? 'Sí' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Modal */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              {selectedAppointment.status === 'pending' && (
                <button
                  onClick={() => {
                    setIsDetailOpen(false);
                    handleConfirm(selectedAppointment);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition"
                >
                  Confirmar Cita
                </button>
              )}

              <button
                onClick={() => {
                  setIsDetailOpen(false);
                  setSelectedAppointment(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CANCELACIÓN DE CITA */}
      {isCancelModalOpen && appointmentToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsCancelModalOpen(false);
                setAppointmentToCancel(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <XCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Cancelar Cita</h2>
              <p className="text-xs text-slate-400">
                Cancelación de cita para <strong className="text-white">{appointmentToCancel.client?.name}</strong> (
                {appointmentToCancel.service?.name}).
              </p>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-5">
              {/* Motivo de cancelación */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Motivo de Cancelación <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Escribe la razón detallada por la cual se cancela la cita..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition"
                />
              </div>

              {/* ¿Puede reprogramarse? */}
              <div className="space-y-2 bg-slate-950 rounded-2xl p-4 border border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">¿Puede reprogramarse esta cita?</span>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                    <input
                      type="radio"
                      name="canReschedule"
                      checked={canReschedule === true}
                      onChange={() => setCanReschedule(true)}
                      className="accent-indigo-600 w-4 h-4"
                    />
                    <span>Sí, el cliente puede agendar de nuevo</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                    <input
                      type="radio"
                      name="canReschedule"
                      checked={canReschedule === false}
                      onChange={() => setCanReschedule(false)}
                      className="accent-indigo-600 w-4 h-4"
                    />
                    <span>No reprogramar</span>
                  </label>
                </div>
              </div>

              {/* Acciones Modal */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCancelModalOpen(false);
                    setAppointmentToCancel(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Regresar
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-lg shadow-rose-600/20 disabled:opacity-50"
                >
                  {isPending ? 'Procesando...' : 'Cancelar Cita Definitivamente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA CITA CON CONTROL DE DISPONIBILIDAD DE SCHEDULES */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                <CalendarIcon className="w-4 h-4" /> Agendamiento Administrador
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Agendar Nueva Cita</h2>
              <p className="text-xs text-slate-400">
                La disponibilidad de días y horas está controlada por los horarios configurados en el sistema (Schedules).
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-5">
              {/* 1. Selección de Servicio y Especialista / Personal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 rounded-2xl p-4 border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400" /> Servicio *
                  </label>
                  <select
                    required
                    value={createForm.service_id}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        service_id: e.target.value,
                        selected_slot: null,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="">Seleccionar Servicio...</option>
                    {servicesList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.duration_minutes} min) - ${Number(s.price).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" /> 1. Especialista / Personal *
                  </label>
                  <select
                    required
                    value={createForm.staff_id}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        staff_id: e.target.value,
                        selected_date: null,
                        selected_slot: null,
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition font-medium"
                  >
                    <option value="">Seleccionar Personal...</option>
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. Campo FECHA (Selector de días condicionado por Schedules) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-indigo-400" /> 2. Campo "Fecha" *
                  </label>
                  {createForm.staff_id && (
                    <span className="text-[11px] text-slate-400">
                      Selecciona un día de atención habilitado
                    </span>
                  )}
                </div>

                {!createForm.staff_id ? (
                  <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-500">
                    Por favor selecciona primero un Especialista para consultar sus días laborables.
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {upcomingDays.map((dayObj) => {
                      const isAvailable = checkStaffAvailabilityOnDate(createForm.staff_id, dayObj);
                      const isSelected = createForm.selected_date
                        ? isSameDay(dayObj, createForm.selected_date)
                        : false;

                      return (
                        <button
                          key={dayObj.toISOString()}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() =>
                            setCreateForm({
                              ...createForm,
                              selected_date: dayObj,
                              selected_slot: null,
                            })
                          }
                          title={
                            isAvailable
                              ? `Disponible: ${format(dayObj, 'EEEE d MMMM', { locale: es })}`
                              : `Día no laboral para el profesional`
                          }
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-20 py-3 rounded-2xl border transition-all duration-200 ${
                            isSelected
                              ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/25 font-bold scale-105 ring-2 ring-indigo-400'
                              : isAvailable
                              ? 'bg-slate-950 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-950/40 text-slate-600 border-slate-900 cursor-not-allowed opacity-40 line-through'
                          }`}
                        >
                          <span className="text-[10px] capitalize text-slate-400 font-semibold">
                            {format(dayObj, 'EEE', { locale: es })}
                          </span>
                          <span className="text-lg font-bold my-0.5">{format(dayObj, 'dd')}</span>
                          <span className="text-[10px] capitalize text-slate-500">
                            {format(dayObj, 'MMM', { locale: es })}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Campo HORA (Opciones independientes calculadas por disponibilidad) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-400" /> 3. Campo "Hora" *
                  </label>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Disponible
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 font-medium">
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span> No disponible
                    </span>
                  </div>
                </div>

                {!createForm.selected_date ? (
                  <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-500">
                    Selecciona una fecha disponible para calcular las horas de atención libres.
                  </div>
                ) : availableSlotsForCreate.length === 0 ? (
                  <div className="bg-slate-950 border border-rose-500/20 rounded-2xl p-4 text-center text-xs text-rose-300">
                    No existen turnos de horario disponibles para este día (Turnos ocupados o descanso).
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-2 bg-slate-950 rounded-2xl border border-slate-800">
                    {availableSlotsForCreate.map((slot, idx) => {
                      const isSelected =
                        createForm.selected_slot?.formattedStart === slot.formattedStart;
                      const selectedService = servicesList.find((s) => s.id === createForm.service_id);

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setCreateForm({ ...createForm, selected_slot: slot })}
                          title={
                            slot.reason ||
                            (slot.available
                              ? `Disponible: ${slot.formattedStart} a ${slot.formattedEnd}`
                              : 'No disponible')
                          }
                          className={`py-3 px-3 rounded-xl text-center text-xs font-bold transition-all duration-200 flex flex-col items-center justify-center gap-0.5 ${
                            isSelected
                              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105 ring-2 ring-emerald-300'
                              : slot.available
                              ? 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500'
                              : 'bg-slate-900/30 text-slate-600 border border-slate-900/50 cursor-not-allowed line-through'
                          }`}
                        >
                          <span className="text-sm font-extrabold tracking-tight">
                            {slot.formattedStart} - {slot.formattedEnd}
                          </span>
                          {slot.available && (
                            <span className="text-[10px] opacity-80 font-normal">
                              ({selectedService?.duration_minutes || 60} min)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Datos del Cliente */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                  Información del Cliente
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="text-[11px] text-slate-400 block mb-1">Nombre Completo *</label>
                    <input
                      type="text"
                      required
                      value={createForm.client_name}
                      onChange={(e) => setCreateForm({ ...createForm, client_name: e.target.value })}
                      placeholder="Ej: Laura Gómez"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={createForm.client_email}
                      onChange={(e) => setCreateForm({ ...createForm, client_email: e.target.value })}
                      placeholder="cliente@ejemplo.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Teléfono / WhatsApp</label>
                    <input
                      type="tel"
                      value={createForm.client_phone}
                      onChange={(e) => setCreateForm({ ...createForm, client_phone: e.target.value })}
                      placeholder="+57 300 0000000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Notas u Observaciones</label>
                  <input
                    type="text"
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    placeholder="Detalles adicionales del turno..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Botones y Resumen */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-400">
                  {createForm.selected_date && createForm.selected_slot ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Seleccionado:{' '}
                      {format(createForm.selected_date, 'dd/MM/yyyy')} a las{' '}
                      {createForm.selected_slot.formattedStart} hs
                    </span>
                  ) : (
                    <span>Completa la selección de Fecha y Hora para agendar</span>
                  )}
                </div>

                <div className="flex gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={isPending || !createForm.selected_date || !createForm.selected_slot}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isPending ? 'Agendando...' : 'Confirmar Agendamiento'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
