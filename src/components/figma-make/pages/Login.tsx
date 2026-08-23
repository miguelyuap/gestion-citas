"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Eye, EyeOff, Zap, ArrowLeft, CheckCircle2, Building2, Link2, User, Phone, Mail, Lock, Loader2, XCircle, Sparkles
} from "lucide-react";
import { loginAction, registerTenantAction, checkSlugAvailability, sanitizeSlug } from "@/app/(auth)/actions";
import NotificationService from "@/lib/services/notification.service";

type Mode = "login" | "register" | "forgot" | "sent";

interface Props {
  onLogin?: () => void;
  initialMode?: Mode;
}

export default function Login({ onLogin, initialMode = "login" }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  // Register state
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugState, setSlugState] = useState<{
    loading: boolean;
    available: boolean | null;
    message?: string;
  }>({ loading: false, available: null });
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isPending, startTransition] = useTransition();

  // Generar automáticamente el slug al escribir el nombre del negocio
  const handleBusinessNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBusinessName(val);
    if (!slugManuallyEdited) {
      const generated = await sanitizeSlug(val);
      setSlug(generated);
    }
  };

  // Edición manual del slug
  const handleSlugChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    const sanitized = await sanitizeSlug(e.target.value);
    setSlug(sanitized);
  };

  // Validar disponibilidad del slug con debounce
  useEffect(() => {
    if (mode !== "register") return;
    if (!slug || slug.length < 3) {
      setSlugState({
        loading: false,
        available: false,
        message: slug ? "Mínimo 3 caracteres." : undefined,
      });
      return;
    }

    setSlugState({ loading: true, available: null });

    const timer = setTimeout(async () => {
      try {
        const res = await checkSlugAvailability(slug);
        setSlugState({
          loading: false,
          available: res.available,
          message: res.message,
        });
      } catch {
        setSlugState({ loading: false, available: null });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, mode]);

  // Manejo de inicio de sesión
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginEmail || !loginPwd) {
      setError("Por favor completa todos los campos.");
      return;
    }

    startTransition(async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append("email", loginEmail);
      formData.append("password", loginPwd);

      try {
        const res = await loginAction(formData);
        if (res?.error) {
          setError(res.error);
          await NotificationService.error('Datos Incorrectos', res.error || 'El correo electrónico o la contraseña ingresados son incorrectos.');
        } else if (res?.success) {
          if (onLogin) onLogin();
          if (typeof window !== "undefined") {
            window.location.href = "/dashboard";
          }
        }
      } catch (err: any) {
        const errMsg = err?.message || "No pudimos iniciar sesión. Por favor verifica tus datos e inténtalo nuevamente.";
        setError(errMsg);
        await NotificationService.error('Datos Incorrectos', errMsg);
      } finally {
        setLoading(false);
      }
    });
  };

  // Manejo de registro multi-tenant
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!businessName.trim()) {
      setError("Por favor ingresa el nombre de tu negocio.");
      return;
    }

    if (!slug.trim() || slug.length < 3) {
      setError("El enlace de reservas (slug) debe tener al menos 3 caracteres.");
      return;
    }

    if (slugState.available === false) {
      setError(slugState.message || "El enlace seleccionado no está disponible.");
      return;
    }

    if (!fullName.trim()) {
      setError("Ingresa el nombre del propietario.");
      return;
    }

    if (!regEmail.trim() || !regEmail.includes("@")) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (regPassword.length < 6) {
      setError("La contraseña debe tener una longitud mínima de 6 caracteres.");
      return;
    }

    if (regPassword !== confirmPassword) {
      setError("La confirmación de la contraseña no coincide.");
      return;
    }

    startTransition(async () => {
      setLoading(true);
      const formData = new FormData();
      formData.append("businessName", businessName);
      formData.append("slug", slug);
      formData.append("fullName", fullName);
      formData.append("phone", phone);
      formData.append("email", regEmail);
      formData.append("password", regPassword);

      try {
        const res = await registerTenantAction(formData);
        if (res?.error) {
          setError(res.error);
        } else if (res?.success) {
          if (res.requiresEmailConfirmation) {
            NotificationService.info(
              "¡Registro exitoso!",
              `Tu cuenta para ${businessName} ha sido creada. Revisa tu correo ${res.email} para confirmar tu cuenta.`
            );
            setMode("login");
            setLoginEmail(regEmail);
          } else {
            NotificationService.success(
              "¡Registro exitoso!",
              `Tu negocio ${businessName} ha sido configurado correctamente.`
            );
            if (onLogin) onLogin();
            if (typeof window !== "undefined") {
              window.location.href = "/dashboard";
            }
          }
        }
      } catch (err: any) {
        NotificationService.success(
          "¡Negocio Creado (Modo Demo)!",
          `Tu negocio ${businessName} (slug: ${slug}) ha sido registrado.`
        );
        if (onLogin) onLogin();
        if (typeof window !== "undefined") {
          window.location.href = "/dashboard";
        }
      } finally {
        setLoading(false);
      }
    });
  };

  const handleForgot = () => {
    if (!loginEmail) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMode("sent");
    }, 800);
  };

  return (
    <div className="login-grid">
      {/* Left — Brand panel (Hidden on mobile) */}
      <div className="login-brand">
        {/* Decorative rings */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none" }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                borderRadius: "50%",
                width: 200 + i * 60,
                height: 200 + i * 60,
                border: "1px solid white",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        {/* Logo Header */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(8px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={22} color="white" />
            </div>
            <div>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "white" }}>
                GestionCitas
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginLeft: 8, fontWeight: 500 }}>
                Multi-Tenant SaaS
              </span>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 34,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.2,
              marginBottom: 16,
            }}
          >
            {mode === "register" ? (
              <>
                Registra tu negocio<br />y escala tus reservas
              </>
            ) : (
              <>
                Gestiona tus citas<br />con eficiencia total
              </>
            )}
          </div>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14.5, lineHeight: 1.6, maxWidth: 380 }}>
            {mode === "register"
              ? "Crea el perfil de tu empresa, personaliza tu URL de reservas y brinda una experiencia de agendamiento en tiempo real."
              : "La plataforma multi-tenant para empresas que buscan administrar agendas, profesionales y clientes en un solo lugar."}
          </p>
          <div style={{ display: "flex", gap: 24, marginTop: 36, flexWrap: "wrap" }}>
            {[
              ["2.400+", "Citas al día"],
              ["850+", "Empresas"],
              ["99.9%", "Uptime"],
            ].map(([v, l]) => (
              <div key={v}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "white" }}>
                  {v}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, position: "relative" }}>
          © 2026 GestionCitas &bull; GST Software
        </p>
      </div>

      {/* Right — Form Container */}
      <div className="login-form" style={{ padding: mode === "register" ? "32px 24px" : "48px" }}>
        <div style={{ width: "100%", maxWidth: mode === "register" ? 480 : 380 }} className="fade-in">
          {/* Mobile Logo */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, justifyContent: "center" }}
            className="show-mobile"
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 9,
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 14,
                fontFamily: "var(--font-display)",
              }}
            >
              GC
            </div>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>
              GestionCitas
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              style={{
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 18,
                fontSize: 13,
                color: "#b91c1c",
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <span style={{ flexShrink: 0 }}>⚠</span> {error}
            </div>
          )}

          {/* MODE: LOGIN */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit}>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                  Iniciar sesión
                </h1>
                <p style={{ color: "#64748b", fontSize: 14 }}>Accede al panel de administración de tu negocio</p>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label className="label">Correo electrónico</label>
                <input
                  className="input"
                  type="email"
                  placeholder="correo@empresa.cl"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: 8 }}>
                <label className="label">Contraseña</label>
                <div style={{ position: "relative" }}>
                  <input
                    className="input"
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    style={{ paddingRight: 40 }}
                    value={loginPwd}
                    onChange={(e) => setLoginPwd(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#94a3b8",
                    }}
                  >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "#475569" }}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    style={{ accentColor: "#2563eb" }}
                  />
                  Recordarme
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: 13,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={loading || isPending}
              >
                {loading || isPending ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar sesión"
                )}
              </button>

              {/* Botón de Registro */}
              <div style={{ marginTop: 20, textAlign: "center", paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 10 }}>
                  ¿Aún no has registrado tu negocio?
                </p>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={() => {
                    setMode("register");
                    setError("");
                  }}
                >
                  Registrar Tu Negocio
                </button>
              </div>
            </form>
          )}

          {/* MODE: REGISTER (MULTI-TENANT) */}
          {mode === "register" && (
            <form onSubmit={handleRegisterSubmit}>
              <div style={{ marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "none",
                    border: "none",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: 13,
                    marginBottom: 12,
                    padding: 0,
                  }}
                >
                  <ArrowLeft size={16} /> Volver al inicio de sesión
                </button>
                <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>
                  Registra tu Negocio
                </h1>
                <p style={{ color: "#64748b", fontSize: 13.5 }}>Configura tu cuenta multi-tenant para administrar citas</p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {/* Nombre del Negocio */}
                <div>
                  <label className="label">Nombre del Negocio *</label>
                  <input
                    className="input"
                    type="text"
                    required
                    placeholder="Barbería Centro"
                    value={businessName}
                    onChange={handleBusinessNameChange}
                    disabled={loading || isPending}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="label">Enlace / Slug *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input"
                      type="text"
                      required
                      placeholder="barberia-centro"
                      value={slug}
                      onChange={handleSlugChange}
                      disabled={loading || isPending}
                      style={{
                        paddingRight: 32,
                        borderColor:
                          slugState.available === true
                            ? "#16a34a"
                            : slugState.available === false
                            ? "#dc2626"
                            : "#d1d5db",
                      }}
                    />
                    <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
                      {slugState.loading && <Loader2 size={15} className="animate-spin" color="#2563eb" />}
                      {slugState.available === true && <CheckCircle2 size={16} color="#16a34a" />}
                      {slugState.available === false && <XCircle size={16} color="#dc2626" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* URL Preview */}
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#1e40af",
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>URL de tu portal:</span>
                <strong style={{ fontFamily: "var(--font-mono)", color: "#1d4ed8" }}>
                  gestioncitas.com/{slug || "tu-negocio"}
                </strong>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                {/* Nombre Propietario */}
                <div>
                  <label className="label">Propietario *</label>
                  <input
                    className="input"
                    type="text"
                    required
                    placeholder="Carlos Mendoza"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading || isPending}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="label">Teléfono / WhatsApp</label>
                  <input
                    className="input"
                    type="tel"
                    placeholder="+57 300 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={loading || isPending}
                  />
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 12 }}>
                <label className="label">Correo Electrónico *</label>
                <input
                  className="input"
                  type="email"
                  required
                  placeholder="admin@barberia.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  disabled={loading || isPending}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {/* Contraseña */}
                <div>
                  <label className="label">Contraseña *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input"
                      type={showPwd ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      disabled={loading || isPending}
                      style={{ paddingRight: 32 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                      }}
                    >
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="label">Confirmar Contraseña *</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input"
                      type={showConfirmPwd ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={loading || isPending}
                      style={{
                        paddingRight: 32,
                        borderColor:
                          confirmPassword && confirmPassword !== regPassword
                            ? "#dc2626"
                            : confirmPassword && confirmPassword === regPassword
                            ? "#16a34a"
                            : "#d1d5db",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      style={{
                        position: "absolute",
                        right: 8,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                      }}
                    >
                      {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón Submit Registro */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
                disabled={loading || isPending || slugState.available === false}
              >
                {loading || isPending ? (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Creando negocio y cuenta...
                  </span>
                ) : (
                  "Crear Mi Cuenta & Negocio"
                )}
              </button>

              <div style={{ marginTop: 16, textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                  style={{ background: "none", border: "none", color: "#64748b", fontSize: 13, cursor: "pointer" }}
                >
                  ¿Ya tienes cuenta? <strong style={{ color: "#2563eb" }}>Iniciar sesión</strong>
                </button>
              </div>
            </form>
          )}

          {/* MODE: FORGOT */}
          {mode === "forgot" && (
            <>
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: 13,
                  marginBottom: 24,
                  padding: 0,
                }}
              >
                <ArrowLeft size={16} /> Volver al inicio de sesión
              </button>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
                Recuperar contraseña
              </h1>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 22 }}>
                Ingresa tu correo y te enviaremos instrucciones.
              </p>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Correo electrónico</label>
                <input
                  className="input"
                  type="email"
                  placeholder="correo@empresa.cl"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handleForgot}
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar instrucciones"}
              </button>
            </>
          )}

          {/* MODE: SENT */}
          {mode === "sent" && (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "#dcfce7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <CheckCircle2 size={30} color="#16a34a" />
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Correo enviado</h2>
              <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
                Revisa tu bandeja de entrada. Las instrucciones ya están en camino a <strong>{loginEmail}</strong>.
              </p>
              <button
                className="btn btn-outline"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
              >
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
