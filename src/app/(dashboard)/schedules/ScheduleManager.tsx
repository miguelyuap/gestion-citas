'use client';

import React, { useState, useMemo, useTransition } from 'react';
import { Staff, WorkingHour } from '@/types/database';
import { DayScheduleInput, saveGeneralWorkingHoursAction, saveStaffWorkingHoursAction } from './actions';
import NotificationService from '@/lib/services/notification.service';
import {
  Clock,
  Calendar,
  User,
  Users,
  Building2,
  Coffee,
  Copy,
  Save,
  Sparkles,
  Search,
  ChevronDown,
  Check,
} from 'lucide-react';

interface ScheduleManagerProps {
  initialWorkingHours: WorkingHour[];
  staffList: Staff[];
}

const DAYS_OF_WEEK = [
  { id: 1, label: 'Lunes', short: 'Lun' },
  { id: 2, label: 'Martes', short: 'Mar' },
  { id: 3, label: 'Miércoles', short: 'Mié' },
  { id: 4, label: 'Jueves', short: 'Jue' },
  { id: 5, label: 'Viernes', short: 'Vie' },
  { id: 6, label: 'Sábado', short: 'Sáb' },
  { id: 0, label: 'Domingo', short: 'Dom' },
];

function formatTimeForInput(timeStr: string | null | undefined, fallback: string): string {
  if (!timeStr) return fallback;
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
  }
  return fallback;
}

