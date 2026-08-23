"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, Building2, X, Calendar, Ban, CreditCard, UserPlus, RefreshCw, Menu, CheckCircle2, ArrowRight } from "lucide-react";
import { getBranchesAction, Branch } from "@/app/(dashboard)/branches/actions";
import { getNotificationsAction, markAllNotificationsAsReadAction, markNotificationAsReadAction } from "@/app/(dashboard)/notifications/actions";
import NotificationService from "@/lib/services/notification.service";
import { PersistentNotification } from "@/types/database";
import { useBreakpoint } from "../hooks/useBreakpoint";


const BREADCRUMBS: Record<string, string[]> = {
  dashboard: ["Dashboard"],
  agenda: ["Agenda"],
  clientes: ["Clientes"],
  profesionales: ["Profesionales"],
  servicios: ["Servicios"],
  sucursales: ["Sucursales"],
  reportes: ["Reportes"],
  usuarios: ["Usuarios y Roles"],
  configuracion: ["Configuración"],
  suscripcion: ["Suscripción"],
  ayuda: ["Ayuda"],
};

const NOTIF_ICONS: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  cita: Calendar,
  cancelacion: Ban,
  pago: CreditCard,
  cliente: UserPlus,
  suscripcion: CreditCard,
};

interface Props {
  active: string;
  sucursal: string;
  onSucursalChange: (s: string) => void;
  onMenuToggle: () => void;
  onNavigate?: (id: string) => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
}

