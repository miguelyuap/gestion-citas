"use client";

import { useState } from "react";
import { Check, Zap, X, CreditCard, Shield, ChevronRight } from "lucide-react";
import { useBreakpoint } from "../hooks/useBreakpoint";

const PLANES = [
  {
    id: "starter", nombre: "Starter", precio: { mensual: 19900, anual: 14900 },
    usuarios: 2, sucursales: 1,
    features: ["Agenda básica", "Hasta 100 citas/mes", "2 profesionales", "Soporte por email"],
  },
  {
    id: "profesional", nombre: "Profesional", precio: { mensual: 39900, anual: 29900 },
    usuarios: 10, sucursales: 3, popular: true,
    features: ["Agenda avanzada", "Citas ilimitadas", "10 profesionales", "3 sucursales", "Reportes", "Notificaciones", "Soporte prioritario"],
  },
  {
    id: "enterprise", nombre: "Enterprise", precio: { mensual: 79900, anual: 59900 },
    usuarios: -1, sucursales: -1,
    features: ["Todo en Profesional", "Usuarios ilimitados", "Sucursales ilimitadas", "API access", "Integraciones", "Soporte 24/7", "Gerente de cuenta"],
  },
];

const BILLING = ["Mensual", "Trimestral", "Semestral", "Anual"];

interface SuscripcionProps {
  userName?: string;
  userEmail?: string;
}

