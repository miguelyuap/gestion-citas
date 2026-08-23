"use client";

import { useState, useEffect, useTransition } from "react";
import { ChevronLeft, ChevronRight, Plus, Filter, X, Check, Clock, Ban, Edit3, Building2, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { getBranchesAction, Branch } from "@/app/(dashboard)/branches/actions";
import {
  getAppointmentsDataAction,
  createAdminAppointmentAction,
  updateAppointmentStatusAction,
  confirmAppointmentAction,
  cancelAppointmentAction,
} from "@/app/(dashboard)/appointments/actions";
import { useRouter } from "next/navigation";
import NotificationService from "@/lib/services/notification.service";
import { useBreakpoint } from "../hooks/useBreakpoint";

const formatLocalDateString = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const HORAS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
const VIEWS = ["Día", "Semana", "Mes"];

const ESTADO_COLOR: Record<string, string> = {
  Confirmada: "#dbeafe",
  confirmed: "#dbeafe",
  Pendiente: "#fef9c3",
  pending: "#fef9c3",
  Cancelada: "#fee2e2",
  cancelled: "#fee2e2",
  Completada: "#dcfce7",
  completed: "#dcfce7",
};

const ESTADO_BORDER: Record<string, string> = {
  Confirmada: "#2563eb",
  confirmed: "#2563eb",
  Pendiente: "#eab308",
  pending: "#eab308",
  Cancelada: "#dc2626",
  cancelled: "#dc2626",
  Completada: "#16a34a",
  completed: "#16a34a",
};

const ESTADO_BADGE: Record<string, string> = {
  Confirmada: "badge-primary",
  confirmed: "badge-primary",
  Pendiente: "badge-warning",
  pending: "badge-warning",
  Cancelada: "badge-danger",
  cancelled: "badge-danger",
  Completada: "badge-success",
  completed: "badge-success",
};

const ESTADO_LABEL: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendiente",
  cancelled: "Cancelada",
  completed: "Completada",
  Confirmada: "Confirmada",
  Pendiente: "Pendiente",
  Cancelada: "Cancelada",
  Completada: "Completada",
};

interface CitaReal {
  id: string;
  hora: string;
  duracion: number;
  cliente: string;
  cliente_id?: string;
  servicio: string;
  servicio_id?: string;
  profesional: string;
  profesional_id?: string;
  sucursal: string;
  sucursal_id?: string;
  estado: string;
  fecha: string;
  precio: number;
  raw_start?: string;
}

