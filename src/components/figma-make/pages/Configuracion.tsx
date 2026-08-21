"use client";

import { useState } from "react";
import { Building2, Calendar, Bell, Users, Plug, Upload, Check } from "lucide-react";
import { useBreakpoint } from "../hooks/useBreakpoint";

const SECTIONS = [
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "integraciones", label: "Integraciones", icon: Plug },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      width: 42, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
      background: checked ? "#2563eb" : "#d1d5db", position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", background: "white",
        position: "absolute", top: 3, left: checked ? 21 : 3,
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

export default function Configuracion() {
  const [section, setSection] = useState("empresa");
  const [saved, setSaved] = useState(false);
  const [toggles, setToggles] = useState({
    email: true, whatsapp: false, recordatorio24h: true, recordatorio1h: true, confirmacion: true, cancelacion: true,
  });
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="page-pad fade-in">
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Configuración</h2>

      {/* Mobile: horizontal tabs */}
      {isMobile ? (
        <div style={{ display: "flex", gap: 4, marginBottom: 18, overflowX: "auto", padding: "2px 0" }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              padding: "7px 12px", borderRadius: 7, cursor: "pointer",
              border: `1px solid ${section === s.id ? "#bfdbfe" : "#e2e8f0"}`,
              background: section === s.id ? "#eff6ff" : "#f8fafc",
              color: section === s.id ? "#2563eb" : "#64748b",
              fontWeight: section === s.id ? 700 : 500, fontSize: 12.5,
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
            }}>
              <s.icon size={13} /> {s.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, maxWidth: 1100 }}>
          <div className="card" style={{ padding: 12, height: "fit-content" }}>
            {SECTIONS.map(s => (
              <div key={s.id} className={`nav-item${section === s.id ? " active" : ""}`}
                onClick={() => setSection(s.id)} style={{ padding: "9px 12px", marginBottom: 2 }}>
                <s.icon size={16} /> {s.label}
              </div>
            ))}
          </div>
          <ContentArea section={section} handleSave={handleSave} saved={saved} toggles={toggles} setToggles={setToggles} />
        </div>
      )}

      {isMobile && (
        <ContentArea section={section} handleSave={handleSave} saved={saved} toggles={toggles} setToggles={setToggles} />
      )}
    </div>
  );
}

function ContentArea({ section, handleSave, saved, toggles, setToggles }: {
  section: string; handleSave: () => void; saved: boolean;
  toggles: Record<string, boolean>; setToggles: React.Dispatch<React.SetStateAction<any>>;
}) {
  if (section === "empresa") return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Empresa</div>
      <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 22 }}>Información y branding de tu empresa.</p>
      <div style={{ marginBottom: 20 }}>
        <label className="label">Logo</label>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div style={{ width: 64, height: 64, borderRadius: 12, background: "linear-gradient(135deg, #2563eb, #1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20 }}>AP</div>
          <button className="btn btn-outline"><Upload size={14} /> Subir logo</button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div>
          <label className="label">Nombre de la empresa</label>
          <input className="input" defaultValue="Mi Negocio" />
        </div>
        <div>
          <label className="label">Color principal</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="input" defaultValue="#2563eb" style={{ flex: 1 }} />
            <input type="color" defaultValue="#2563eb" style={{ width: 40, height: 38, padding: 2, border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }} />
          </div>
        </div>
        {[["Teléfono", "tel", "+56 9 1234 5678"], ["Correo", "email", "contacto@agendapro.cl"], ["Dirección", "text", "Av. Principal 123"], ["Ciudad", "text", "Santiago"]].map(([l, t, p]) => (
          <div key={l}><label className="label">{l}</label><input className="input" type={t} defaultValue={p} /></div>
        ))}
      </div>
      <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <button className="btn btn-outline">Descartar</button>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <><Check size={14} /> Guardado</> : "Guardar cambios"}
        </button>
      </div>
    </div>
  );

  if (section === "agenda") return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Agenda</div>
      <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 22 }}>Reglas de agendamiento para tu negocio.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <div><label className="label">Duración predeterminada</label><select className="input" defaultValue="45">{[15, 30, 45, 60, 90, 120].map(v => <option key={v}>{v} min</option>)}</select></div>
        <div><label className="label">Anticipación mínima</label><select className="input">{"30 min,1 hora,2 horas,4 horas,24 horas".split(",").map(v => <option key={v}>{v}</option>)}</select></div>
        <div><label className="label">Política de cancelación</label><select className="input">{"Sin restricción,24 horas antes,48 horas antes".split(",").map(v => <option key={v}>{v}</option>)}</select></div>
        <div><label className="label">Inicio de jornada</label><input className="input" type="time" defaultValue="08:00" /></div>
        <div><label className="label">Fin de jornada</label><input className="input" type="time" defaultValue="18:00" /></div>
      </div>
      <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-primary" onClick={handleSave}>{saved ? "Guardado ✓" : "Guardar"}</button>
      </div>
    </div>
  );

  if (section === "notificaciones") return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Notificaciones</div>
      <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 22 }}>Configura qué notificaciones enviar a tus clientes.</p>
      {[
        { key: "email", label: "Notificaciones por correo", desc: "Recordatorios y confirmaciones por email" },
        { key: "whatsapp", label: "WhatsApp Business", desc: "Mensajes de WhatsApp (requiere integración)" },
        { key: "recordatorio24h", label: "Recordatorio 24h antes", desc: "Recordar la cita un día antes" },
        { key: "recordatorio1h", label: "Recordatorio 1h antes", desc: "Recordar la cita una hora antes" },
        { key: "confirmacion", label: "Confirmación de cita", desc: "Notificar cuando se crea una cita" },
        { key: "cancelacion", label: "Aviso de cancelación", desc: "Notificar cuando se cancela" },
      ].map(n => (
        <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #f8fafc", gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.label}</div>
            <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>{n.desc}</div>
          </div>
          <Toggle checked={toggles[n.key]} onChange={v => setToggles((t: Record<string, boolean>) => ({ ...t, [n.key]: v }))} />
        </div>
      ))}
    </div>
  );

  if (section === "integraciones") return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Integraciones</div>
      <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 22 }}>Conecta la plataforma con otras herramientas externas.</p>
      {[
        { nombre: "Google Calendar", desc: "Sincroniza citas automáticamente", disponible: true },
        { nombre: "WhatsApp Business", desc: "Envía recordatorios por WhatsApp", disponible: false },
        { nombre: "Stripe", desc: "Acepta pagos en línea", disponible: false },
        { nombre: "Zapier", desc: "Automatiza flujos de trabajo", disponible: false },
      ].map(i => (
        <div key={i.nombre} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 14, border: "1px solid #e2e8f0", borderRadius: 8, marginBottom: 10, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{i.nombre}</div>
            <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>{i.desc}</div>
          </div>
          <button className={`btn ${i.disponible ? "btn-outline" : "btn-ghost"} btn-sm`} disabled={!i.disponible}>
            {i.disponible ? "Conectar" : "Próximamente"}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Usuarios y Roles</div>
      <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 18 }}>Gestiona el acceso del equipo desde el módulo de Usuarios.</p>
      <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "14px 16px", fontSize: 13.5, color: "#1d4ed8" }}>
        Ve a <strong>Usuarios y Roles</strong> para gestionar permisos en detalle.
      </div>
    </div>
  );
}
