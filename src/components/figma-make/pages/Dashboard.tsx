"use client";

import { useState } from "react";
import {
  Calendar, Users, TrendingUp, DollarSign, ArrowUp, ArrowDown,
  Plus, UserPlus, Scissors, UserCheck, ChevronRight, ChevronLeft, Clock,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { CITAS_HOY, CHART_DATA } from "../data/mockData";
import { useBreakpoint } from "../hooks/useBreakpoint";

const ESTADO_COLOR: Record<string, string> = {
  Confirmada: "badge-primary",
  Pendiente: "badge-warning",
  Cancelada: "badge-danger",
  Completada: "badge-success",
};

const DEFAULT_PIE_DATA = [
  { name: "Confirmadas", value: 0, color: "#2563eb" },
  { name: "Completadas", value: 0, color: "#16a34a" },
  { name: "Pendientes", value: 0, color: "#eab308" },
  { name: "Canceladas", value: 0, color: "#dc2626" },
];

const PERIODS = ["Hoy", "Esta semana", "Este mes"];
const CITAS_PER_PAGE = 5;

interface Props {
  onNavigate: (page: string) => void;
  kpis?: {
    todayAppointments?: number | string;
    todayChange?: string;
    todayPositive?: boolean;

    pendingAppointments?: number | string;

    clientsCount?: number | string;
    clientsChange?: string;
    clientsPositive?: boolean;

    totalIncome?: string;
    incomeChange?: string;
    incomePositive?: boolean;

    chartDataHoy?: Array<{ dia: string; citas: number }>;
    chartDataSemana?: Array<{ dia: string; citas: number }>;
    chartDataMes?: Array<{ dia: string; citas: number }>;
    pieStatusData?: Array<{ name: string; value: number; color: string }>;
  };
  citasHoyData?: Array<{
    id: string | number;
    hora: string;
    cliente: string;
    servicio: string;
    profesional: string;
    precio?: number;
    estado: string;
  }>;
}

export default function Dashboard({ onNavigate, kpis, citasHoyData }: Props) {
  const [period, setPeriod] = useState("Esta semana");
  const [currentPage, setCurrentPage] = useState(1);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const citasHoyList = citasHoyData || [];
  const todayCount = kpis?.todayAppointments !== undefined ? String(kpis.todayAppointments) : String(citasHoyList.length);
  const todayChangeStr = kpis?.todayChange || "+0%";
  const todayIsPositive = kpis?.todayPositive !== undefined ? kpis.todayPositive : true;

  const pendingCount = kpis?.pendingAppointments !== undefined ? String(kpis.pendingAppointments) : "0";

  const clientCount = kpis?.clientsCount !== undefined ? String(kpis.clientsCount) : "0";
  const clientsChangeStr = kpis?.clientsChange || "+0%";
  const clientsIsPositive = kpis?.clientsPositive !== undefined ? kpis.clientsPositive : true;

  const incomeValue = kpis?.totalIncome || "$0";
  const incomeChangeStr = kpis?.incomeChange || "+0%";
  const incomeIsPositive = kpis?.incomePositive !== undefined ? kpis.incomePositive : true;

  // Paginación de citas de hoy
  const totalPages = Math.ceil(citasHoyList.length / CITAS_PER_PAGE);
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const paginatedCitasHoy = citasHoyList.slice(
    (validCurrentPage - 1) * CITAS_PER_PAGE,
    validCurrentPage * CITAS_PER_PAGE
  );

  // Gráfica dinámica según el período seleccionado (Hoy, Esta semana, Este mes)
  let areaChartData: Array<{ dia: string; citas: number; ingresos?: number }> = CHART_DATA;
  if (period === "Hoy" && kpis?.chartDataHoy && kpis.chartDataHoy.length > 0) {
    areaChartData = kpis.chartDataHoy;
  } else if (period === "Esta semana" && kpis?.chartDataSemana && kpis.chartDataSemana.length > 0) {
    areaChartData = kpis.chartDataSemana;
  } else if (period === "Este mes" && kpis?.chartDataMes && kpis.chartDataMes.length > 0) {
    areaChartData = kpis.chartDataMes;
  }

  const pieChartData = kpis?.pieStatusData && kpis.pieStatusData.length > 0
    ? kpis.pieStatusData
    : DEFAULT_PIE_DATA;

  const fechaHoyStr = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const KPI = ({ icon: Icon, label, value, change, positive, color }: {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    label: string; value: string; change: string; positive: boolean; color: string;
  }) => (
    <div className="kpi-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
          <div className="kpi-value" style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? 24 : 30, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>{value}</div>
        </div>
        <div style={{
          width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius: 10, flexShrink: 0,
          background: color + "15", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={isMobile ? 17 : 20} color={color} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
        {positive
          ? <><ArrowUp size={12} color="#16a34a" /><span className="stat-up" style={{ fontWeight: 600 }}>{change}</span></>
          : <><ArrowDown size={12} color="#dc2626" /><span className="stat-down" style={{ fontWeight: 600 }}>{change}</span></>}
        <span style={{ color: "#94a3b8" }}>vs. período anterior</span>
      </div>
    </div>
  );

  return (
    <div className="page-pad fade-in" style={{ maxWidth: 1280 }}>
      {/* Acciones Rápidas con Tabs with underline */}
      <div className="flex border-b border-[#e2e8f0] mb-6 overflow-x-auto gap-2">
        <button
          type="button"
          onClick={() => onNavigate("agenda")}
          className="px-4 py-3 text-sm font-semibold text-[#64748b] hover:text-[#2563eb] border-b-2 border-transparent hover:border-[#2563eb] transition-all flex items-center gap-2 whitespace-nowrap -mb-px focus:outline-none"
        >
          <Plus size={16} color="#2563eb" />
          <span>Nueva cita</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("clientes")}
          className="px-4 py-3 text-sm font-semibold text-[#64748b] hover:text-[#2563eb] border-b-2 border-transparent hover:border-[#2563eb] transition-all flex items-center gap-2 whitespace-nowrap -mb-px focus:outline-none"
        >
          <UserPlus size={16} color="#2563eb" />
          <span>Nuevo cliente</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("servicios")}
          className="px-4 py-3 text-sm font-semibold text-[#64748b] hover:text-[#2563eb] border-b-2 border-transparent hover:border-[#2563eb] transition-all flex items-center gap-2 whitespace-nowrap -mb-px focus:outline-none"
        >
          <Scissors size={16} color="#2563eb" />
          <span>Nuevo servicio</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("profesionales")}
          className="px-4 py-3 text-sm font-semibold text-[#64748b] hover:text-[#2563eb] border-b-2 border-transparent hover:border-[#2563eb] transition-all flex items-center gap-2 whitespace-nowrap -mb-px focus:outline-none"
        >
          <UserCheck size={16} color="#2563eb" />
          <span>Nuevo profesional</span>
        </button>
      </div>

      {/* KPIs Reales */}
      <div className="grid-kpi" style={{ marginBottom: 20 }}>
        <KPI icon={Calendar} label="Citas hoy" value={todayCount} change={todayChangeStr} positive={todayIsPositive} color="#2563eb" />
        <KPI icon={Clock} label="Pendientes" value={pendingCount} change="0%" positive={true} color="#eab308" />
        <KPI icon={Users} label="Clientes nuevos" value={clientCount} change={clientsChangeStr} positive={clientsIsPositive} color="#16a34a" />
        <KPI icon={DollarSign} label={isMobile ? "Ingresos" : "Ingresos del mes"} value={incomeValue} change={incomeChangeStr} positive={incomeIsPositive} color="#6366f1" />
      </div>

      {/* Charts */}
      <div className="grid-chart" style={{ marginBottom: 20 }}>
        {/* Area chart */}
        <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Evolución de citas</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {period === "Hoy" ? "Por horas del día" : period === "Esta semana" ? "Por día de la semana" : "Por semanas del mes"}
              </div>
            </div>

            {/* Tabs con subrayado para seleccionar Período */}
            <div className="flex border-b border-[#e2e8f0] gap-1 overflow-x-auto">
              {PERIODS.map((p) => {
                const isActive = period === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-2 text-xs font-semibold transition-all border-b-2 whitespace-nowrap -mb-px focus:outline-none ${isActive
                        ? "border-[#2563eb] text-[#2563eb]"
                        : "border-transparent text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]"
                      }`}
                  >
                    {isMobile ? p.split(" ")[p === "Hoy" ? 0 : 1] : p}
                  </button>
                );
              })}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={areaChartData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="citasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12.5 }} />
              <Area type="monotone" dataKey="citas" stroke="#2563eb" strokeWidth={2.5} fill="url(#citasGrad)" dot={{ r: 3, fill: "#2563eb" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Estado de citas</div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>Distribución total registrada</div>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <PieChart width={140} height={140}>
              <Pie data={pieChartData} cx={65} cy={65} innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                {pieChartData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            </PieChart>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {pieChartData.map(d => (
                <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12.5, color: "#475569" }}>{d.name}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, color: "#0f172a", marginLeft: "auto" }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Citas de Hoy con Columna de Precio y Paginador */}
      <div className="card">
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Citas de hoy</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2, textTransform: "capitalize" }}>{fechaHoyStr}</div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ color: "#2563eb" }} onClick={() => onNavigate("agenda")}>
            Ver agenda <ChevronRight size={13} />
          </button>
        </div>

        {/* Sin citas hoy */}
        {citasHoyList.length === 0 ? (
          <div style={{ padding: 30, textAlign: "center", color: "#64748b", fontSize: 13 }}>
            No hay citas agendadas para el día de hoy.
          </div>
        ) : (
          <>
            {/* Mobile: card list */}
            {isMobile ? (
              <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                {paginatedCitasHoy.map((cita: any) => (
                  <div key={cita.id} style={{
                    padding: "10px 12px", borderRadius: 8, border: "1px solid #f1f5f9",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, color: "#2563eb" }}>{cita.hora}</span>
                        <span className={`badge ${ESTADO_COLOR[cita.estado] || "badge-primary"}`}>{cita.estado}</span>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{cita.cliente}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        {cita.servicio} · {(cita.profesional || "").split(" ")[0]}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 700, color: "#0f172a", marginTop: 2 }}>
                        ${(Number(cita.precio) || 0).toLocaleString("es-CO")}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ padding: "4px 8px", flexShrink: 0 }} onClick={() => onNavigate("agenda")}>
                      Ver
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop: table con columna de PRECIO */
              paginatedCitasHoy.map((cita: any, i: number) => (
                <div key={cita.id} className="table-row" style={{
                  padding: "11px 16px",
                  display: "grid",
                  gridTemplateColumns: "72px 1fr 1fr 1fr 90px 100px 64px",
                  gap: 12, alignItems: "center",
                  borderBottom: i < paginatedCitasHoy.length - 1 ? "1px solid #f8fafc" : "none",
                }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12.5, color: "#2563eb" }}>{cita.hora}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{cita.cliente}</span>
                  <span style={{ fontSize: 13, color: "#475569" }}>{cita.servicio}</span>
                  <span style={{ fontSize: 12.5, color: "#64748b" }}>{cita.profesional}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                    ${(Number(cita.precio) || 0).toLocaleString("es-CO")}
                  </span>
                  <span className={`badge ${ESTADO_COLOR[cita.estado] || "badge-primary"}`}>{cita.estado}</span>
                  <button className="btn btn-ghost btn-sm" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => onNavigate("agenda")}>
                    Ver
                  </button>
                </div>
              ))
            )}

            {/* Paginador de Citas de Hoy */}
            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderTop: "1px solid #f1f5f9",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Mostrando {(validCurrentPage - 1) * CITAS_PER_PAGE + 1} -{" "}
                  {Math.min(validCurrentPage * CITAS_PER_PAGE, citasHoyList.length)} de{" "}
                  {citasHoyList.length} citas
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={validCurrentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px" }}
                  >
                    <ChevronLeft size={13} /> Anterior
                  </button>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#0f172a",
                      padding: "3px 10px",
                      background: "#f1f5f9",
                      borderRadius: 6,
                    }}
                  >
                    Página {validCurrentPage} de {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    disabled={validCurrentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px" }}
                  >
                    Siguiente <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
