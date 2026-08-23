"use client";

import React, { useState, useEffect, useRef } from "react";
import { Building2, Calendar, Bell, Users, Plug, Upload, Check, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { getTenantConfigAction, saveTenantConfigAction, uploadTenantLogoAction } from "@/app/(dashboard)/settings/actions";
import NotificationService from "@/lib/services/notification.service";

const SECTIONS = [
  { id: "empresa", label: "Empresa", icon: Building2 },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "notificaciones", label: "Notificaciones", icon: Bell },
  { id: "usuarios", label: "Usuarios", icon: Users },
  { id: "integraciones", label: "Integraciones", icon: Plug },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: checked ? "#2563eb" : "#d1d5db",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

export default function Configuracion() {
  const [section, setSection] = useState("empresa");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form State - Empresa
  const [tenantName, setTenantName] = useState("Mi Negocio");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  // Form State - Agenda
  const [defaultSlotDuration, setDefaultSlotDuration] = useState(45);
  const [minBookingNoticeHours, setMinBookingNoticeHours] = useState(2);
  const [cancellationHoursNotice, setCancellationHoursNotice] = useState(24);
  const [startWorkTime, setStartWorkTime] = useState("08:00");
  const [endWorkTime, setEndWorkTime] = useState("18:00");

  // Form State - Notificaciones
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    email: true,
    whatsapp: false,
    recordatorio24h: true,
    recordatorio1h: true,
    confirmacion: true,
    cancelacion: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  // Cargar configuración inicial desde la base de datos
  useEffect(() => {
    async function loadConfig() {
      try {
        setLoading(true);
        const res = await getTenantConfigAction();

        if (res.tenant) {
          setTenantName(res.tenant.name || "Mi Negocio");
          setLogoUrl(res.tenant.logo_url || null);
          setPhone(res.tenant.phone || "");
          setEmail(res.tenant.email || "");
          setAddress(res.tenant.address || "");
          setCity(res.tenant.city || "");
        }

        if (res.theme?.primary_color) {
          setPrimaryColor(res.theme.primary_color);
        }

        if (res.settings) {
          setDefaultSlotDuration(res.settings.default_slot_duration ?? 45);
          setMinBookingNoticeHours(res.settings.min_booking_notice_hours ?? 2);
          setCancellationHoursNotice(res.settings.cancellation_hours_notice ?? 24);
          setStartWorkTime(res.settings.start_work_time || "08:00");
          setEndWorkTime(res.settings.end_work_time || "18:00");

          if (res.settings.notification_toggles) {
            setToggles((prev) => ({
              ...prev,
              ...res.settings.notification_toggles,
            }));
          }
        }
      } catch (err: any) {
        console.error("Error cargando configuración:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConfig();
  }, []);

  // Subida de Logo
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadTenantLogoAction(formData);
      if (res.success && res.logoUrl) {
        setLogoUrl(res.logoUrl);
        await NotificationService.success(
          "¡Logo Actualizado!",
          "El nuevo logo se ha subido y aplicado al negocio."
        );
      } else {
        await NotificationService.error("Error al subir logo", res.error || "No se pudo subir la imagen.");
      }
    } catch (err: any) {
      await NotificationService.error("Error al subir logo", err.message || "Error inesperado.");
    } finally {
      setUploadingLogo(false);
    }
  };

  // Guardar Empresa
  const handleSaveEmpresa = async () => {
    try {
      setSaving(true);
      const res = await saveTenantConfigAction({
        name: tenantName,
        phone,
        email,
        address,
        city,
        primaryColor,
      });

      if (res.success) {
        await NotificationService.success(
          "¡Datos Guardados!",
          "La información de la empresa y el color principal han sido actualizados."
        );
        // Sincronizar estado con la base de datos
        const refreshed = await getTenantConfigAction();
        if (refreshed.tenant) {
          setTenantName(refreshed.tenant.name || "Mi Negocio");
          setLogoUrl(refreshed.tenant.logo_url || null);
          setPhone(refreshed.tenant.phone || "");
          setEmail(refreshed.tenant.email || "");
          setAddress(refreshed.tenant.address || "");
          setCity(refreshed.tenant.city || "");
        }
        if (refreshed.theme?.primary_color) {
          setPrimaryColor(refreshed.theme.primary_color);
        }
      } else {
        await NotificationService.error("Error al guardar", res.error);
      }
    } catch (err: any) {
      await NotificationService.error("Error de conexión", err.message);
    } finally {
      setSaving(false);
    }
  };

  // Guardar Agenda
  const handleSaveAgenda = async () => {
    try {
      setSaving(true);
      const res = await saveTenantConfigAction({
        defaultSlotDuration: Number(defaultSlotDuration),
        minBookingNoticeHours: Number(minBookingNoticeHours),
        cancellationHoursNotice: Number(cancellationHoursNotice),
        startWorkTime,
        endWorkTime,
      });

      if (res.success) {
        await NotificationService.success(
          "¡Agenda Guardada!",
          "Las reglas de agendamiento y la política de cancelación se han actualizado."
        );
        const refreshed = await getTenantConfigAction();
        if (refreshed.settings) {
          setDefaultSlotDuration(refreshed.settings.default_slot_duration ?? 45);
          setMinBookingNoticeHours(refreshed.settings.min_booking_notice_hours ?? 2);
          setCancellationHoursNotice(refreshed.settings.cancellation_hours_notice ?? 24);
          setStartWorkTime(refreshed.settings.start_work_time || "08:00");
          setEndWorkTime(refreshed.settings.end_work_time || "18:00");
        }
      } else {
        await NotificationService.error("Error al guardar", res.error);
      }
    } catch (err: any) {
      await NotificationService.error("Error de conexión", err.message);
    } finally {
      setSaving(false);
    }
  };

  // Guardar Notificaciones
  const handleSaveNotificaciones = async (updatedToggles?: Record<string, boolean>) => {
    const activeToggles = updatedToggles || toggles;
    try {
      setSaving(true);
      const res = await saveTenantConfigAction({
        notificationToggles: activeToggles,
      });

      if (res.success) {
        await NotificationService.success(
          "¡Notificaciones Guardadas!",
          "Las preferencias de alertas han sido actualizadas."
        );
        const refreshed = await getTenantConfigAction();
        if (refreshed.settings?.notification_toggles) {
          setToggles((prev) => ({
            ...prev,
            ...refreshed.settings.notification_toggles,
          }));
        }
      } else {
        await NotificationService.error("Error al guardar", res.error);
      }
    } catch (err: any) {
      await NotificationService.error("Error de conexión", err.message);
    } finally {
      setSaving(false);
    }
  };

  const logoInitials = tenantName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "MN";

  if (loading) {
    return (
      <div className="page-pad flex flex-col items-center justify-center min-h-[300px] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Cargando configuración del negocio...</span>
      </div>
    );
  }

  return (
    <div className="page-pad fade-in">
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 18 }}>
        Configuración del Negocio
      </h2>

      {/* Tabs Horizontal Mobile */}
      {isMobile ? (
        <div style={{ display: "flex", gap: 4, marginBottom: 18, overflowX: "auto", padding: "2px 0" }}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                padding: "7px 12px",
                borderRadius: 7,
                cursor: "pointer",
                border: `1px solid ${section === s.id ? "#bfdbfe" : "#e2e8f0"}`,
                background: section === s.id ? "#eff6ff" : "#f8fafc",
                color: section === s.id ? "#2563eb" : "#64748b",
                fontWeight: section === s.id ? 700 : 500,
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <s.icon size={13} /> {s.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, maxWidth: 1100 }}>
          <div className="card" style={{ padding: 12, height: "fit-content" }}>
            {SECTIONS.map((s) => (
              <div
                key={s.id}
                className={`nav-item${section === s.id ? " active" : ""}`}
                onClick={() => setSection(s.id)}
                style={{ padding: "9px 12px", marginBottom: 2 }}
              >
                <s.icon size={16} /> {s.label}
              </div>
            ))}
          </div>

          <ContentArea
            section={section}
            saving={saving}
            uploadingLogo={uploadingLogo}
            tenantName={tenantName}
            setTenantName={setTenantName}
            logoUrl={logoUrl}
            logoInitials={logoInitials}
            fileInputRef={fileInputRef}
            handleLogoChange={handleLogoChange}
            primaryColor={primaryColor}
            setPrimaryColor={setPrimaryColor}
            phone={phone}
            setPhone={setPhone}
            email={email}
            setEmail={setEmail}
            address={address}
            setAddress={setAddress}
            city={city}
            setCity={setCity}
            handleSaveEmpresa={handleSaveEmpresa}
            defaultSlotDuration={defaultSlotDuration}
            setDefaultSlotDuration={setDefaultSlotDuration}
            minBookingNoticeHours={minBookingNoticeHours}
            setMinBookingNoticeHours={setMinBookingNoticeHours}
            cancellationHoursNotice={cancellationHoursNotice}
            setCancellationHoursNotice={setCancellationHoursNotice}
            startWorkTime={startWorkTime}
            setStartWorkTime={setStartWorkTime}
            endWorkTime={endWorkTime}
            setEndWorkTime={setEndWorkTime}
            handleSaveAgenda={handleSaveAgenda}
            toggles={toggles}
            setToggles={setToggles}
            handleSaveNotificaciones={handleSaveNotificaciones}
          />
        </div>
      )}

      {isMobile && (
        <ContentArea
          section={section}
          saving={saving}
          uploadingLogo={uploadingLogo}
          tenantName={tenantName}
          setTenantName={setTenantName}
          logoUrl={logoUrl}
          logoInitials={logoInitials}
          fileInputRef={fileInputRef}
          handleLogoChange={handleLogoChange}
          primaryColor={primaryColor}
          setPrimaryColor={setPrimaryColor}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          address={address}
          setAddress={setAddress}
          city={city}
          setCity={setCity}
          handleSaveEmpresa={handleSaveEmpresa}
          defaultSlotDuration={defaultSlotDuration}
          setDefaultSlotDuration={setDefaultSlotDuration}
          minBookingNoticeHours={minBookingNoticeHours}
          setMinBookingNoticeHours={setMinBookingNoticeHours}
          cancellationHoursNotice={cancellationHoursNotice}
          setCancellationHoursNotice={setCancellationHoursNotice}
          startWorkTime={startWorkTime}
          setStartWorkTime={setStartWorkTime}
          endWorkTime={endWorkTime}
          setEndWorkTime={setEndWorkTime}
          handleSaveAgenda={handleSaveAgenda}
          toggles={toggles}
          setToggles={setToggles}
          handleSaveNotificaciones={handleSaveNotificaciones}
        />
      )}
    </div>
  );
}