export default function Suscripcion({ userName, userEmail }: SuscripcionProps) {
  const [billing,       setBilling]       = useState("Mensual");
  const [showCheckout,  setShowCheckout]  = useState<typeof PLANES[0] | null>(null);
  const [checkoutStep,  setCheckoutStep]  = useState<"form"|"processing"|"success">("form");
  const bp       = useBreakpoint();
  const isMobile = bp === "mobile";

  const getPrecio = (plan: typeof PLANES[0]) => {
    const base = billing === "Anual" ? plan.precio.anual : plan.precio.mensual;
    const mult = billing === "Trimestral" ? 3 : billing === "Semestral" ? 6 : billing === "Anual" ? 12 : 1;
    return base * mult;
  };

  const handlePay = () => {
    setCheckoutStep("processing");
    setTimeout(() => setCheckoutStep("success"), 2000);
  };

  return (
    <div className="page-pad fade-in">
      {/* Current plan */}
      <div className="grid-2col" style={{ marginBottom: 32 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Plan actual</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700 }}>Plan Profesional</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#2563eb", fontWeight: 600, marginTop: 4 }}>$39.900 / mes</div>
            </div>
            <span className="badge badge-success">Activa</span>
          </div>
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f1f5f9", display: "flex", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Renovación</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>10 sep 2025</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>Pago</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                <CreditCard size={13} /> Visa ****4242
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderRadius: 10, padding: 20,
          background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          border: "1px solid #fbbf24",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <Zap size={18} color="#d97706" />
            <span style={{ fontWeight: 700, fontSize: 14, color: "#92400e" }}>Vence en 23 días</span>
          </div>
          <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.5, marginBottom: 14 }}>
            Renueva antes del 10 de septiembre para mantener acceso ininterrumpido.
          </p>
          <button className="btn" style={{ background: "#d97706", color: "white" }}>
            Renovar <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Plans */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Elige tu plan</h3>
        <p style={{ color: "#64748b", fontSize: 14 }}>Sin permanencia. Cancela cuando quieras.</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 3, background: "#f8fafc", padding: 3, borderRadius: 8, border: "1px solid #e2e8f0", overflowX: "auto" }}>
          {BILLING.map(b => (
            <button key={b} className={`btn btn-sm ${billing === b ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: 12, whiteSpace: "nowrap" }} onClick={() => setBilling(b)}>
              {b}
              {b === "Anual" && <span style={{ fontSize: 9.5, background: "#dcfce7", color: "#15803d", padding: "0 5px", borderRadius: 4, marginLeft: 4 }}>-25%</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="plans-grid">
        {PLANES.map(plan => (
          <div key={plan.id} style={{
            borderRadius: 12, padding: 22,
            border: plan.popular ? "2px solid #2563eb" : "1px solid #e2e8f0",
            background: plan.popular ? "linear-gradient(180deg, #eff6ff 0%, white 40%)" : "white",
            position: "relative",
          }}>
            {plan.popular && (
              <div style={{
                position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)",
                background: "#2563eb", color: "white", borderRadius: 100,
                padding: "3px 14px", fontSize: 11, fontWeight: 700,
              }}>Más popular</div>
            )}
            <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{plan.nombre}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: isMobile ? 24 : 26, fontWeight: 700, color: plan.popular ? "#2563eb" : "#0f172a" }}>
              ${getPrecio(plan).toLocaleString("es-CL")}
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
              {billing === "Mensual" ? "/ mes" : `/ ${billing.toLowerCase()}`}
            </div>
            <div style={{ fontSize: 12.5, color: "#64748b", marginBottom: 14 }}>
              <strong>{plan.usuarios === -1 ? "∞" : plan.usuarios}</strong> usuarios · <strong>{plan.sucursales === -1 ? "∞" : plan.sucursales}</strong> sucursales
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                  <Check size={13} color="#16a34a" />
                  {f}
                </div>
              ))}
            </div>
            <button
              className={`btn ${plan.id === "profesional" ? "btn-primary" : "btn-outline"}`}
              style={{ width: "100%", justifyContent: "center" }}
              onClick={() => { setShowCheckout(plan); setCheckoutStep("form"); }}>
              {plan.id === "profesional" ? "Plan actual" : "Elegir plan"}
            </button>
          </div>
        ))}
      </div>

      {/* Checkout modal */}
      {showCheckout && (
        <div className="modal-overlay" onClick={() => setShowCheckout(null)}>
          <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            {checkoutStep === "form" && (
              <>
                <div style={{ padding: "18px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>Checkout — {showCheckout.nombre}</h3>
                  <button className="btn btn-ghost" style={{ padding: 6 }} onClick={() => setShowCheckout(null)}><X size={16} /></button>
                </div>
                <div style={{ padding: 20 }}>
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "14px 16px", marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 6 }}>
                      <span>Plan {showCheckout.nombre} ({billing})</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>${getPrecio(showCheckout).toLocaleString("es-CL")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, borderTop: "1px solid #e2e8f0", marginTop: 8, paddingTop: 8 }}>
                      <span>Total</span>
                      <span style={{ fontFamily: "var(--font-mono)", color: "#2563eb" }}>${getPrecio(showCheckout).toLocaleString("es-CL")}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                      <div><label className="label">Nombre completo</label><input className="input" defaultValue={userName || "Administrador"} /></div>
                      <div><label className="label">Correo</label><input className="input" type="email" defaultValue={userEmail || "admin@negocio.com"} /></div>
                    </div>
                    <div>
                      <label className="label">Número de tarjeta</label>
                      <div style={{ position: "relative" }}>
                        <input className="input" placeholder="4242 4242 4242 4242" style={{ paddingRight: 40 }} />
                        <CreditCard size={15} color="#94a3b8" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div><label className="label">Vencimiento</label><input className="input" placeholder="MM/AA" /></div>
                      <div><label className="label">CVV</label><input className="input" type="password" placeholder="123" /></div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 12.5, color: "#64748b" }}>
                    <Shield size={13} color="#16a34a" /> Pago seguro con cifrado SSL 256-bit
                  </div>
                </div>
                <div style={{ padding: "14px 20px", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <button className="btn btn-outline" onClick={() => setShowCheckout(null)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handlePay}>Pagar ${getPrecio(showCheckout).toLocaleString("es-CL")}</button>
                </div>
              </>
            )}
            {checkoutStep === "processing" && (
              <div style={{ padding: 60, textAlign: "center" }}>
                <div style={{ width: 52, height: 52, border: "4px solid #e2e8f0", borderTopColor: "#2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 20px" }} />
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Procesando pago...</div>
                <p style={{ color: "#64748b", fontSize: 14, marginTop: 8 }}>Un momento.</p>
              </div>
            )}
            {checkoutStep === "success" && (
              <div style={{ padding: 48, textAlign: "center" }}>
                <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                  <Check size={28} color="#16a34a" />
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>¡Pago exitoso!</div>
                <p style={{ color: "#64748b", fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>
                  Tu plan <strong>{showCheckout.nombre}</strong> está activo. Recibirás una confirmación por correo.
                </p>
                <button className="btn btn-primary" onClick={() => setShowCheckout(null)}>Continuar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
