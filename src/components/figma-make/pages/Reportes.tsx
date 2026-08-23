"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, Filter, BarChart3, Users, DollarSign, Calendar, Loader2, FileSpreadsheet, FileText, ChevronDown, Building2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { getReportsDataAction } from "@/app/(dashboard)/reports/actions";
import { ExportService } from "@/lib/services/export.service";
import NotificationService from "@/lib/services/notification.service";

const TABS = ["Citas", "Clientes", "Ingresos"];
const PAGE_SIZE = 10;

const PERIOD_OPTIONS = [
  { id: "this_month", label: "Mes Actual" },
  { id: "last_month", label: "Mes Anterior" },
  { id: "last_3_months", label: "Últimos 3 Meses" },
  { id: "last_6_months", label: "Últimos 6 Meses" },
  { id: "this_year", label: "Año Actual" },
  { id: "all_time", label: "Todo el Historial" },
];

function TablePagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}: {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i);
    } else if (
      (i === 2 && currentPage > 3) ||
      (i === totalPages - 1 && currentPage < totalPages - 2)
    ) {
      if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 mt-3 border-t border-slate-100 text-xs text-slate-500">
      <div>
        Mostrando <span className="font-semibold text-slate-800">{startItem}</span> a{" "}
        <span className="font-semibold text-slate-800">{endItem}</span> de{" "}
        <span className="font-semibold text-slate-800">{totalItems}</span> registros
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Anterior
        </button>

        {pages.map((p, idx) => (
          <React.Fragment key={idx}>
            {typeof p === "number" ? (
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={`w-7 h-7 rounded-lg font-semibold text-xs flex items-center justify-center transition ${
                  currentPage === p
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ) : (
              <span className="px-1 text-slate-400">...</span>
            )}
          </React.Fragment>
        ))}

        <button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

export default function Reportes() {
  const [tab, setTab] = useState("Citas");
  const [periodFilter, setPeriodFilter] = useState("this_month");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [loading, setLoading] = useState(true);
  const [reportsData, setReportsData] = useState<any>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Páginas actuales para cada tabla
  const [citasPage, setCitasPage] = useState(1);
  const [clientesPage, setClientesPage] = useState(1);
  const [ingresosPage, setIngresosPage] = useState(1);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  // Cargar datos reales de Supabase según el período y sucursal seleccionados
  useEffect(() => {
    async function loadReports() {
      try {
        setLoading(true);
        const data = await getReportsDataAction(periodFilter, selectedBranch);
        setReportsData(data);
        setCitasPage(1);
        setClientesPage(1);
        setIngresosPage(1);
      } catch (err: any) {
        console.error("Error cargando reportes:", err);
        NotificationService.error("Error", "No se pudieron obtener los datos de reportes.");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [periodFilter, selectedBranch]);

  // Resetear páginas cuando cambia el TAB
  useEffect(() => {
    setCitasPage(1);
    setClientesPage(1);
    setIngresosPage(1);
  }, [tab]);

  // Cerrar menú de exportación al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (format: "pdf" | "excel") => {
    if (!reportsData) return;
    setShowExportMenu(false);

    const tenantInfo = reportsData.tenantInfo || { name: "Mi Negocio" };
    const periodLabel = reportsData.periodLabel || "Mes Actual";
    const selectedBranchName = reportsData.selectedBranchName || "Todas las sucursales";

    let activeTabData = null;
    if (tab === "Citas") activeTabData = reportsData.kpis.citas;
    if (tab === "Clientes") activeTabData = reportsData.kpis.clientes;
    if (tab === "Ingresos") activeTabData = reportsData.kpis.ingresos;

    if (format === "excel") {
      ExportService.exportToExcel(tab, activeTabData, tenantInfo, periodLabel, selectedBranchName);
      NotificationService.success(
        "¡Reporte Exportado!",
        `El reporte de ${tab} en formato Excel se ha generado correctamente.`
      );
    } else {
      ExportService.exportToPdf(tab, activeTabData, tenantInfo, periodLabel, selectedBranchName);
      NotificationService.success(
        "¡Reporte Generado!",
        `El documento PDF del reporte de ${tab} se ha abierto para guardar o imprimir.`
      );
    }
  };

  const kpis = reportsData?.kpis;
  const periodLabel = reportsData?.periodLabel || "Mes Actual";
  const selectedBranchName = reportsData?.selectedBranchName;
  const branches = reportsData?.branches || [];

  // Paginación de filas por tabla
  const citasFullTable = kpis?.citas?.table || [];
  const citasPaginatedRows = citasFullTable.slice(
    (citasPage - 1) * PAGE_SIZE,
    citasPage * PAGE_SIZE
  );

  const clientesFullTable = kpis?.clientes?.table || [];
  const clientesPaginatedRows = clientesFullTable.slice(
    (clientesPage - 1) * PAGE_SIZE,
    clientesPage * PAGE_SIZE
  );

  const ingresosFullTable = kpis?.ingresos?.table || [];
  const ingresosPaginatedRows = ingresosFullTable.slice(
    (ingresosPage - 1) * PAGE_SIZE,
    ingresosPage * PAGE_SIZE
  );

  return (
    <div className="page-pad fade-in">
      {/* Encabezado y Filtros */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, margin: 0 }}>
            Reportes & Analítica
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748b", marginTop: 4, flexWrap: "wrap" }}>
            <Calendar size={13} className="text-blue-600" />
            <span>Período:</span>
            <span className="font-semibold text-slate-800">{periodLabel}</span>
            {selectedBranchName && (
              <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md border border-blue-200 ml-1">
                📍 {selectedBranchName}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          {/* Selector Desplegable de Sucursal */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Building2 size={13} className="text-slate-400" />
            <select
              className="input text-xs font-semibold py-1.5 px-3 rounded-lg border-slate-300 bg-white cursor-pointer shadow-sm"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
            >
              <option value="all">Todas las sucursales</option>
              {branches.map((b: any) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Selector Desplegable de Período */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Filter size={13} className="text-slate-400" />
            <select
              className="input text-xs font-semibold py-1.5 px-3 rounded-lg border-slate-300 bg-white cursor-pointer shadow-sm"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Menú Desplegable de Exportación (PDF y Excel) */}
          <div className="relative" ref={exportMenuRef}>
            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-1.5 font-medium shadow-sm"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={13} />
              <span>Exportar</span>
              <ChevronDown size={13} />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 fade-in">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Exportar Tab {tab}
                </div>
                <button
                  type="button"
                  onClick={() => handleExport("excel")}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Exportar a Excel (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Exportar a PDF (Imprimir)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 22, borderBottom: "2px solid #e2e8f0", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "10px 16px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: tab === t ? 700 : 500,
              fontSize: 13.5,
              color: tab === t ? "#2563eb" : "#64748b",
              borderBottom: `2px solid ${tab === t ? "#2563eb" : "transparent"}`,
              marginBottom: -2,
              transition: "all 0.12s",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
            }}
          >
            {t === "Citas" && <BarChart3 size={14} />}
            {t === "Clientes" && <Users size={14} />}
            {t === "Ingresos" && <DollarSign size={14} />}
            {t}
          </button>
        ))}
      </div>

      {/* Cargando datos */}
      {loading ? (
        <div className="card flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-sm font-medium">Calculando reportes reales del período...</span>
        </div>
      ) : (
        <>
          {/* TAB CITAS */}
          {tab === "Citas" && kpis?.citas && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid-4col">
                {[
                  { label: "Total citas", value: kpis.citas.total, pos: true },
                  { label: "Completadas", value: kpis.citas.completadas, pos: true },
                  { label: "Canceladas", value: kpis.citas.canceladas, pos: false },
                  { label: "Tasa completitud", value: `${kpis.citas.tasaCompletitud}%`, pos: true },
                ].map((k) => (
                  <div key={k.label} className="kpi-card">
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {k.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "#0f172a", margin: "6px 0" }}>
                      {k.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráfico Citas por Día */}
              <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                  Distribución de Citas por Día
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={kpis.citas.chartByDay} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12.5, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    <Bar dataKey="citas" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Tabla Detallada de Citas Paginada */}
              <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
                <div className="flex justify-between items-center mb-4">
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
                    Detalle de Citas del Período ({citasFullTable.length})
                  </div>
                </div>

                {citasFullTable.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">
                    No hay citas registradas en el período seleccionado.
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Fecha / Hora</th>
                            <th className="py-2.5 px-3">Cliente</th>
                            <th className="py-2.5 px-3">Teléfono</th>
                            <th className="py-2.5 px-3">Servicio</th>
                            <th className="py-2.5 px-3">Profesional</th>
                            <th className="py-2.5 px-3">Estado</th>
                            <th className="py-2.5 px-3 text-right">Precio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {citasPaginatedRows.map((row: any) => (
                            <tr key={row.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 whitespace-nowrap">{row.fecha}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{row.cliente}</td>
                              <td className="py-2.5 px-3 text-slate-500">{row.telefono}</td>
                              <td className="py-2.5 px-3">{row.servicio}</td>
                              <td className="py-2.5 px-3 text-slate-600">{row.profesional}</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                                    row.estado === "Completada"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : row.estado === "Cancelada"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {row.estado}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                                ${row.precio.toLocaleString("es-CO")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      currentPage={citasPage}
                      totalItems={citasFullTable.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setCitasPage}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB CLIENTES */}
          {tab === "Clientes" && kpis?.clientes && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid-3col">
                {[
                  { label: "Nuevos este mes", value: kpis.clientes.nuevos, color: "#16a34a" },
                  { label: "Recurrentes", value: kpis.clientes.recurrentes, color: "#2563eb" },
                  { label: "Inactivos (+90 días)", value: kpis.clientes.inactivos, color: "#94a3b8" },
                ].map((k) => (
                  <div key={k.label} className="kpi-card">
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                      {k.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? 26 : 32, fontWeight: 700, color: k.color, margin: "6px 0" }}>
                      {k.value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid-2col">
                {/* Segmentación */}
                <div className="card" style={{ padding: isMobile ? 14 : 18 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                    Segmentación de Clientes
                  </div>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <PieChart width={200} height={180}>
                      <Pie data={kpis.clientes.segmentationChart} cx={95} cy={85} outerRadius={75} paddingAngle={4} dataKey="value">
                        {kpis.clientes.segmentationChart.map((e: any, i: number) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    </PieChart>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {kpis.clientes.segmentationChart.map((d: any) => (
                      <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                        <span style={{ fontSize: 13, color: "#475569" }}>{d.name}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12, marginLeft: "auto" }}>
                          {d.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Clientes */}
                <div className="card" style={{ padding: isMobile ? 14 : 18 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                    Top Clientes Frecuentes
                  </div>
                  {kpis.clientes.topClients.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">Sin información de clientes aún.</div>
                  ) : (
                    kpis.clientes.topClients.map((c: any, i: number) => (
                      <div
                        key={c.name + i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 0",
                          borderBottom: "1px solid #f8fafc",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#94a3b8", width: 14 }}>
                            {i + 1}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                        </div>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#2563eb" }}>
                          {c.citas} citas (${c.totalSpent.toLocaleString("es-CO")})
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tabla Detallada de Clientes Paginada */}
              <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                  Directorio General de Clientes ({clientesFullTable.length})
                </div>
                {clientesFullTable.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">No hay clientes registrados.</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Cliente</th>
                            <th className="py-2.5 px-3">Correo</th>
                            <th className="py-2.5 px-3">Teléfono</th>
                            <th className="py-2.5 px-3 text-center">Citas Agendadas</th>
                            <th className="py-2.5 px-3 text-right">Total Gastado</th>
                            <th className="py-2.5 px-3 text-right">Fecha Registro</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {clientesPaginatedRows.map((row: any) => (
                            <tr key={row.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{row.nombre}</td>
                              <td className="py-2.5 px-3 text-slate-600">{row.email}</td>
                              <td className="py-2.5 px-3 text-slate-500">{row.telefono}</td>
                              <td className="py-2.5 px-3 text-center font-semibold">{row.citas}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                                ${row.totalSpent.toLocaleString("es-CO")}
                              </td>
                              <td className="py-2.5 px-3 text-right text-slate-400">{row.fechaRegistro}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      currentPage={clientesPage}
                      totalItems={clientesFullTable.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setClientesPage}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* TAB INGRESOS */}
          {tab === "Ingresos" && kpis?.ingresos && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid-3col">
                {[
                  { label: "Ingresos del período", value: `$${kpis.ingresos.total.toLocaleString("es-CO")}`, pos: true },
                  { label: "Promedio / Cita", value: `$${kpis.ingresos.promedioCita.toLocaleString("es-CO")}`, pos: true },
                  { label: "Proyección estimada", value: `$${kpis.ingresos.proyeccion.toLocaleString("es-CO")}`, pos: true },
                ].map((k) => (
                  <div key={k.label} className="kpi-card">
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>
                      {k.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#0f172a", margin: "6px 0" }}>
                      {k.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Gráfico de Líneas - Ingresos */}
              <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>
                    Tendencia de Ingresos Mensuales
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={kpis.ingresos.chartByMonth} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{ fontSize: 12.5, borderRadius: 8, border: "1px solid #e2e8f0" }}
                      formatter={(v) => [`$${Number(v).toLocaleString("es-CO")}`, "Ingresos"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="ingresos"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#2563eb" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Desgloses por Servicio y Profesional */}
              <div className="grid-2col">
                <div className="card" style={{ padding: isMobile ? 14 : 18 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                    Ingresos por Servicio
                  </div>
                  {kpis.ingresos.byService.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">Sin ingresos en el período.</div>
                  ) : (
                    kpis.ingresos.byService.map((item: any) => {
                      const pct = kpis.ingresos.total > 0 ? (item.amount / kpis.ingresos.total) * 100 : 0;
                      return (
                        <div key={item.name} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                            <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>
                              {item.name}
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, flexShrink: 0 }}>
                              ${item.amount.toLocaleString("es-CO")}
                            </span>
                          </div>
                          <div style={{ height: 4, background: "#f1f5f9", borderRadius: 4 }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#2563eb", borderRadius: 4 }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="card" style={{ padding: isMobile ? 14 : 18 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                    Ingresos por Profesional
                  </div>
                  {kpis.ingresos.byStaff.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">Sin ingresos en el período.</div>
                  ) : (
                    kpis.ingresos.byStaff.map((item: any) => {
                      const pct = kpis.ingresos.total > 0 ? (item.amount / kpis.ingresos.total) * 100 : 0;
                      return (
                        <div key={item.name} style={{ marginBottom: 10 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                            <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>
                              {item.name}
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, flexShrink: 0 }}>
                              ${item.amount.toLocaleString("es-CO")}
                            </span>
                          </div>
                          <div style={{ height: 4, background: "#f1f5f9", borderRadius: 4 }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#6366f1", borderRadius: 4 }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Tabla Detallada de Ingresos Paginada */}
              <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
                  Transacciones de Ingresos ({ingresosFullTable.length})
                </div>
                {ingresosFullTable.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">No hay ingresos registrados.</div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2.5 px-3">Fecha / Hora</th>
                            <th className="py-2.5 px-3">Servicio</th>
                            <th className="py-2.5 px-3">Profesional</th>
                            <th className="py-2.5 px-3">Cliente</th>
                            <th className="py-2.5 px-3">Estado Pago</th>
                            <th className="py-2.5 px-3 text-right">Monto</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ingresosPaginatedRows.map((row: any) => (
                            <tr key={row.id} className="hover:bg-slate-50">
                              <td className="py-2.5 px-3 whitespace-nowrap">{row.fecha}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{row.servicio}</td>
                              <td className="py-2.5 px-3 text-slate-600">{row.profesional}</td>
                              <td className="py-2.5 px-3 text-slate-500">{row.cliente}</td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 text-emerald-700">
                                  {row.estado}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                                ${row.monto.toLocaleString("es-CO")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <TablePagination
                      currentPage={ingresosPage}
                      totalItems={ingresosFullTable.length}
                      pageSize={PAGE_SIZE}
                      onPageChange={setIngresosPage}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
