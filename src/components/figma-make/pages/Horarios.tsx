"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock, Save, User, Building2, AlertCircle, Loader2 } from "lucide-react";
import { getBranchesAction, Branch } from "@/app/(dashboard)/branches/actions";
import {
  getSchedulesDataAction,
  saveGeneralWorkingHoursAction,
  saveStaffWorkingHoursAction,
  DayScheduleInput,
} from "@/app/(dashboard)/schedules/actions";
import NotificationService from "@/lib/services/notification.service";
import { LoadingState } from "@/components/figma-make/components/LoadingSpinner";

const DIAS = [
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
  { id: 0, name: "Domingo" },
];

export default function Horarios() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"general" | "staff">("general");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [staffList, setStaffList] = useState<Array<{ id: string; name: string }>>([]);
  const [useGeneralSchedule, setUseGeneralSchedule] = useState(true);

  const [schedules, setSchedules] = useState<Record<number, DayScheduleInput>>({
    1: { day_of_week: 1, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
    2: { day_of_week: 2, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
    3: { day_of_week: 3, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
    4: { day_of_week: 4, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
    5: { day_of_week: 5, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
    6: { day_of_week: 6, is_day_off: false, start_time: "09:00", end_time: "14:00", has_break: false },
    0: { day_of_week: 0, is_day_off: true, start_time: "09:00", end_time: "18:00", has_break: false },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    try {
      const bRes = await getBranchesAction();
      if (bRes.branches && bRes.branches.length > 0) {
        setBranches(bRes.branches);
        if (!selectedBranchId) setSelectedBranchId(bRes.branches[0].id);
      }

      const res = await getSchedulesDataAction();
      if (res.staffList && res.staffList.length > 0) {
        setStaffList(res.staffList.map((s) => ({ id: s.id, name: s.name })));
        if (!selectedStaffId) setSelectedStaffId(res.staffList[0].id);
      }

      if (res.workingHours && res.workingHours.length > 0) {
        let targetHours: any[] = [];
        if (activeTab === "general") {
          targetHours = res.workingHours.filter(
            (wh) => !wh.staff_id && wh.branch_id === selectedBranchId
          );
          if (targetHours.length === 0) {
            targetHours = res.workingHours.filter((wh) => !wh.staff_id && !wh.branch_id);
          }
          if (targetHours.length === 0) {
            targetHours = res.workingHours.filter((wh) => !wh.staff_id);
          }
        } else {
          targetHours = res.workingHours.filter(
            (wh) => wh.staff_id === selectedStaffId && (wh.branch_id === selectedBranchId || !wh.branch_id)
          );
        }

        if (activeTab === "staff" && targetHours.length === 0) {
          setUseGeneralSchedule(true);
        } else if (targetHours.length > 0) {
          if (activeTab === "staff") setUseGeneralSchedule(false);
          const defaultSched: Record<number, DayScheduleInput> = {
            1: { day_of_week: 1, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
            2: { day_of_week: 2, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
            3: { day_of_week: 3, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
            4: { day_of_week: 4, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
            5: { day_of_week: 5, is_day_off: false, start_time: "09:00", end_time: "18:00", has_break: true, break_start: "13:00", break_end: "14:00" },
            6: { day_of_week: 6, is_day_off: false, start_time: "09:00", end_time: "14:00", has_break: false },
            0: { day_of_week: 0, is_day_off: true, start_time: "09:00", end_time: "18:00", has_break: false },
          };
          const newSched = { ...defaultSched };
          targetHours.forEach((wh) => {
            newSched[wh.day_of_week] = {
              day_of_week: wh.day_of_week,
              is_day_off: wh.is_day_off,
              start_time: wh.start_time?.substring(0, 5) || "09:00",
              end_time: wh.end_time?.substring(0, 5) || "18:00",
              has_break: !!(wh.break_start && wh.break_end),
              break_start: wh.break_start?.substring(0, 5) || null,
              break_end: wh.break_end?.substring(0, 5) || null,
            };
          });
          setSchedules(newSched);
        }
      }
    } catch (err) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedStaffId, selectedBranchId]);

  const updateDay = (dayOfWeek: number, field: keyof DayScheduleInput, val: any) => {
    setSchedules((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: val,
      },
    }));
  };

  const handleSave = () => {
    setErrorMsg("");
    const dayArray = Object.values(schedules);

    startTransition(async () => {
      setSaving(true);
      try {
        const res =
          activeTab === "general"
            ? await saveGeneralWorkingHoursAction(dayArray, selectedBranchId)
            : await saveStaffWorkingHoursAction(selectedStaffId, dayArray, useGeneralSchedule, selectedBranchId);

        if (res.error) {
          setErrorMsg(res.error);
        } else {
          NotificationService.success(
            "¡Horarios guardados!",
            "La configuración de atención se actualizó exitosamente."
          );
          router.refresh();
          loadData();
        }
      } catch (err: any) {
        setErrorMsg(err.message || "Error al guardar horarios.");
      } finally {
        setSaving(false);
      }
    });
  };

  if (loading) {
    return (
      <div className="page-pad">
        <LoadingState title="Cargando horarios de atención..." subtitle="Obteniendo la jornada y los turnos configurados" cardCount={7} />
      </div>
    );
  }

  return (
    <div className="page-pad fade-in" style={{ maxWidth: 1000 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "#0f172a" }}>
            Horarios de Atención
          </h2>
          <p style={{ fontSize: 13, color: "#1e293b", marginTop: 2, fontWeight: 500 }}>
            Configura los días y horas de atención según cada sucursal registrada
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || isPending}
        >
          {saving ? (
            <Loader2 size={15} className="spin" style={{ marginRight: 6 }} />
          ) : (
            <Save size={15} style={{ marginRight: 6 }} />
          )}
          Guardar horarios
        </button>
      </div>

      {/* Tabs con subrayado (Tabs with underline) */}
      <div className="flex border-b border-[#e2e8f0] mb-6 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap -mb-px focus:outline-none ${
            activeTab === "general"
              ? "border-[#2563eb] text-[#2563eb]"
              : "border-transparent text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]"
          }`}
        >
          <Building2 size={16} />
          <span>Horario por Sucursal</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap -mb-px focus:outline-none ${
            activeTab === "staff"
              ? "border-[#2563eb] text-[#2563eb]"
              : "border-transparent text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]"
          }`}
        >
          <User size={16} />
          <span>Por Profesional</span>
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            padding: "12px 16px",
            borderRadius: 8,
            fontSize: 13.5,
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {/* Branch selector */}
      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Selecciona Sucursal:</label>
            <select
              className="input"
              style={{ width: 260 }}
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
            >
              {branches.length > 0 ? (
                branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))
              ) : (
                <option value="default">Sucursal Principal</option>
              )}
            </select>
          </div>

          {activeTab === "staff" && (
            <div>
              <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Selecciona Profesional:</label>
              <select
                className="input"
                style={{ width: 240 }}
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === "staff" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 22 }}>
              <input
                type="checkbox"
                id="useGeneral"
                checked={useGeneralSchedule}
                onChange={(e) => setUseGeneralSchedule(e.target.checked)}
                style={{ accentColor: "#2563eb", width: 16, height: 16 }}
              />
              <label htmlFor="useGeneral" style={{ fontSize: 13, color: "#0f172a", cursor: "pointer", fontWeight: 600 }}>
                Usar horario general de la sucursal
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Days */}
      <div className="card" style={{ padding: 20 }}>
        {(!useGeneralSchedule || activeTab === "general") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {DIAS.map((d) => {
              const dayData = schedules[d.id] || {
                day_of_week: d.id,
                is_day_off: false,
                start_time: "09:00",
                end_time: "18:00",
                has_break: false,
              };

              return (
                <div
                  key={d.id}
                  style={{
                    padding: 14,
                    borderRadius: 10,
                    border: "1px solid #f1f5f9",
                    background: dayData.is_day_off ? "#f8fafc" : "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 14,
                  }}
                >
                  {/* Day Toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 140 }}>
                    <input
                      type="checkbox"
                      checked={!dayData.is_day_off}
                      onChange={(e) => updateDay(d.id, "is_day_off", !e.target.checked)}
                      style={{ accentColor: "#2563eb", width: 18, height: 18, cursor: "pointer" }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: 14.5,
                        color: dayData.is_day_off ? "#475569" : "#0f172a",
                      }}
                    >
                      {d.name}
                    </span>
                  </div>

                  {!dayData.is_day_off ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                      {/* Hours */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={14} color="#2563eb" />
                        <input
                          type="time"
                          className="input"
                          style={{ width: 115, height: 34, fontSize: 13, color: "#0f172a", fontWeight: 600 }}
                          value={dayData.start_time}
                          onChange={(e) => updateDay(d.id, "start_time", e.target.value)}
                        />
                        <span style={{ color: "#0f172a", fontWeight: 700 }}>—</span>
                        <input
                          type="time"
                          className="input"
                          style={{ width: 115, height: 34, fontSize: 13, color: "#0f172a", fontWeight: 600 }}
                          value={dayData.end_time}
                          onChange={(e) => updateDay(d.id, "end_time", e.target.value)}
                        />
                      </div>

                      {/* Break Toggle */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="checkbox"
                          checked={dayData.has_break}
                          onChange={(e) => updateDay(d.id, "has_break", e.target.checked)}
                          style={{ accentColor: "#2563eb" }}
                        />
                        <span style={{ fontSize: 12.5, color: "#0f172a", fontWeight: 600 }}>Descanso</span>
                      </div>

                      {dayData.has_break && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="time"
                            className="input"
                            style={{ width: 105, height: 34, fontSize: 12.5, color: "#0f172a", fontWeight: 600 }}
                            value={dayData.break_start || "13:00"}
                            onChange={(e) => updateDay(d.id, "break_start", e.target.value)}
                          />
                          <span style={{ color: "#0f172a", fontWeight: 700 }}>—</span>
                          <input
                            type="time"
                            className="input"
                            style={{ width: 105, height: 34, fontSize: 12.5, color: "#0f172a", fontWeight: 600 }}
                            value={dayData.break_end || "14:00"}
                            onChange={(e) => updateDay(d.id, "break_end", e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="badge badge-neutral" style={{ color: "#0f172a", fontWeight: 600 }}>Día no laborable / Cerrado</span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {useGeneralSchedule && activeTab === "staff" && (
          <div style={{ textAlign: "center", padding: "30px 20px" }}>
            <p style={{ fontSize: 14, color: "#0f172a", fontWeight: 600 }}>
              Este profesional está utilizando la configuración de <strong>Horario General de la Sucursal</strong>.
            </p>
            <p style={{ fontSize: 12.5, color: "#1e293b", marginTop: 4, fontWeight: 500 }}>
              Desmarca la casilla superior si deseas asignarle un horario diferente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