function CreateCitaModal({
  onClose,
  onCreated,
  branches,
  services,
  staffList,
  clients,
}: {
  onClose: () => void;
  onCreated: () => void;
  branches: Branch[];
  services: any[];
  staffList: any[];
  clients: any[];
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    cliente_id: clients.length > 0 ? clients[0].id : "",
    cliente_name: "",
    servicio_id: services.length > 0 ? services[0].id : "",
    profesional_id: staffList.length > 0 ? staffList[0].id : "",
    sucursal_id: branches.length > 0 ? branches[0].id : "",
    fecha: formatLocalDateString(new Date()),
    hora: "09:00",
    observaciones: "",
  });
  const [loading, setLoading] = useState(false);
  const [formErr, setFormErr] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedService = services.find((s) => s.id === form.servicio_id) || services[0];
  const selectedStaff = staffList.find((s) => s.id === form.profesional_id) || staffList[0];
  const selectedClient = clients.find((c) => c.id === form.cliente_id);
  const selectedBranch = branches.find((b) => b.id === form.sucursal_id);

  const handleConfirmCreate = () => {
    if (!form.servicio_id || !form.profesional_id) {
      setFormErr("Selecciona un servicio y un profesional.");
      return;
    }

    setFormErr("");
    startTransition(async () => {
      setLoading(true);
      const startDateTimeStr = `${form.fecha}T${form.hora}:00`;
      const clientName = selectedClient ? selectedClient.name : form.cliente_name || "Cliente General";
      const clientEmail = selectedClient ? selectedClient.email : "cliente@ejemplo.com";
      const clientPhone = selectedClient ? selectedClient.phone : "+56912345678";

      try {
        const formData = new FormData();
        formData.append("service_id", form.servicio_id);
        formData.append("staff_id", form.profesional_id);
        formData.append("client_name", clientName);
        formData.append("client_email", clientEmail);
        formData.append("client_phone", clientPhone);
        formData.append("start_time", startDateTimeStr);
        formData.append("notes", form.observaciones);

        const res = await createAdminAppointmentAction(formData);

        if (res.error) {
          setFormErr(res.error);
        } else {
          NotificationService.success("¡Cita Creada!", "La cita fue agendada exitosamente en el sistema.");
          onCreated();
        }
      } catch (err: any) {
        setFormErr(err.message || "Error al crear la cita.");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Agendar Nueva Cita</h3>
            <div style={{ fontSize: 12, color: "#0f172a", fontWeight: 600 }}>Paso {step} de 2</div>
          </div>
          <button className="btn btn-ghost" style={{ padding: 6 }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Indicator */}
        <div style={{ padding: "10px 22px", background: "#f8fafc", display: "flex", gap: 8, alignItems: "center" }}>
          {[1, 2].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: step >= s ? "#2563eb" : "#e2e8f0",
                  color: step >= s ? "white" : "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {s}
              </div>
              <span style={{ fontSize: 12.5, fontWeight: step === s ? 700 : 500, color: step === s ? "#0f172a" : "#475569" }}>
                {s === 1 ? "Parámetros de atención" : "Confirmación"}
              </span>
              {s < 2 && <ChevronRight size={14} color="#cbd5e1" />}
            </div>
          ))}
        </div>

        <div style={{ padding: 22 }}>
          {formErr && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
              {formErr}
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Sucursal de Atención *</label>
                <select className="input" value={form.sucursal_id} onChange={(e) => setForm({ ...form, sucursal_id: e.target.value })}>
                  {branches.length > 0 ? (
                    branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Sucursal Principal</option>
                  )}
                </select>
              </div>

              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Cliente *</label>
                {clients.length > 0 ? (
                  <select className="input" value={form.cliente_id} onChange={(e) => setForm({ ...form, cliente_id: e.target.value })}>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.email || c.phone})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="input"
                    placeholder="Nombre completo del cliente"
                    value={form.cliente_name}
                    onChange={(e) => setForm({ ...form, cliente_name: e.target.value })}
                  />
                )}
              </div>

              <div className="grid-2col" style={{ gap: 12 }}>
                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Servicio *</label>
                  <select className="input" value={form.servicio_id} onChange={(e) => setForm({ ...form, servicio_id: e.target.value })}>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (${Number(s.price).toLocaleString("es-CL")})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Profesional *</label>
                  <select className="input" value={form.profesional_id} onChange={(e) => setForm({ ...form, profesional_id: e.target.value })}>
                    {staffList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Fecha *</label>
                  <input className="input" type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} />
                </div>

                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Hora *</label>
                  <select className="input" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })}>
                    {HORAS.map((h) => (
                      <option key={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedService && (
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#0f172a", display: "flex", gap: 16, fontWeight: 500 }}>
                  <span><strong>Duración:</strong> {selectedService.duration_minutes || 30} min</span>
                  <span><strong>Precio:</strong> ${Number(selectedService.price || 0).toLocaleString("es-CL")}</span>
                </div>
              )}

              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Observaciones o Notas</label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Detalles o notas sobre la cita..."
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  style={{ resize: "none" }}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: 18 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#0f172a" }}>Resumen de Agendamiento</div>
              {[
                ["Sucursal", selectedBranch?.name || "Sucursal Principal"],
                ["Cliente", selectedClient ? selectedClient.name : form.cliente_name || "Cliente General"],
                ["Servicio", selectedService?.name || "—"],
                ["Profesional", selectedStaff?.name || "—"],
                ["Fecha", form.fecha],
                ["Hora de Inicio", form.hora],
                ["Duración Estimada", `${selectedService?.duration_minutes || 30} minutos`],
                ["Monto Total", `$${Number(selectedService?.price || 0).toLocaleString("es-CL")}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #f1f5f9", flexWrap: "wrap", gap: 4 }}>
                  <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: "14px 22px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
          <button className="btn btn-outline" onClick={step === 1 ? onClose : () => setStep(1)} disabled={loading}>
            {step === 1 ? "Cancelar" : "Atrás"}
          </button>
          {step === 1 ? (
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Continuar
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleConfirmCreate} disabled={loading || isPending}>
              {loading && <Loader2 size={14} className="spin" style={{ marginRight: 6 }} />} Confirmar Cita
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({ cita, onClose, onRefresh, isMobile }: { cita: CitaReal; onClose: () => void; onRefresh: () => void; isMobile: boolean }) {
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async (newStatus: "confirmed" | "completed" | "cancelled") => {
    setUpdating(true);
    try {
      if (newStatus === "cancelled") {
        await cancelAppointmentAction(cita.id, "Cancelada por administrador", false);
      } else if (newStatus === "confirmed") {
        await confirmAppointmentAction(cita.id);
      } else {
        await updateAppointmentStatusAction(cita.id, newStatus);
      }
      NotificationService.success("Estado actualizado", `La cita ahora se encuentra ${ESTADO_LABEL[newStatus] || newStatus}.`);
      onRefresh();
      onClose();
    } catch (e: any) {
      NotificationService.error("Error", e.message || "No se pudo actualizar el estado de la cita.");
    } finally {
      setUpdating(false);
    }
  };

  const style: React.CSSProperties = isMobile
    ? {
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      background: "white",
      borderTop: "1px solid #e2e8f0",
      borderRadius: "14px 14px 0 0",
      zIndex: 300,
      display: "flex",
      flexDirection: "column",
      maxHeight: "85vh",
      overflowY: "auto",
    }
    : {
      position: "fixed",
      right: 0,
      top: 0,
      bottom: 0,
      width: 340,
      background: "white",
      borderLeft: "1px solid #e2e8f0",
      zIndex: 300,
      display: "flex",
      flexDirection: "column",
    };

  return (
    <>
      {isMobile && <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)", zIndex: 299 }} onClick={onClose} />}
      <div style={style}>
        <div style={{ padding: "16px 18px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Detalle de Cita</h3>
          <button className="btn btn-ghost" style={{ padding: 6 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 18, flex: 1, overflowY: "auto" }}>
          <div
            style={{
              background: ESTADO_COLOR[cita.estado] || "#eff6ff",
              borderLeft: `4px solid ${ESTADO_BORDER[cita.estado] || "#2563eb"}`,
              borderRadius: 8,
              padding: "12px 14px",
              marginBottom: 18,
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 18, color: "#0f172a" }}>{cita.hora}</div>
            <div style={{ fontSize: 12.5, color: "#0f172a", marginTop: 2, fontWeight: 600 }}>
              {cita.duracion} min · {ESTADO_LABEL[cita.estado] || cita.estado}
            </div>
          </div>
          {[
            ["Cliente", cita.cliente],
            ["Servicio", cita.servicio],
            ["Profesional", cita.profesional],
            ["Sucursal", cita.sucursal],
            ["Fecha", cita.fecha],
            ["Precio", `$${Number(cita.precio || 0).toLocaleString("es-CL")}`],
          ].map(([k, v]) => (
            <div key={k} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 18px", borderTop: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={() => handleUpdateStatus("confirmed")} disabled={updating}>
            <Check size={14} /> Confirmar
          </button>
          <button className="btn btn-outline" style={{ justifyContent: "center" }} onClick={() => handleUpdateStatus("completed")} disabled={updating}>
            <Check size={14} /> Completar
          </button>
          <button className="btn btn-ghost" style={{ justifyContent: "center", color: "#dc2626" }} onClick={() => handleUpdateStatus("cancelled")} disabled={updating}>
            <Ban size={14} /> Cancelar
          </button>
        </div>
      </div>
    </>
  );
}



export default function Agenda() {
  const router = useRouter();
  const [view, setView] = useState("Día");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<CitaReal | null>(null);

  // Filters
  const [filterProf, setFilterProf] = useState("");
  const [filterBranch, setFilterBranch] = useState("");

  // Data states from DB
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [appointmentsList, setAppointmentsList] = useState<CitaReal[]>([]);
  const [loading, setLoading] = useState(true);

  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const loadAgendaData = async () => {
    setLoading(true);
    router.refresh();
    try {
      const bRes = await getBranchesAction();
      if (bRes.branches) setBranches(bRes.branches);

      const appData = await getAppointmentsDataAction();
      if (appData) {
        if (appData.staffList) setStaffList(appData.staffList);
        if (appData.servicesList) setServicesList(appData.servicesList);
        if (appData.clientsList) setClientsList(appData.clientsList);

        if (appData.appointments && appData.appointments.length > 0) {
          const mapped: CitaReal[] = appData.appointments.map((a: any) => {
            const startDate = new Date(a.start_time);
            const endDate = new Date(a.end_time);
            const dur = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
            const hours = String(startDate.getHours()).padStart(2, "0");
            const minutes = String(startDate.getMinutes()).padStart(2, "0");
            const hoursStr = `${hours}:${minutes}`;
            const dateStr = formatLocalDateString(startDate);

            return {
              id: a.id,
              hora: hoursStr,
              duracion: dur || a.service?.duration_minutes || 30,
              cliente: a.client?.name || "Cliente General",
              cliente_id: a.client_id,
              servicio: a.service?.name || "Servicio",
              servicio_id: a.service_id,
              profesional: a.staff?.name || "Especialista",
              profesional_id: a.staff_id,
              sucursal: bRes.branches?.find((b) => b.id === a.branch_id)?.name || "Sucursal Principal",
              sucursal_id: a.branch_id,
              estado: a.status || "confirmed",
              fecha: dateStr,
              precio: Number(a.total_price || a.service?.price || 0),
              raw_start: a.start_time,
            };
          });
          setAppointmentsList(mapped);
        } else {
          setAppointmentsList([]);
        }
      }
    } catch (e) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgendaData();
  }, []);

  // Date Navigation Controls
  const handlePrevDate = () => {
    const next = new Date(currentDate);
    if (view === "Día") next.setDate(next.getDate() - 1);
    else if (view === "Semana") next.setDate(next.getDate() - 7);
    else if (view === "Mes") next.setMonth(next.getMonth() - 1);
    setCurrentDate(next);
  };

  const handleNextDate = () => {
    const next = new Date(currentDate);
    if (view === "Día") next.setDate(next.getDate() + 1);
    else if (view === "Semana") next.setDate(next.getDate() + 7);
    else if (view === "Mes") next.setMonth(next.getMonth() + 1);
    setCurrentDate(next);
  };

  const formattedDateLabel = currentDate.toLocaleDateString("es-CL", {
    weekday: isMobile ? "short" : "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const currentDateString = formatLocalDateString(currentDate);

  // Filtering Logic
  const activeStaff = filterProf
    ? staffList.filter((p) => p.id === filterProf || p.name === filterProf)
    : staffList;

  const filteredAppointments = appointmentsList.filter((c) => {
    if (filterBranch && c.sucursal_id && c.sucursal_id !== filterBranch) {
      return false;
    }
    if (filterProf && c.profesional_id !== filterProf && c.profesional !== filterProf) {
      return false;
    }
    if (view === "Día") {
      return c.fecha === currentDateString;
    }
    return true;
  });

  return (
    <div style={{ height: "calc(100vh - var(--topbar-height))", display: "flex", flexDirection: "column" }}>
      {/* Toolbar */}
      <div
        style={{
          padding: isMobile ? "10px 12px" : "12px 18px",
          borderBottom: "1px solid #e2e8f0",
          background: "white",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>
          <Plus size={14} /> {isMobile ? "Cita" : "Crear cita"}
        </button>

        <div style={{ display: "flex", gap: 3, background: "#f8fafc", padding: 3, borderRadius: 7, border: "1px solid #e2e8f0" }}>
          {VIEWS.map((v) => (
            <button
              key={v}
              className={`btn btn-sm ${view === v ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: 11.5, padding: "4px 8px" }}
              onClick={() => setView(v)}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Date Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: "4px 6px" }} onClick={handlePrevDate}>
            <ChevronLeft size={14} color="#0f172a" />
          </button>
          <span
            style={{
              fontWeight: 700,
              fontSize: isMobile ? 12.5 : 13.5,
              fontFamily: "var(--font-display)",
              minWidth: isMobile ? 120 : 180,
              textAlign: "center",
              color: "#0f172a",
              textTransform: "capitalize",
            }}
          >
            {formattedDateLabel}
          </span>
          <button className="btn btn-ghost btn-sm" style={{ padding: "4px 6px" }} onClick={handleNextDate}>
            <ChevronRight size={14} color="#0f172a" />
          </button>
        </div>

        {/* Filter Branch & Professional */}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {branches.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Building2 size={13} color="#2563eb" />
              <select
                className="input"
                style={{ width: isMobile ? 130 : 160, fontSize: 12, height: 32, color: "#0f172a", fontWeight: 600 }}
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
              >
                <option value="">Todas las sucursales</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Filter size={13} color="#2563eb" />
            <select
              className="input"
              style={{
                maxWidth: isMobile ? 130 : 180,
                fontSize: 12,
                height: 32,
                color: "#0f172a",
                fontWeight: 600,
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
              value={filterProf}
              onChange={(e) => setFilterProf(e.target.value)}
            >
              <option value="">Todos los profesionales</option>
              {staffList.map((p) => (
                <option key={p.id} value={p.id} title={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Grid Body */}
      <div style={{ flex: 1, overflowY: "auto", background: "#f8fafc" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#0f172a", fontWeight: 600 }}>
            <Loader2 size={24} className="spin" style={{ margin: "0 auto 8px" }} />
            Cargando agenda real...
          </div>
        ) : isMobile ? (
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredAppointments.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, color: "#475569", fontSize: 13, fontWeight: 500 }}>
                No hay citas agendadas para la fecha y filtros seleccionados.
              </div>
            ) : (
              filteredAppointments.map((cita) => (
                <div
                  key={cita.id}
                  onClick={() => setSelected(cita)}
                  style={{
                    background: ESTADO_COLOR[cita.estado] || "#eff6ff",
                    borderLeft: `4px solid ${ESTADO_BORDER[cita.estado] || "#2563eb"}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{cita.hora}</span>
                      <span className={`badge ${ESTADO_BADGE[cita.estado]}`}>{ESTADO_LABEL[cita.estado] || cita.estado}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{cita.cliente}</div>
                    <div style={{ fontSize: 12.5, color: "#0f172a", marginTop: 2, fontWeight: 500 }}>
                      {cita.servicio} · {cita.profesional}
                    </div>
                  </div>
                  <ChevronRight size={16} color="#0f172a" />
                </div>
              ))
            )}
          </div>
        ) : (
          <div style={{ display: "flex", minHeight: "100%", overflowX: "auto" }}>
            <div style={{ width: 64, borderRight: "1px solid #e2e8f0", background: "white", flexShrink: 0, position: "sticky", left: 0, zIndex: 10 }}>
              <div style={{ height: 48, borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }} />
              {HORAS.map((h) => (
                <div key={h} style={{ height: 60, padding: "4px 8px", fontSize: 11.5, fontFamily: "var(--font-mono)", color: "#0f172a", fontWeight: 700, borderBottom: "1px solid #f1f5f9" }}>
                  {h}
                </div>
              ))}
            </div>

            <div
              style={{
                flex: 1,
                display: "grid",
                gridTemplateColumns: `repeat(${activeStaff.length || 1}, minmax(160px, 1fr))`,
                minWidth: Math.max(600, activeStaff.length * 160),
              }}
            >
              {activeStaff.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#475569" }}>No hay profesionales registrados.</div>
              ) : (
                activeStaff.map((p) => (
                  <div key={p.id} style={{ borderRight: "1px solid #e2e8f0", background: "white", minWidth: 160 }}>
                    <div
                      style={{
                        padding: "8px 10px",
                        borderBottom: "1px solid #e2e8f0",
                        background: "#f8fafc",
                        textAlign: "center",
                        height: 48,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                      }}
                      title={p.name}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#0f172a",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                          lineHeight: "1.2",
                        }}
                      >
                        {p.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "#64748b",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                          marginTop: 2,
                        }}
                      >
                        Especialista
                      </div>
                    </div>

                    <div style={{ position: "relative" }}>
                      {HORAS.map((h) => (
                        <div key={h} style={{ height: 60, borderBottom: "1px solid #f1f5f9" }} />
                      ))}

                      {filteredAppointments
                        .filter((c) => c.profesional_id === p.id || c.profesional === p.name)
                        .map((cita) => {
                          const startDate = cita.raw_start ? new Date(cita.raw_start) : null;
                          let top = 4;
                          if (startDate) {
                            const hourNum = startDate.getHours() + startDate.getMinutes() / 60;
                            top = Math.max(4, Math.round((hourNum - 8) * 60));
                          } else {
                            const hIdx = HORAS.indexOf(cita.hora.slice(0, 5));
                            top = hIdx >= 0 ? hIdx * 60 + 4 : 4;
                          }
                          return (
                            <div
                              key={cita.id}
                              onClick={() => setSelected(cita)}
                              style={{
                                position: "absolute",
                                top,
                                left: 4,
                                right: 4,
                                height: 52,
                                background: ESTADO_COLOR[cita.estado] || "#eff6ff",
                                borderLeft: `4px solid ${ESTADO_BORDER[cita.estado] || "#2563eb"}`,
                                borderRadius: 6,
                                padding: "6px 8px",
                                cursor: "pointer",
                                zIndex: 10,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                              }}
                            >
                              <div style={{ fontWeight: 700, fontSize: 12, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {cita.cliente}
                              </div>
                              <div style={{ fontSize: 11, color: "#0f172a", fontWeight: 600 }}>{cita.servicio}</div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateCitaModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadAgendaData();
          }}
          branches={branches}
          services={servicesList}
          staffList={staffList}
          clients={clientsList}
        />
      )}

      {selected && <DetailDrawer cita={selected} onClose={() => setSelected(null)} onRefresh={loadAgendaData} isMobile={isMobile} />}
    </div>
  );
}

