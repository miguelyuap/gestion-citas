"use client";

import { useState } from "react";
import {
  LayoutDashboard, Calendar, Users, UserCheck, Scissors,
  Building2, BarChart3, Settings, HelpCircle, CreditCard,
  LogOut, ChevronLeft, ChevronRight, Zap, X, Clock, Palette, Bell,
} from "lucide-react";
import { useBreakpoint } from "../hooks/useBreakpoint";

const NAV_MAIN = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "agenda", label: "Agenda", icon: Calendar },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "horarios", label: "Horarios", icon: Clock },
  { id: "clientes", label: "Clientes", icon: Users },
  { id: "profesionales", label: "Profesionales", icon: UserCheck },
  { id: "servicios", label: "Servicios", icon: Scissors },
  { id: "sucursales", label: "Sucursales", icon: Building2 },
];


const NAV_ADMIN = [
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "apariencia", label: "Sitio y Apariencia", icon: Palette },
  { id: "usuarios", label: "Usuarios y Roles", icon: Users },
  { id: "configuracion", label: "Configuración", icon: Settings },
];

interface Props {
  active: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  tenantName?: string;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  logoUrl?: string | null;
}

export default function Sidebar({ active, onNavigate, collapsed, onToggle, onLogout, mobileOpen, onMobileClose, tenantName = "Mi Negocio", userName, userEmail, userRole, logoUrl }: Props) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const bp = useBreakpoint();

  const logoInitials = (tenantName || "MN")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const isMobile = bp === "mobile";

  const userDisplayName = userName || "Administrador";
  const userDisplayRole = userRole || "Administrador";
  const userInitials = userDisplayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AD";

  const effectiveCollapsed = isMobile ? false : collapsed;

  const handleNavigate = (id: string) => {
    onNavigate(id);
    if (isMobile) onMobileClose();
  };

  const NavItem = ({ item }: { item: typeof NAV_MAIN[0] }) => {
    const Icon = item.icon;
    const isActive = active === item.id;
    return (
      <div
        style={{ position: "relative" }}
        onMouseEnter={() => effectiveCollapsed && setHoveredItem(item.id)}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div
          className={`nav-item${isActive ? " active" : ""}`}
          style={{
            justifyContent: effectiveCollapsed ? "center" : "flex-start",
            padding: effectiveCollapsed ? "8px" : "8px 12px",
          }}
          onClick={() => handleNavigate(item.id)}
        >
          <Icon size={18} />
          {!effectiveCollapsed && <span>{item.label}</span>}
        </div>
        {effectiveCollapsed && hoveredItem === item.id && (
          <div className="tooltip">{item.label}</div>
        )}
      </div>
    );
  };

  const sidebarStyle: React.CSSProperties = isMobile ? {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "var(--sidebar-width)",
    zIndex: 200,
    transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.25s ease",
    background: "white",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxShadow: mobileOpen ? "4px 0 24px rgba(0,0,0,0.12)" : "none",
  } : {
    width: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
    minWidth: collapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
    height: "100vh",
    background: "white",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    zIndex: 100,
    overflow: "hidden",
    transition: "width 0.2s ease",
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)",
            zIndex: 199, animation: "fadeIn 0.15s ease",
          }}
          onClick={onMobileClose}
        />
      )}

      <aside style={sidebarStyle}>
        {/* Logo row */}
        <div style={{
          padding: effectiveCollapsed ? "18px 0" : "18px 16px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: effectiveCollapsed ? "center" : "space-between",
          gap: 10,
          minHeight: "var(--topbar-height)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-display)",
              }}>{logoInitials}</div>
            )}
            {!effectiveCollapsed && (
              <div style={{ overflow: "hidden" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "#0f172a", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {tenantName}
                </div>
              </div>
            )}
          </div>
          {isMobile ? (
            <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 6, marginLeft: "auto" }} onClick={onMobileClose}>
              <X size={18} />
            </button>
          ) : !collapsed && (
            <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 6 }} onClick={onToggle}>
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Collapse toggle when collapsed (desktop only) */}
        {!isMobile && collapsed && (
          <button className="btn btn-ghost" style={{ margin: "4px auto", padding: 4, borderRadius: 6 }} onClick={onToggle}>
            <ChevronRight size={16} />
          </button>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto", overflowX: "hidden" }}>
          {!effectiveCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 4px 8px", marginTop: 4 }}>
              Principal
            </div>
          )}
          {effectiveCollapsed && <div style={{ height: 10 }} />}
          {NAV_MAIN.map(item => <NavItem key={item.id} item={item} />)}

          <div style={{ height: 1, background: "#f1f5f9", margin: "12px 0" }} />
          {!effectiveCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 4px 8px" }}>
              Administración
            </div>
          )}
          {NAV_ADMIN.map(item => <NavItem key={item.id} item={item} />)}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "10px 10px" }}>
          {[
            { id: "suscripcion", label: "Suscripción", icon: CreditCard },
            { id: "ayuda", label: "Ayuda", icon: HelpCircle },
          ].map(item => (
            <div
              key={item.id}
              className={`nav-item${active === item.id ? " active" : ""}`}
              style={{ justifyContent: effectiveCollapsed ? "center" : "flex-start", padding: effectiveCollapsed ? "8px" : "8px 12px" }}
              onClick={() => handleNavigate(item.id)}
            >
              <item.icon size={18} />
              {!effectiveCollapsed && <span>{item.label}</span>}
            </div>
          ))}

          <div style={{ height: 1, background: "#f1f5f9", margin: "8px 0" }} />

          {/* User row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderRadius: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 12,
            }}>{userInitials}</div>
            {!effectiveCollapsed && (
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 600, fontSize: 12.5, color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userDisplayName}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{userDisplayRole}</div>
              </div>
            )}
            {!effectiveCollapsed && (
              <button className="btn btn-ghost" style={{ padding: 4, borderRadius: 6, color: "#94a3b8" }} onClick={onLogout}>
                <LogOut size={15} />
              </button>
            )}
          </div>
          {effectiveCollapsed && (
            <div className="nav-item" style={{ justifyContent: "center", padding: "8px", color: "#94a3b8" }} onClick={onLogout}>
              <LogOut size={18} />
            </div>
          )}
        </div>

        {/* Plan badge (hidden when collapsed) */}
        {!effectiveCollapsed && (
          <div style={{ padding: "0 10px 12px" }}>
            <div style={{
              background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
              border: "1px solid #bfdbfe", borderRadius: 8, padding: "8px 12px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <Zap size={14} color="#2563eb" />
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1d4ed8" }}>Plan Profesional</div>
                <div style={{ fontSize: 10.5, color: "#3b82f6" }}>Vence en 23 días</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