function ContentArea({
  section,
  saving,
  uploadingLogo,
  tenantName,
  setTenantName,
  logoUrl,
  logoInitials,
  fileInputRef,
  handleLogoChange,
  primaryColor,
  setPrimaryColor,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  city,
  setCity,
  handleSaveEmpresa,
  defaultSlotDuration,
  setDefaultSlotDuration,
  minBookingNoticeHours,
  setMinBookingNoticeHours,
  cancellationHoursNotice,
  setCancellationHoursNotice,
  startWorkTime,
  setStartWorkTime,
  endWorkTime,
  setEndWorkTime,
  handleSaveAgenda,
  toggles,
  setToggles,
  handleSaveNotificaciones,
}: any) {
  // PESTAÑA EMPRESA
  if (section === "empresa") {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Empresa</div>
        <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 22 }}>Información oficial y branding de tu empresa.</p>

        {/* LOGO */}
        <div style={{ marginBottom: 20 }}>
          <label className="label">Logo de la Empresa</label>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            {logoUrl ? (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white flex items-center justify-center">
                <img src={logoUrl} alt={tenantName} className="w-full h-full object-contain p-1" />
              </div>
            ) : (
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 12,
                  background: primaryColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: 20,
                }}
              >
                {logoInitials}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleLogoChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              className="btn btn-outline"
              disabled={uploadingLogo}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadingLogo ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</>
              ) : (
                <><Upload size={14} /> Subir / Cambiar logo</>
              )}
            </button>
          </div>
        </div>

        {/* CAMPOS EMPRESA */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div>
            <label className="label">Nombre de la empresa</label>
            <input
              className="input"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Color principal</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="input"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{ width: 40, height: 38, padding: 2, border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }}
              />
            </div>
          </div>

          <div>
            <label className="label">Teléfono / WhatsApp</label>
            <input
              className="input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 000 0000"
            />
          </div>

          <div>
            <label className="label">Correo de contacto</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contacto@mi-negocio.com"
            />
          </div>

          <div>
            <label className="label">Dirección</label>
            <input
              className="input"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Calle Principal #123"
            />
          </div>

          <div>
            <label className="label">Ciudad</label>
            <input
              className="input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Bogotá"
            />
          </div>
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: 10, flexWrap: "wrap" }}>
          <button className="btn btn-primary" disabled={saving} onClick={handleSaveEmpresa}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar cambios"}
          </button>
        </div>
      </div>
    );
  }

  // PESTAÑA AGENDA
  if (section === "agenda") {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Agenda & Políticas</div>
        <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 22 }}>Reglas de agendamiento y políticas de cancelación para tus clientes.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          <div>
            <label className="label">Duración predeterminada</label>
            <select
              className="input"
              value={defaultSlotDuration}
              onChange={(e) => setDefaultSlotDuration(Number(e.target.value))}
            >
              {[15, 30, 45, 60, 90, 120].map((v) => (
                <option key={v} value={v}>{v} min</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Anticipación mínima para reservar</label>
            <select
              className="input"
              value={minBookingNoticeHours}
              onChange={(e) => setMinBookingNoticeHours(Number(e.target.value))}
            >
              <option value={0}>Sin anticipación</option>
              <option value={1}>1 hora antes</option>
              <option value={2}>2 horas antes</option>
              <option value={4}>4 horas antes</option>
              <option value={24}>24 horas antes</option>
            </select>
          </div>

          <div>
            <label className="label">Política de cancelación para clientes</label>
            <select
              className="input"
              value={cancellationHoursNotice}
              onChange={(e) => setCancellationHoursNotice(Number(e.target.value))}
            >
              <option value={0}>Sin restricción (Permitir cancelar siempre)</option>
              <option value={24}>Hasta 24 horas antes de la cita</option>
              <option value={48}>Hasta 48 horas antes de la cita</option>
            </select>
          </div>

          <div>
            <label className="label">Inicio de jornada</label>
            <input
              className="input"
              type="time"
              value={startWorkTime}
              onChange={(e) => setStartWorkTime(e.target.value)}
            />
          </div>

          <div>
            <label className="label">Fin de jornada</label>
            <input
              className="input"
              type="time"
              value={endWorkTime}
              onChange={(e) => setEndWorkTime(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" disabled={saving} onClick={handleSaveAgenda}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar reglas de agenda"}
          </button>
        </div>
      </div>
    );
  }

  // PESTAÑA NOTIFICACIONES
  if (section === "notificaciones") {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Notificaciones</div>
        <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 22 }}>Configura qué notificaciones enviar a tus clientes.</p>

        {[
          { key: "email", label: "Notificaciones por correo", desc: "Recordatorios y confirmaciones por email" },
          { key: "whatsapp", label: "WhatsApp Business", desc: "Mensajes de WhatsApp a través del canal del negocio" },
          { key: "recordatorio24h", label: "Recordatorio 24h antes", desc: "Recordar la cita un día antes de la atención" },
          { key: "recordatorio1h", label: "Recordatorio 1h antes", desc: "Recordar la cita una hora antes de la atención" },
          { key: "confirmacion", label: "Confirmación de cita", desc: "Notificar automáticamente cuando se crea una cita" },
          { key: "cancelacion", label: "Aviso de cancelación", desc: "Notificar cuando una cita es cancelada" },
        ].map((n) => (
          <div
            key={n.key}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 0",
              borderBottom: "1px solid #f8fafc",
              gap: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.label}</div>
              <div style={{ fontSize: 12.5, color: "#64748b", marginTop: 2 }}>{n.desc}</div>
            </div>
            <Toggle
              checked={!!toggles[n.key]}
              onChange={(v) => {
                const nextToggles = { ...toggles, [n.key]: v };
                setToggles(nextToggles);
              }}
            />
          </div>
        ))}

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" disabled={saving} onClick={() => handleSaveNotificaciones()}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : "Guardar preferencias de notificaciones"}
          </button>
        </div>
      </div>
    );
  }

  // PESTAÑA INTEGRACIONES
  if (section === "integraciones") {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Integraciones</div>
        <p style={{ color: "#64748b", fontSize: 13.5, marginBottom: 22 }}>Conecta la plataforma con otras herramientas externas.</p>
        {[
          { nombre: "Google Calendar", desc: "Sincroniza citas automáticamente", disponible: true },
          { nombre: "WhatsApp Business", desc: "Envía recordatorios por WhatsApp", disponible: false },
          { nombre: "Stripe / Pasarelas", desc: "Acepta pagos en línea", disponible: false },
          { nombre: "Zapier", desc: "Automatiza flujos de trabajo", disponible: false },
        ].map((i) => (
          <div
            key={i.nombre}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 14,
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              marginBottom: 10,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
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
  }

  // PESTAÑA USUARIOS
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
