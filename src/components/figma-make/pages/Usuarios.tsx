"use client";

import { useState } from "react";
import { Plus, X, Shield, ChevronRight } from "lucide-react";
import { USUARIOS } from "../data/mockData";
import { useBreakpoint } from "../hooks/useBreakpoint";

const ROLES = ["Administrador", "Gerente", "Profesional", "Recepción"];

const PERMISOS = {
  Dashboard: ["Ver", "Exportar"],
  Agenda: ["Ver", "Crear", "Editar", "Cancelar"],
  Clientes: ["Ver", "Crear", "Editar", "Eliminar"],
  Profesionales: ["Ver", "Crear", "Editar"],
  Servicios: ["Ver", "Crear", "Editar", "Eliminar"],
  Sucursales: ["Ver", "Crear", "Editar"],
  Reportes: ["Ver", "Exportar"],
  Configuración: ["Ver", "Editar"],
};

const ROL_COLOR: Record<string, string> = {
  Administrador: "badge-primary",
  Gerente: "badge-info",
  Profesional: "badge-success",
  Recepción: "badge-neutral",
};

export default function Usuarios() {
  const [showForm, setShowForm] = useState(false);
  const [showPermisos, setShowPermisos] = useState<typeof USUARIOS[0] | null>(null);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  return (
    <div className="page-pad fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>Usuarios y Roles</h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>{USUARIOS.length} usuarios</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> {isMobile ? "Usuario" : "Nuevo usuario"}
        </button>
      </div>

      {/* Role overview */}
      <div className="grid-4col" style={{ marginBottom: 18 }}>
        {ROLES.map(r => (
          <div key={r} className="card" style={{ padding: "14px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Shield size={16} color="#2563eb" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r}</div>
              <div style={{ fontSize: 11.5, color: "#64748b" }}>{USUARIOS.filter(u => u.rol === r).length} usuario{USUARIOS.filter(u => u.rol === r).length !== 1 ? "s" : ""}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Users */}
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {USUARIOS.map(u => (
            <div key={u.id} className="card" style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontWeight: 700, fontSize: 11,
                }}>{u.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "#0f172a" }}>{u.nombre}</div>
                  <div style={{ fontSize: 12, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.correo}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                    <span className={`badge ${ROL_COLOR[u.rol]}`}>{u.rol}</span>
                    <span className={`badge ${u.estado === "Activo" ? "badge-success" : "badge-neutral"}`}>{u.estado}</span>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPermisos(u)} style={{ flexShrink: 0 }}>
                <ChevronRight size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="table-scroll">
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 200px 140px 150px 80px 120px",
              gap: 10, padding: "10px 16px", borderBottom: "1px solid #f1f5f9",
              fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em",
              minWidth: 700,
            }}>
              <span>Nombre</span><span>Correo</span><span>Rol</span><span>Último acceso</span><span>Estado</span><span>Acciones</span>
            </div>
            {USUARIOS.map((u, i) => (
              <div key={u.id} className="table-row" style={{
                display: "grid", gridTemplateColumns: "1fr 200px 140px 150px 80px 120px",
                gap: 10, padding: "12px 16px", alignItems: "center", minWidth: 700,
                borderBottom: i < USUARIOS.length - 1 ? "1px solid #f8fafc" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "white", fontWeight: 700, fontSize: 11,
                  }}>{u.nombre.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{u.nombre}</span>
                </div>
                <span style={{ fontSize: 12.5, color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.correo}</span>
                <span className={`badge ${ROL_COLOR[u.rol]}`}>{u.rol}</span>
                <span style={{ fontSize: 12.5, color: "#94a3b8" }}>{u.ultimoAcceso}</span>
                <span className={`badge ${u.estado === "Activo" ? "badge-success" : "badge-neutral"}`}>{u.estado}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowPermisos(u)}>Permisos</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions modal */}
      {showPermisos && (
        <div className="modal-overlay" onClick={() => setShowPermisos(null)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Permisos — {showPermisos.nombre}</h3>
                <span className={`badge ${ROL_COLOR[showPermisos.rol]}`}>{showPermisos.rol}</span>
              </div>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowPermisos(null)}><X size={16} /></button>
            </div>
            <div style={{ padding: 20, maxHeight: 460, overflowY: "auto" }}>
              {Object.entries(PERMISOS).map(([modulo, acciones]) => (
                <div key={modulo} style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <Shield size={12} color="#94a3b8" /> {modulo}
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingLeft: 20 }}>
                    {acciones.map(a => (
                      <label key={a} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                        <input type="checkbox"
                          defaultChecked={showPermisos.rol === "Administrador" || (showPermisos.rol === "Gerente" && a !== "Eliminar")}
                          style={{ accentColor: "#2563eb" }} />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setShowPermisos(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setShowPermisos(null)}>Guardar permisos</button>
            </div>
          </div>
        </div>
      )}

      {/* New user */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Nuevo usuario</h3>
              <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowForm(false)}><X size={16} /></button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                <div><label className="label">Nombre *</label><input className="input" type="text" placeholder="María" /></div>
                <div><label className="label">Apellido *</label><input className="input" type="text" placeholder="González" /></div>
              </div>
              <div><label className="label">Correo *</label><input className="input" type="email" placeholder="usuario@empresa.cl" /></div>
              <div><label className="label">Rol *</label><select className="input">{ROLES.map(r => <option key={r}>{r}</option>)}</select></div>
              <div><label className="label">Contraseña temporal *</label><input className="input" type="password" placeholder="••••••••" /></div>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setShowForm(false)}>Crear usuario</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
