"use client";

import { useState } from "react";
import { Download, Filter, BarChart3, Users, DollarSign } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { CHART_DATA } from "../data/mockData";
import { useBreakpoint } from "../hooks/useBreakpoint";

const TABS = ["Citas", "Clientes", "Ingresos"];

const INGRESO_DATA = [
  { mes: "Mar", ingresos: 890000 },
  { mes: "Abr", ingresos: 1120000 },
  { mes: "May", ingresos: 980000 },
  { mes: "Jun", ingresos: 1340000 },
  { mes: "Jul", ingresos: 1180000 },
  { mes: "Ago", ingresos: 1546000 },
];

const CLIENTES_DATA = [
  { name: "Recurrentes", value: 68, color: "#2563eb" },
  { name: "Nuevos",      value: 22, color: "#16a34a" },
  { name: "Inactivos",   value: 10, color: "#94a3b8" },
];

export default function Reportes() {
  const [tab, setTab] = useState("Citas");
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";

  return (
    <div className="page-pad fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>Reportes</h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>Período: agosto 2025</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm"><Download size={13} /> Exportar</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 22, borderBottom: "2px solid #e2e8f0", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 16px", border: "none", background: "none", cursor: "pointer",
            fontWeight: tab === t ? 700 : 500, fontSize: 13.5,
            color: tab === t ? "#2563eb" : "#64748b",
            borderBottom: `2px solid ${tab === t ? "#2563eb" : "transparent"}`,
            marginBottom: -2, transition: "all 0.12s",
            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          }}>
            {t === "Citas"    && <BarChart3 size={14} />}
            {t === "Clientes" && <Users size={14} />}
            {t === "Ingresos" && <DollarSign size={14} />}
            {t}
          </button>
        ))}
      </div>

      {tab === "Citas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="grid-4col">
            {[
              { label: "Total citas",      value: "85",  change: "+14%", pos: true },
              { label: "Completadas",      value: "62",  change: "+8%",  pos: true },
              { label: "Canceladas",       value: "11",  change: "-3%",  pos: false },
              { label: "Tasa completitud", value: "73%", change: "+5%",  pos: true },
            ].map(k => (
              <div key={k.label} className="kpi-card">
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "#0f172a", margin: "6px 0" }}>{k.value}</div>
                <div style={{ fontSize: 11.5, color: k.pos ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{k.change}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Citas por día</div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={CHART_DATA} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 12.5, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                <Bar dataKey="citas" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "Clientes" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="grid-3col">
            {[
              { label: "Nuevos este mes",       value: "22", color: "#16a34a" },
              { label: "Recurrentes",           value: "68", color: "#2563eb" },
              { label: "Inactivos (+90 días)",  value: "10", color: "#94a3b8" },
            ].map(k => (
              <div key={k.label} className="kpi-card">
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{k.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? 26 : 32, fontWeight: 700, color: k.color, margin: "6px 0" }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div className="grid-2col">
            <div className="card" style={{ padding: isMobile ? 14 : 18 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Segmentación</div>
              <div style={{ display: "flex", justifyContent: "center" }}>
                <PieChart width={200} height={180}>
                  <Pie data={CLIENTES_DATA} cx={95} cy={85} outerRadius={75} paddingAngle={4} dataKey="value">
                    {CLIENTES_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                </PieChart>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {CLIENTES_DATA.map(d => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                    <span style={{ fontSize: 13, color: "#475569" }}>{d.name}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 12, marginLeft: "auto" }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: isMobile ? 14 : 18 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Top clientes</div>
              {[["Sofía Vargas",31],["Valentina López",23],["Camila Fernández",18],["Ana Torres",12],["Marcos Silva",5]].map(([n,c],i) => (
                <div key={String(n)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#94a3b8", width: 14 }}>{i+1}</span>
                    <span style={{ fontSize: 13 }}>{n}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "#2563eb" }}>{c} citas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "Ingresos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="grid-3col">
            {[
              { label: "Ingresos del mes",    value: "$1.546.000", change: "+12%", pos: true },
              { label: "Promedio/cita",        value: "$18.188",    change: "+3%",  pos: true },
              { label: "Proyección mensual",   value: "$1.680.000", change: "",     pos: true },
            ].map(k => (
              <div key={k.label} className="kpi-card">
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>{k.label}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#0f172a", margin: "6px 0" }}>{k.value}</div>
                {k.change && <div style={{ fontSize: 11.5, color: k.pos ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{k.change}</div>}
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: isMobile ? 14 : 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15 }}>Últimos 6 meses</div>
              <button className="btn btn-outline btn-sm"><Download size={12} /> Descargar</button>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={INGRESO_DATA} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ fontSize: 12.5, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={v => [`$${Number(v).toLocaleString("es-CL")}`, "Ingresos"]}
                />
                <Line type="monotone" dataKey="ingresos" stroke="#2563eb" strokeWidth={2.5}
                  dot={{ r: 4, fill: "#2563eb" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid-2col">
            {[
              { title: "Por servicio", items: [["Masaje",420000],["Tratamiento facial",336000],["Manicure",288000],["Consulta",275000],["Corte",225000]], color: "#2563eb" },
              { title: "Por profesional", items: [["Andrea Gómez",612000],["Laura Martínez",574000],["Carlos Rodríguez",360000]], color: "#6366f1" },
            ].map(section => (
              <div key={section.title} className="card" style={{ padding: isMobile ? 14 : 18 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 14 }}>{section.title}</div>
                {section.items.map(([n,m]) => {
                  const pct = (Number(m)/1546000*100).toFixed(0);
                  return (
                    <div key={String(n)} style={{ marginBottom: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                        <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, marginRight: 8 }}>{n}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, flexShrink: 0 }}>${Number(m).toLocaleString("es-CL")}</span>
                      </div>
                      <div style={{ height: 4, background: "#f1f5f9", borderRadius: 4 }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: section.color, borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