export default function Topbar({ active, sucursal, onSucursalChange, onMenuToggle, onNavigate, userName, userEmail, userRole }: Props) {
  const [showNotifs, setShowNotifs] = useState(false);
  const [showSucursal, setShowSucursal] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifs, setNotifs] = useState<PersistentNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState("");
  const [branchesList, setBranchesList] = useState<Branch[]>([]);

  const notifsRef = useRef<HTMLDivElement>(null);
  const sucursalRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const userDisplayName = userName || "Administrador";
  const userDisplayEmail = userEmail || "admin@negocio.com";
  const userInitials = userDisplayName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AD";
  const shortUserName = userDisplayName.split(" ")[0];

  const crumbs = BREADCRUMBS[active] || [active];

  const fetchNotifs = async () => {
    const res = await getNotificationsAction();
    if (res.success && res.notifications) {
      setNotifs(res.notifications);
      setUnreadCount(res.unreadCount);
    }
  };

  useEffect(() => {
    fetchNotifs();
    getBranchesAction().then((res) => {
      if (res.branches && res.branches.length > 0) {
        setBranchesList(res.branches);
        if (!sucursal || !res.branches.some((b) => b.name === sucursal)) {
          onSucursalChange(res.branches[0].name);
        }
      } else {
        setBranchesList([]);
        if (!sucursal || sucursal === "Sucursal Centro") {
          onSucursalChange("Sucursal Principal");
        }
      }
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (sucursalRef.current && !sucursalRef.current.contains(e.target as Node)) setShowSucursal(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAllRead = async () => {
    const res = await markAllNotificationsAsReadAction();
    if (res.success) {
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      NotificationService.success("Notificaciones actualizadas", "Todas las notificaciones fueron marcadas como leídas.");
    }
  };

  const handleMarkSingleRead = async (id: string) => {
    const res = await markNotificationAsReadAction(id);
    if (res.success) {
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      NotificationService.success("Notificación leída", "Marcada como leída.");
    }
  };


  return (
    <header style={{
      height: "var(--topbar-height)",
      background: "white",
      borderBottom: "1px solid #e2e8f0",
      display: "flex",
      alignItems: "center",
      padding: isMobile ? "0 12px" : "0 20px",
      gap: isMobile ? 8 : 16,
      position: "sticky",
      top: 0,
      zIndex: 90,
    }}>
      {/* Hamburger (mobile/tablet) */}
      <button
        className="btn btn-ghost"
        style={{ padding: 6, borderRadius: 8, height: 36, width: 36, justifyContent: "center", flexShrink: 0 }}
        onClick={onMenuToggle}
      >
        <Menu size={20} />
      </button>

      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0, overflow: "hidden" }}>
        {crumbs.map((crumb, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
            {i > 0 && <span style={{ color: "#cbd5e1", fontSize: 14, flexShrink: 0 }}>/</span>}
            <span style={{
              fontFamily: "var(--font-display)",
              fontWeight: i === crumbs.length - 1 ? 700 : 500,
              fontSize: isMobile ? 15 : (i === crumbs.length - 1 ? 16 : 13),
              color: i === crumbs.length - 1 ? "#0f172a" : "#94a3b8",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>{crumb}</span>
          </span>
        ))}
      </div>

      {/* Search — desktop */}
      {!isMobile && (
        <div style={{ position: "relative", maxWidth: 240 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            className="input"
            style={{ paddingLeft: 34, width: isTablet ? 160 : 220, fontSize: 13 }}
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
              onClick={() => setSearch("")}>
              <X size={13} color="#94a3b8" />
            </button>
          )}
        </div>
      )}

      {/* Mobile search button */}
      {isMobile && (
        <button className="btn btn-ghost" style={{ padding: 6, height: 36, width: 36, justifyContent: "center", flexShrink: 0 }}
          onClick={() => setShowSearch(!showSearch)}>
          <Search size={18} />
        </button>
      )}

      {/* Selector de Sucursales Reales de la Empresa */}
      {!isMobile && (
        <div ref={sucursalRef} style={{ position: "relative" }}>
          <button
            className="btn btn-outline"
            style={{ fontSize: 12.5, padding: "6px 12px", gap: 6, height: 36, color: "#0f172a", fontWeight: 600 }}
            onClick={() => setShowSucursal(!showSucursal)}
          >
            <Building2 size={14} color="#2563eb" />
            {!isTablet && (
              <span style={{ maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {sucursal || (branchesList.length > 0 ? branchesList[0].name : "Sucursal Principal")}
              </span>
            )}
            <ChevronDown size={13} />
          </button>
          {showSucursal && (
            <div className="dropdown-menu" style={{ right: 0, top: "calc(100% + 6px)", minWidth: 180 }}>
              {branchesList.length > 0 ? (
                branchesList.map((b) => (
                  <div
                    key={b.id}
                    className="dropdown-item"
                    style={{ fontWeight: b.name === sucursal ? 700 : 500, color: "#0f172a" }}
                    onClick={() => {
                      onSucursalChange(b.name);
                      setShowSucursal(false);
                    }}
                  >
                    <Building2 size={14} color="#2563eb" />
                    {b.name}
                  </div>
                ))
              ) : (
                <div
                  className="dropdown-item"
                  style={{ fontWeight: 600, color: "#0f172a" }}
                  onClick={() => {
                    onSucursalChange("Sucursal Principal");
                    setShowSucursal(false);
                  }}
                >
                  <Building2 size={14} color="#2563eb" />
                  Sucursal Principal
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notifications */}
      <div ref={notifsRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          className="btn btn-ghost"
          style={{ position: "relative", padding: 6, borderRadius: 8, height: 36, width: 36, justifyContent: "center" }}
          onClick={() => {
            setShowNotifs(!showNotifs);
            if (!showNotifs) fetchNotifs();
          }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4,
              background: "#dc2626", color: "white",
              width: 16, height: 16, borderRadius: "50%",
              fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            }}>{unreadCount}</span>
          )}
        </button>
        {showNotifs && (
          <>
            {isMobile && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 498 }}
                onClick={() => setShowNotifs(false)}
              />
            )}
            <div
              className="dropdown-menu"
              style={isMobile ? {
                position: "fixed",
                top: "var(--topbar-height)",
                left: 12,
                right: 12,
                width: "auto",
                maxHeight: "calc(100vh - var(--topbar-height) - 24px)",
                overflowY: "auto",
                zIndex: 499,
              } : {
                right: 0,
                top: "calc(100% + 6px)",
                width: 340,
                maxHeight: "75vh",
                overflowY: "auto",
              }}
            >
              <div style={{ padding: "12px 14px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "white", zIndex: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>Notificaciones</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {unreadCount > 0 && (
                    <button style={{ fontSize: 11, color: "#2563eb", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                      onClick={handleMarkAllRead}>
                      Marcar leídas
                    </button>
                  )}
                  {isMobile && (
                    <button style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#94a3b8", display: "flex" }}
                      onClick={() => setShowNotifs(false)}>
                      <X size={16} />
                    </button>
                  )}
                </div>
              </div>

              {notifs.length === 0 ? (
                <div style={{ padding: "20px 14px", textAlign: "center", color: "#94a3b8", fontSize: 12 }}>
                  Sin notificaciones recientes
                </div>
              ) : (
                notifs.slice(0, 10).map((n) => {
                  const isCancel = n.type === 'appointment_cancelled';
                  const isConfirmed = n.type === 'appointment_confirmed';
                  const Icon = isCancel ? Ban : isConfirmed ? CheckCircle2 : Calendar;
                  const formattedTime = new Date(n.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });

                  return (
                    <div
                      key={n.id}
                      className="dropdown-item"
                      style={{
                        padding: "12px 14px",
                        background: n.is_read ? "transparent" : "#f8fafc",
                        gap: 10,
                        alignItems: "flex-start",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (!n.is_read) handleMarkSingleRead(n.id);
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0, marginTop: 1,
                        background: isCancel ? "#fee2e2" : isConfirmed ? "#dcfce7" : "#eff6ff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <Icon size={15} color={isCancel ? "#dc2626" : isConfirmed ? "#16a34a" : "#2563eb"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: n.is_read ? 500 : 700, color: "#0f172a" }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: 11.5, color: "#475569", marginTop: 2, lineHeight: 1.35 }}>
                          {n.message}
                        </div>
                        <div style={{ fontSize: 10.5, color: "#94a3b8", marginTop: 4 }}>
                          {formattedTime}
                        </div>
                      </div>
                      {!n.is_read && (
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb", marginTop: 6, flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })
              )}

              <div style={{
                padding: "10px 14px",
                borderTop: "1px solid #f1f5f9",
                textAlign: "center",
                position: "sticky",
                bottom: 0,
                background: "#fafafa",
              }}>
                <button
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#2563eb",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onClick={() => {
                    setShowNotifs(false);
                    if (onNavigate) {
                      onNavigate("notifications");
                    } else {
                      window.location.href = "/notifications";
                    }
                  }}
                >
                  Ver Centro de Notificaciones <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>


      {/* User avatar */}
      <div ref={userRef} style={{ position: "relative", flexShrink: 0 }}>
        <button
          className="btn btn-ghost"
          style={{ padding: "4px 6px", borderRadius: 8, gap: 6, height: 36 }}
          onClick={() => setShowUser(!showUser)}
        >
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 700, fontSize: 11,
          }}>{userInitials}</div>
          {!isMobile && (
            <>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{shortUserName}</span>
              <ChevronDown size={13} color="#94a3b8" />
            </>
          )}
        </button>
        {showUser && (
          <div className="dropdown-menu" style={{ right: 0, top: "calc(100% + 6px)" }}>
            <div style={{ padding: "10px 14px 8px", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{userDisplayName}</div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{userDisplayEmail}</div>
            </div>
            <div className="dropdown-item" style={{ color: "#0f172a" }} onClick={() => { setShowUser(false); onNavigate?.("configuracion"); }}><RefreshCw size={14} /> Mi perfil</div>
            <div className="dropdown-item" style={{ color: "#0f172a" }} onClick={() => { setShowUser(false); onNavigate?.("suscripcion"); }}><CreditCard size={14} /> Suscripción</div>
          </div>
        )}
      </div>

      {/* Mobile search overlay */}
      {isMobile && showSearch && (
        <div style={{
          position: "fixed", top: "var(--topbar-height)", left: 0, right: 0,
          background: "white", borderBottom: "1px solid #e2e8f0",
          padding: "12px 14px", zIndex: 95,
          animation: "fadeIn 0.12s ease",
        }}>
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              className="input"
              style={{ paddingLeft: 34, paddingRight: 36 }}
              placeholder="Buscar citas, clientes, servicios..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
            <button onClick={() => setShowSearch(false)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
              <X size={15} color="#94a3b8" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