export function ScheduleManager({ initialWorkingHours, staffList }: ScheduleManagerProps) {
  // Nivel 1: Tipo de Vista ("general" vs "staff")
  const [mainView, setMainView] = useState<'general' | 'staff'>('general');

  // Nivel 2: Selección de Staff y filtros de búsqueda
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staffList[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [staffFilter, setStaffFilter] = useState<'all' | 'custom' | 'general'>('all');
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Helper para inicializar los 7 días de la semana
  const initializeDaysState = (whList: WorkingHour[]): DayScheduleInput[] => {
    return DAYS_OF_WEEK.map((d) => {
      const found = whList.find((wh) => wh.day_of_week === d.id);
      if (found) {
        return {
          day_of_week: d.id,
          is_day_off: found.is_day_off,
          start_time: formatTimeForInput(found.start_time, '08:00'),
          end_time: formatTimeForInput(found.end_time, '17:00'),
          has_break: Boolean(found.break_start && found.break_end),
          break_start: formatTimeForInput(found.break_start, '12:00'),
          break_end: formatTimeForInput(found.break_end, '13:00'),
        };
      }
      const isSunday = d.id === 0;
      return {
        day_of_week: d.id,
        is_day_off: isSunday,
        start_time: '08:00',
        end_time: '17:00',
        has_break: !isSunday,
        break_start: '12:00',
        break_end: '13:00',
      };
    });
  };

  // State: Horario General (staff_id IS NULL)
  const generalWh = initialWorkingHours.filter((wh) => wh.staff_id === null);
  const [generalSchedule, setGeneralSchedule] = useState<DayScheduleInput[]>(() =>
    initializeDaysState(generalWh)
  );

  // State: Horarios por Staff
  const getStaffWh = (staffId: string) =>
    initialWorkingHours.filter((wh) => wh.staff_id === staffId);

  const [staffSchedules, setStaffSchedules] = useState<Record<string, DayScheduleInput[]>>(() => {
    const map: Record<string, DayScheduleInput[]> = {};
    staffList.forEach((st) => {
      const wh = getStaffWh(st.id);
      map[st.id] = initializeDaysState(wh);
    });
    return map;
  });

  // Map para saber si el staff usa horario general (0 filas propias en DB)
  const [useGeneralMap, setUseGeneralMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    staffList.forEach((st) => {
      const wh = getStaffWh(st.id);
      map[st.id] = wh.length === 0;
    });
    return map;
  });

  // Filtrar lista de profesionales para empresas con 10+ empleados
  const filteredStaffList = useMemo(() => {
    return staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staff.email && staff.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const isCustom = !useGeneralMap[staff.id];
      if (staffFilter === 'custom' && !isCustom) return false;
      if (staffFilter === 'general' && isCustom) return false;

      return matchesSearch;
    });
  }, [staffList, searchQuery, staffFilter, useGeneralMap]);

  // Contadores estadísticos
  const stats = useMemo(() => {
    const customCount = staffList.filter((s) => !useGeneralMap[s.id]).length;
    const generalCount = staffList.length - customCount;
    return { total: staffList.length, custom: customCount, general: generalCount };
  }, [staffList, useGeneralMap]);

  // Staff seleccionado actual
  const selectedStaff = useMemo(() => {
    return staffList.find((s) => s.id === selectedStaffId) || staffList[0] || null;
  }, [staffList, selectedStaffId]);

  // Cambio de filtro con auto-selección inmediata del primer profesional del filtro
  const handleFilterChange = (filter: 'all' | 'custom' | 'general') => {
    setStaffFilter(filter);
    const matches = staffList.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staff.email && staff.email.toLowerCase().includes(searchQuery.toLowerCase()));

      const isCustom = !useGeneralMap[staff.id];
      if (filter === 'custom' && !isCustom) return false;
      if (filter === 'general' && isCustom) return false;

      return matchesSearch;
    });

    if (matches.length > 0) {
      setSelectedStaffId(matches[0].id);
    }
  };

  // Manipuladores de estado
  const handleGeneralDayChange = (
    dayOfWeek: number,
    field: keyof DayScheduleInput,
    value: any
  ) => {
    setGeneralSchedule((prev) =>
      prev.map((item) => (item.day_of_week === dayOfWeek ? { ...item, [field]: value } : item))
    );
  };

  const handleStaffDayChange = (
    staffId: string,
    dayOfWeek: number,
    field: keyof DayScheduleInput,
    value: any
  ) => {
    setStaffSchedules((prev) => ({
      ...prev,
      [staffId]: (prev[staffId] || []).map((item) =>
        item.day_of_week === dayOfWeek ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleCopyMondayToAll = (target: 'general' | string) => {
    const targetSchedule = target === 'general' ? generalSchedule : staffSchedules[target];
    const monday = targetSchedule.find((d) => d.day_of_week === 1);
    if (!monday) return;

    const updated = targetSchedule.map((d) => {
      if (d.day_of_week === 0) return d;
      return {
        ...d,
        is_day_off: monday.is_day_off,
        start_time: monday.start_time,
        end_time: monday.end_time,
        has_break: monday.has_break,
        break_start: monday.break_start,
        break_end: monday.break_end,
      };
    });

    if (target === 'general') {
      setGeneralSchedule(updated);
    } else {
      setStaffSchedules((prev) => ({ ...prev, [target]: updated }));
    }

    NotificationService.info(
      'Horarios Copiados',
      'Se ha replicado el horario del Lunes a los demás días laborales.'
    );
  };

  const handleCopyGeneralToStaff = (staffId: string) => {
    setStaffSchedules((prev) => ({
      ...prev,
      [staffId]: JSON.parse(JSON.stringify(generalSchedule)),
    }));
    setUseGeneralMap((prev) => ({ ...prev, [staffId]: false }));
    NotificationService.info(
      'Horario General Copiado',
      'Se ha cargado el horario general como plantilla para personalizar este profesional.'
    );
  };

  const handleSaveGeneral = () => {
    startTransition(async () => {
      const res = await saveGeneralWorkingHoursAction(generalSchedule);
      if (res?.error) {
        NotificationService.error('Error al guardar', res.error);
      } else {
        NotificationService.success(
          '¡Horarios Generales Actualizados!',
          'La jornada laboral base del negocio ha sido guardada.'
        );
      }
    });
  };

  const handleSaveStaff = (staffId: string) => {
    const useGeneral = useGeneralMap[staffId];
    const scheduleToSave = staffSchedules[staffId] || [];

    startTransition(async () => {
      const res = await saveStaffWorkingHoursAction(staffId, scheduleToSave, useGeneral);
      if (res?.error) {
        NotificationService.error('Error al guardar', res.error);
      } else {
        const staffName = staffList.find((s) => s.id === staffId)?.name || 'Profesional';
        NotificationService.success(
          '¡Horario Guardado!',
          useGeneral
            ? `${staffName} ahora utiliza el Horario General del Negocio.`
            : `El horario personalizado para ${staffName} ha sido guardado exitosamente.`
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Superior */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Gestión de Disponibilidad
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Horarios y Jornadas Laborales</h1>
          <p className="text-slate-400 text-sm mt-1">
            Configura el horario de apertura del negocio y los turnos individuales de cada miembro del equipo.
          </p>
        </div>

        {/* Resumen Badge */}
        <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/60 text-xs">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-indigo-400" /> {stats.total} Especialistas
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-indigo-400 font-semibold">{stats.custom} Personalizados</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{stats.general} Generales</span>
        </div>
      </div>

      {/* Nivel 1: Conmutador Principal de Vista (General vs Por Profesional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
        <button
          onClick={() => setMainView('general')}
          className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all text-left font-bold text-sm ${
            mainView === 'general'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400 shadow-xl shadow-indigo-500/20 scale-[1.01]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-5 h-5 text-indigo-300 flex-shrink-0" />
          <div>
            <p className="font-extrabold text-sm">Horario General del Negocio</p>
            <p className="text-[11px] text-indigo-200 font-normal font-sans">
              Jornada laboral base para la empresa
            </p>
          </div>
        </button>

        <button
          onClick={() => setMainView('staff')}
          className={`flex items-center justify-center gap-3 p-4 rounded-2xl border transition-all text-left font-bold text-sm ${
            mainView === 'staff'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400 shadow-xl shadow-indigo-500/20 scale-[1.01]'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="w-5 h-5 text-indigo-300 flex-shrink-0" />
          <div>
            <p className="font-extrabold text-sm">Horarios por Profesional</p>
            <p className="text-[11px] text-indigo-200 font-normal font-sans">
              Gestión individual de turnos del personal
            </p>
          </div>
        </button>
      </div>

      {/* VISTA 1: HORARIO GENERAL DEL NEGOCIO */}
      {mainView === 'general' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-400" /> Horario Base del Negocio
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Establece los días de atención estándar y los descansos globales de la empresa.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyMondayToAll('general')}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                  title="Copiar configuración del Lunes a los demás días laborales"
                >
                  <Copy className="w-3.5 h-3.5 text-indigo-400" /> Copiar Lunes
                </button>

                <button
                  onClick={handleSaveGeneral}
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isPending ? 'Guardando...' : 'Guardar Horario General'}
                </button>
              </div>
            </div>

            {/* Grid de 7 días */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {DAYS_OF_WEEK.map((day) => {
                const daySchedule = generalSchedule.find((d) => d.day_of_week === day.id)!;
                return (
                  <DayScheduleCard
                    key={day.id}
                    dayName={day.label}
                    schedule={daySchedule}
                    onChange={(field, val) => handleGeneralDayChange(day.id, field, val)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VISTA 2: HORARIOS POR PROFESIONAL */}
      {mainView === 'staff' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* BARRA DE SELECCIÓN E INTELIGENTE BÚSQUEDA DE PERSONAL */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" /> Seleccionar Profesional
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Busca y gestiona los horarios individuales sin importar la cantidad de personal registrado.
                </p>
              </div>

              {/* Filtros de Tipo (Todos / Propio / General) */}
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => handleFilterChange('all')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    staffFilter === 'all'
                      ? 'bg-indigo-600 text-white font-semibold shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  Todos ({staffList.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('custom')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    staffFilter === 'custom'
                      ? 'bg-indigo-600 text-white font-semibold shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  Horario Propio ({stats.custom})
                </button>
                <button
                  type="button"
                  onClick={() => handleFilterChange('general')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    staffFilter === 'general'
                      ? 'bg-indigo-600 text-white font-semibold shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  Horario General ({stats.general})
                </button>
              </div>
            </div>

            {/* Selector Desplegable / Combobox Con Buscador Integrado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {/* Campo de Búsqueda Alineado */}
              <div className="relative flex items-center md:col-span-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar especialista por nombre..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-500 text-xs leading-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Selector / Combobox Desplegable */}
              <div className="relative md:col-span-2">
                <button
                  type="button"
                  onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                  className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white text-xs hover:border-slate-700 transition"
                >
                  {selectedStaff ? (
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0 shadow"
                        style={{ backgroundColor: selectedStaff.color }}
                      >
                        {selectedStaff.name.charAt(0)}
                      </div>
                      <div className="truncate text-left">
                        <span className="font-bold text-slate-100">{selectedStaff.name}</span>
                        <span className="text-slate-400 ml-2 font-normal hidden sm:inline">
                          ({selectedStaff.email || 'Sin correo registrado'})
                        </span>
                      </div>
                      {!useGeneralMap[selectedStaff.id] ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono ml-auto flex-shrink-0 border border-indigo-500/30">
                          Horario Propio
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono ml-auto flex-shrink-0 border border-slate-700">
                          Horario General
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500">Selecciona un profesional...</span>
                  )}
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                </button>

                {/* Dropdown Menu */}
                {isStaffDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-30 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 p-2 space-y-1 animate-in fade-in duration-150">
                    {filteredStaffList.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">
                        No se encontraron profesionales con los filtros aplicados.
                      </div>
                    ) : (
                      filteredStaffList.map((st) => {
                        const isSelected = st.id === selectedStaffId;
                        const isCustom = !useGeneralMap[st.id];
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              setSelectedStaffId(st.id);
                              setIsStaffDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition ${
                              isSelected
                                ? 'bg-indigo-600/20 border border-indigo-500/50 text-white font-bold'
                                : 'hover:bg-slate-800/80 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-white text-xs flex-shrink-0"
                                style={{ backgroundColor: st.color }}
                              >
                                {st.name.charAt(0)}
                              </div>
                              <div className="truncate">
                                <p className="font-semibold text-slate-100 truncate">{st.name}</p>
                                <p className="text-[11px] text-slate-400 truncate">{st.email || 'Sin correo'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isCustom ? (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  Propio
                                </span>
                              ) : (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                  General
                                </span>
                              )}
                              {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* EDITOR DE HORARIO DEL PROFESIONAL SELECCIONADO */}
          {selectedStaff && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
              {/* Encabezado del Staff Seleccionado */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0"
                    style={{ backgroundColor: selectedStaff.color }}
                  >
                    {selectedStaff.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {selectedStaff.name}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {selectedStaff.email || 'Profesional registrado'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!useGeneralMap[selectedStaff.id] && (
                    <button
                      type="button"
                      onClick={() => handleCopyMondayToAll(selectedStaff.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-indigo-400" /> Copiar Lunes
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSaveStaff(selectedStaff.id)}
                    disabled={isPending}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isPending ? 'Guardando...' : 'Guardar Horario'}
                  </button>
                </div>
              </div>

              {/* Selector Modo de Horario: General vs Personalizado */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Configuración de Herencia de Horario
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() =>
                      setUseGeneralMap((prev) => ({ ...prev, [selectedStaff.id]: true }))
                    }
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      useGeneralMap[selectedStaff.id]
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`schedule_mode_${selectedStaff.id}`}
                      checked={useGeneralMap[selectedStaff.id]}
                      onChange={() =>
                        setUseGeneralMap((prev) => ({ ...prev, [selectedStaff.id]: true }))
                      }
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-100">🏢 Usar Horario General del Negocio</p>
                      <p className="text-[11px] text-slate-400">
                        Adopta automáticamente la jornada laboral base del negocio.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setUseGeneralMap((prev) => ({ ...prev, [selectedStaff.id]: false }))
                    }
                    className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                      !useGeneralMap[selectedStaff.id]
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`schedule_mode_${selectedStaff.id}`}
                      checked={!useGeneralMap[selectedStaff.id]}
                      onChange={() =>
                        setUseGeneralMap((prev) => ({ ...prev, [selectedStaff.id]: false }))
                      }
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-100">👤 Horario Personalizado (Prioritario)</p>
                      <p className="text-[11px] text-slate-400">
                        Sobrescribe el horario general con un turno exclusivo para este profesional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista Previa o Editor de Días */}
              {useGeneralMap[selectedStaff.id] ? (
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6 text-center space-y-3">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                  <h3 className="font-bold text-white text-base">Herencia Activa</h3>
                  <p className="text-xs text-slate-300 max-w-lg mx-auto">
                    <span className="font-semibold text-indigo-300">{selectedStaff.name}</span> utiliza el Horario General de la empresa. Cualquier actualización en los horarios base se reflejará automáticamente en su disponibilidad.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopyGeneralToStaff(selectedStaff.id)}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold transition"
                  >
                    <Copy className="w-3.5 h-3.5" /> Personalizar Horario Propio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const staffSchedule = (staffSchedules[selectedStaff.id] || []).find(
                      (d) => d.day_of_week === day.id
                    )!;
                    return (
                      <DayScheduleCard
                        key={day.id}
                        dayName={day.label}
                        schedule={staffSchedule}
                        onChange={(field, val) =>
                          handleStaffDayChange(selectedStaff.id, day.id, field, val)
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DayScheduleCardProps {
  dayName: string;
  schedule: DayScheduleInput;
  onChange: (field: keyof DayScheduleInput, value: any) => void;
}

function DayScheduleCard({ dayName, schedule, onChange }: DayScheduleCardProps) {
  return (
    <div
      className={`rounded-2xl border p-4 space-y-4 transition-all ${
        schedule.is_day_off
          ? 'bg-slate-950/40 border-slate-800/60 opacity-75'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Header del Día */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-white text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" /> {dayName}
        </span>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!schedule.is_day_off}
            onChange={(e) => onChange('is_day_off', !e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
          />
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
              schedule.is_day_off
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            }`}
          >
            {schedule.is_day_off ? 'Día Libre' : 'Trabaja'}
          </span>
        </label>
      </div>

      {!schedule.is_day_off ? (
        <div className="space-y-3 pt-1">
          {/* Horarios Jornada */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" /> Inicio
              </label>
              <input
                type="time"
                value={schedule.start_time}
                onChange={(e) => onChange('start_time', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-400" /> Fin
              </label>
              <input
                type="time"
                value={schedule.end_time}
                onChange={(e) => onChange('end_time', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Toggle Descanso */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-400" /> Descanso / Pausa
              </label>
              <input
                type="checkbox"
                checked={schedule.has_break}
                onChange={(e) => onChange('has_break', e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-700 bg-slate-800"
              />
            </div>

            {schedule.has_break && (
              <div className="grid grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Inicio Pausa</span>
                  <input
                    type="time"
                    value={schedule.break_start || '12:00'}
                    onChange={(e) => onChange('break_start', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400">Fin Pausa</span>
                  <input
                    type="time"
                    value={schedule.break_end || '13:00'}
                    onChange={(e) => onChange('break_end', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-4 text-center text-slate-500 text-xs italic bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
          Día No Laborable (Sin atención)
        </div>
      )}
    </div>
  );
}
