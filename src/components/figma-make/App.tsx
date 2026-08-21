"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { signOutAction } from "@/app/(auth)/actions";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Agenda from "./pages/Agenda";
import Clientes from "./pages/Clientes";
import Profesionales from "./pages/Profesionales";
import Servicios from "./pages/Servicios";
import Sucursales from "./pages/Sucursales";
import Horarios from "./pages/Horarios";
import Apariencia from "./pages/Apariencia";
import Reportes from "./pages/Reportes";
import Usuarios from "./pages/Usuarios";
import Configuracion from "./pages/Configuracion";
import Suscripcion from "./pages/Suscripcion";
import { CheckCircle2, Info, AlertTriangle, X, MessageCircle, HelpCircle } from "lucide-react";
import { useBreakpoint } from "./hooks/useBreakpoint";

import NotificationCenter from "../notifications/NotificationCenter";
import { getNotificationsAction } from "@/app/(dashboard)/notifications/actions";
import { PersistentNotification } from "@/types/database";

type Page = "dashboard" | "agenda" | "horarios" | "clientes" | "profesionales" | "servicios" | "sucursales" |
  "reportes" | "apariencia" | "usuarios" | "configuracion" | "suscripcion" | "ayuda" | "notifications";

function Toast({ msg, type, onClose }: { msg: string; type: string; onClose: () => void }) {
  const colors: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
    success: { bg: "#dcfce7", border: "#16a34a", icon: <CheckCircle2 size={16} color="#16a34a" /> },
    info: { bg: "#dbeafe", border: "#2563eb", icon: <Info size={16} color="#2563eb" /> },
    warning: { bg: "#fef3c7", border: "#d97706", icon: <AlertTriangle size={16} color="#d97706" /> },
  };
  const c = colors[type] || colors.info;
  return (
    <div className="toast" style={{ background: c.bg, borderLeft: `3px solid ${c.border}` }}>
      {c.icon}
      <span>{msg}</span>
      <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: 8 }}>
        <X size={13} color="#94a3b8" />
      </button>
    </div>
  );
}

function DashboardNotificationsView() {
  const [notifications, setNotifications] = useState<PersistentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotificationsAction().then((res) => {
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Cargando notificaciones...</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <NotificationCenter initialNotifications={notifications} initialUnreadCount={unreadCount} />
    </div>
  );
}

function AyudaPage() {
  return (
    <div className="page-pad" style={{ maxWidth: 700 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, marginBottom: 6 }}>Centro de ayuda</h2>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28 }}>Encuentra respuestas rápidas o contáctanos directamente.</p>
      <div className="grid-2col" style={{ marginBottom: 28 }}>
        {[
          { pregunta: "¿Cómo crear una cita?", resp: "Ve a Agenda o Dashboard y haz clic en 'Crear cita'. Sigue el proceso de 2 pasos." },
          { pregunta: "¿Cómo agregar un profesional?", resp: "Ve al módulo Profesionales y haz clic en 'Nuevo profesional'. Completa el formulario." },
          { pregunta: "¿Cómo configurar horarios?", resp: "Ve a Configuración → Agenda para configurar la jornada, o edita desde cada profesional." },
          { pregunta: "¿Cómo cancelar mi suscripción?", resp: "Ve a Suscripción y selecciona 'Administrar suscripción'. También puedes contactarnos." },
        ].map(faq => (
          <div key={faq.pregunta} className="card" style={{ padding: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a", marginBottom: 8 }}>{faq.pregunta}</div>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.5 }}>{faq.resp}</p>
          </div>
        ))}
      </div>
      <div style={{
        background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
        border: "1px solid #bfdbfe", borderRadius: 12, padding: 24,
        display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
      }}>
        <div style={{ width: 50, height: 50, borderRadius: "50%", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <MessageCircle size={22} color="white" />
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>¿Necesitas ayuda personalizada?</div>
          <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.5 }}>Equipo disponible lunes a viernes, 9:00–18:00.</p>
        </div>
        <button className="btn btn-primary">Contactar soporte</button>
      </div>
    </div>
  );
}

interface AppProps {
  initialLoggedIn?: boolean;
  kpis?: {
    todayAppointments?: number | string;
    pendingAppointments?: number | string;
    clientsCount?: number | string;
    totalIncome?: string;
  };
  citasHoyData?: Array<any>;
  tenantName?: string;
  userName?: string;
  logoUrl?: string | null;
}

export default function App({ initialLoggedIn = false, kpis, citasHoyData, tenantName, userName, logoUrl }: AppProps) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(initialLoggedIn);
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sucursal, setSucursal] = useState(tenantName || "Sucursal Centro");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  // Auto-refresco dinamico en segundo plano y al volver el foco
  useEffect(() => {
    const handleFocus = () => {
      router.refresh();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [router]);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const navigate = (p: string) => {
    setPage(p as Page);
    setMobileMenuOpen(false);
    router.refresh();
  };

  const handleMenuToggle = () => {
    if (isMobile || isTablet) {
      setMobileMenuOpen(o => !o);
    } else {
      setSidebarCollapsed(c => !c);
    }
  };

  if (!loggedIn) {
    return <Login onLogin={() => { setLoggedIn(true); showToast(`¡Bienvenido a ${tenantName || "tu negocio"}!`, "success"); }} />;
  }

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard onNavigate={navigate} kpis={kpis} citasHoyData={citasHoyData} />;
      case "agenda": return <Agenda />;
      case "notifications": return <DashboardNotificationsView />;
      case "horarios": return <Horarios />;
      case "clientes": return <Clientes />;
      case "profesionales": return <Profesionales />;
      case "servicios": return <Servicios />;
      case "sucursales": return <Sucursales />;
      case "reportes": return <Reportes />;
      case "apariencia": return <Apariencia />;
      case "usuarios": return <Usuarios />;
      case "configuracion": return <Configuracion />;
      case "suscripcion": return <Suscripcion />;
      case "ayuda": return <AyudaPage />;
      default: return <Dashboard onNavigate={navigate} kpis={kpis} citasHoyData={citasHoyData} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f8fafc" }}>
      <Sidebar
        active={page}
        onNavigate={navigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
        onLogout={async () => {
          setLoggedIn(false);
          await signOutAction();
        }}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        tenantName={tenantName}
        logoUrl={logoUrl}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar
          active={page}
          sucursal={sucursal}
          onSucursalChange={setSucursal}
          onMenuToggle={handleMenuToggle}
          onNavigate={navigate}
        />
        <main style={{ flex: 1, overflowY: "auto" }}>
          {renderPage()}
        </main>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

