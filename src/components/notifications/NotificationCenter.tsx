"use client";

import React, { useState, useTransition } from "react";
import {
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  Scissors,
  CheckCheck,
  Check,
  Sparkles,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PersistentNotification } from "@/types/database";
import {
  markNotificationAsReadAction,
  markAllNotificationsAsReadAction,
  deleteNotificationAction,
  deleteAllNotificationsAction,
} from "@/app/(dashboard)/notifications/actions";
import NotificationService from "@/lib/services/notification.service";

interface NotificationCenterProps {
  initialNotifications: PersistentNotification[];
  initialUnreadCount: number;
}

type FilterTab = "all" | "unread" | "created" | "confirmed" | "cancelled";

const CATEGORIAS_NOTIF: { id: FilterTab; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "unread", label: "No leídas" },
  { id: "created", label: "Nuevas Citas" },
  { id: "confirmed", label: "Confirmadas" },
  { id: "cancelled", label: "Canceladas" },
];

const ITEMS_PER_PAGE = 5;

export default function NotificationCenter({
  initialNotifications,
  initialUnreadCount,
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<PersistentNotification[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  const handleMarkAsRead = (id: string) => {
    startTransition(async () => {
      const res = await markNotificationAsReadAction(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        NotificationService.success("Notificación leída", "La notificación fue marcada como leída.");
      } else {
        NotificationService.error("Error", res.error || "No se pudo actualizar la notificación.");
      }
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    startTransition(async () => {
      const res = await markAllNotificationsAsReadAction();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        NotificationService.success(
          "Notificaciones leídas",
          "Todas las notificaciones se han marcado como leídas."
        );
      } else {
        NotificationService.error("Error", res.error || "No se pudieron actualizar las notificaciones.");
      }
    });
  };

  const handleDeleteNotification = async (id: string) => {
    const confirm = await NotificationService.confirm(
      "¿Eliminar notificación?",
      "Esta acción eliminará la notificación de manera permanente.",
      "Sí, eliminar",
      "Cancelar"
    );

    if (!confirm.isConfirmed) return;

    startTransition(async () => {
      const res = await deleteNotificationAction(id);
      if (res.success) {
        setNotifications((prev) => {
          const target = prev.find((n) => n.id === id);
          if (target && !target.is_read) {
            setUnreadCount((c) => Math.max(0, c - 1));
          }
          return prev.filter((n) => n.id !== id);
        });
        NotificationService.success("Notificación eliminada", "La notificación fue removida exitosamente.");
      } else {
        NotificationService.error("Error", res.error || "No se pudo eliminar la notificación.");
      }
    });
  };

  const handleDeleteAll = async () => {
    if (notifications.length === 0) return;

    const confirm = await NotificationService.confirm(
      "¿Eliminar TODAS las notificaciones?",
      "Se borrarán permanentemente todas las notificaciones registradas.",
      "Sí, borrar todas",
      "Cancelar"
    );

    if (!confirm.isConfirmed) return;

    startTransition(async () => {
      const res = await deleteAllNotificationsAction();
      if (res.success) {
        setNotifications([]);
        setUnreadCount(0);
        setCurrentPage(1);
        NotificationService.success("Historial vaciado", "Todas las notificaciones fueron eliminadas.");
      } else {
        NotificationService.error("Error", res.error || "No se pudieron borrar las notificaciones.");
      }
    });
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.is_read;
    if (activeTab === "created") return n.type === "appointment_created";
    if (activeTab === "confirmed") return n.type === "appointment_confirmed";
    if (activeTab === "cancelled") return n.type === "appointment_cancelled";
    return true;
  });

  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE);

  // Asegurar que la página actual sea válida al cambiar de pestaña o borrar elementos
  const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const displayedNotifications = filteredNotifications.slice(
    (validCurrentPage - 1) * ITEMS_PER_PAGE,
    validCurrentPage * ITEMS_PER_PAGE
  );

  const getNotificationTheme = (type: string) => {
    switch (type) {
      case "appointment_created":
        return {
          iconBg: "#eff6ff",
          iconColor: "#2563eb",
          icon: Calendar,
          badgeLabel: "Nueva Cita",
        };
      case "appointment_confirmed":
        return {
          iconBg: "#dcfce7",
          iconColor: "#16a34a",
          icon: CheckCircle2,
          badgeLabel: "Confirmada",
        };
      case "appointment_cancelled":
        return {
          iconBg: "#fee2e2",
          iconColor: "#dc2626",
          icon: XCircle,
          badgeLabel: "Cancelada",
        };
      case "appointment_completed":
        return {
          iconBg: "#f3e8ff",
          iconColor: "#9333ea",
          icon: CheckCheck,
          badgeLabel: "Completada",
        };
      default:
        return {
          iconBg: "#fef3c7",
          iconColor: "#d97706",
          icon: Clock,
          badgeLabel: "Cambio de Estado",
        };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="page-pad">
      {/* Encabezado Principal igual a Servicios / Módulos */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: 22,
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            Centro de notificaciones
            {unreadCount > 0 && (
              <span
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 12,
                }}
              >
                {unreadCount} sin leer
              </span>
            )}
          </h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
            Historial y registro de solicitudes de cita, confirmaciones y cancelaciones.
          </p>
        </div>

        {/* Acciones Superiores */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {unreadCount > 0 && (
            <button
              className="btn btn-outline btn-sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
            >
              <Check size={14} color="#2563eb" /> Marcar todas leídas
            </button>
          )}

          {notifications.length > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: "#dc2626" }}
              onClick={handleDeleteAll}
              disabled={isPending}
            >
              <Trash2 size={14} color="#dc2626" /> Eliminar historial
            </button>
          )}
        </div>
      </div>

      {/* Categorías / Filtros mediante Tabs con subrayado */}
      <div className="flex border-b border-[#e2e8f0] mb-6 overflow-x-auto gap-2">
        {CATEGORIAS_NOTIF.map((cat) => {
          const count =
            cat.id === "all"
              ? notifications.length
              : cat.id === "unread"
                ? unreadCount
                : notifications.filter((n) => {
                  if (cat.id === "created") return n.type === "appointment_created";
                  if (cat.id === "confirmed") return n.type === "appointment_confirmed";
                  if (cat.id === "cancelled") return n.type === "appointment_cancelled";
                  return true;
                }).length;

          const isActive = activeTab === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id);
                setCurrentPage(1);
              }}
              className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap -mb-px focus:outline-none ${
                isActive
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "bg-[#f1f5f9] text-[#64748b]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lista de Notificaciones en tarjetas (Card format idéntico a Servicios/Agenda) */}
      {displayedNotifications.length === 0 ? (
        <div
          className="card"
          style={{
            padding: 40,
            textAlign: "center",
            maxWidth: 500,
            margin: "40px auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={22} color="#64748b" />
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
            Sin notificaciones
          </div>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
            No tienes notificaciones registradas en esta categoría.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {displayedNotifications.map((notif) => {
            const theme = getNotificationTheme(notif.type);
            const Icon = theme.icon;
            const meta = notif.metadata || {};

            return (
              <div
                key={notif.id}
                className="card"
                style={{
                  padding: 18,
                  background: notif.is_read ? "white" : "#faf5ff",
                  borderColor: notif.is_read ? "#e2e8f0" : "#cbd5e1",
                  borderLeft: notif.is_read ? "1px solid #e2e8f0" : "4px solid #2563eb",
                  transition: "all 0.12s",
                }}
              >
                {/* Fila Superior: Icono + Título + Badge Estado */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: theme.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} color={theme.iconColor} />
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: theme.iconColor,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {theme.badgeLabel}
                        </span>
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#0f172a",
                          marginTop: 2,
                        }}
                      >
                        {notif.title}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {!notif.is_read ? (
                      <span
                        className="badge"
                        style={{
                          background: "#eff6ff",
                          color: "#2563eb",
                          border: "1px solid #bfdbfe",
                          fontWeight: 700,
                        }}
                      >
                        Sin leer
                      </span>
                    ) : (
                      <span className="badge badge-neutral">Leída</span>
                    )}

                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: 4 }}
                      onClick={() => handleDeleteNotification(notif.id)}
                      title="Eliminar notificación"
                    >
                      <Trash2 size={15} color="#dc2626" />
                    </button>
                  </div>
                </div>

                {/* Mensaje de la notificación */}
                <p
                  style={{
                    fontSize: 13,
                    color: "#334155",
                    marginBottom: 12,
                    lineHeight: 1.45,
                    fontWeight: 400,
                  }}
                >
                  {notif.message}
                </p>

                {/* Desglose estructurado para NUEVA CITA */}
                {notif.type === "appointment_created" && (meta.client_name || meta.service_name) && (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 12,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: 10,
                      fontSize: 12,
                    }}
                  >
                    {meta.client_name && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0f172a" }}>
                        <User size={14} color="#2563eb" />
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: 10.5 }}>Cliente</span>
                          <span style={{ fontWeight: 600 }}>{meta.client_name}</span>
                        </div>
                      </div>
                    )}
                    {meta.service_name && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0f172a" }}>
                        <Scissors size={14} color="#9333ea" />
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: 10.5 }}>Servicio</span>
                          <span style={{ fontWeight: 600 }}>{meta.service_name}</span>
                        </div>
                      </div>
                    )}
                    {meta.staff_name && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0f172a" }}>
                        <Sparkles size={14} color="#d97706" />
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: 10.5 }}>Profesional</span>
                          <span style={{ fontWeight: 600 }}>{meta.staff_name}</span>
                        </div>
                      </div>
                    )}
                    {meta.appointment_date && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#0f172a" }}>
                        <Calendar size={14} color="#16a34a" />
                        <div>
                          <span style={{ color: "#64748b", display: "block", fontSize: 10.5 }}>Fecha & Hora</span>
                          <span style={{ fontWeight: 600 }}>
                            {meta.appointment_date} {meta.appointment_time || ""}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Desglose estructurado para CITA CANCELADA */}
                {notif.type === "appointment_cancelled" && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      padding: "10px 14px",
                      marginBottom: 12,
                      fontSize: 12.5,
                      color: "#991b1b",
                    }}
                  >
                    {meta.cancellation_reason && (
                      <div style={{ marginBottom: 6 }}>
                        <strong style={{ color: "#dc2626" }}>Motivo de cancelación:</strong>{" "}
                        <span>"{meta.cancellation_reason}"</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: "#7f1d1d" }}>¿Puede reprogramarse?</span>
                      {meta.can_reschedule ? (
                        <span
                          className="badge badge-success"
                          style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <RefreshCw size={11} /> Sí
                        </span>
                      ) : (
                        <span className="badge badge-neutral">No</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Fila Inferior: Fecha y Acción de Lectura */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 10,
                    borderTop: "1px solid #f1f5f9",
                  }}
                >
                  <div style={{ fontSize: 11.5, color: "#64748b", fontFamily: "var(--font-mono)" }}>
                    {formatDate(notif.created_at)}
                  </div>

                  {!notif.is_read && (
                    <button
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: 11.5, padding: "4px 10px" }}
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <Check size={13} color="#2563eb" /> Marcar como leída
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Paginador de Notificaciones */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid #e2e8f0",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 13, color: "#64748b" }}>
            Mostrando {(validCurrentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
            {Math.min(validCurrentPage * ITEMS_PER_PAGE, filteredNotifications.length)} de{" "}
            {filteredNotifications.length} notificaciones
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={validCurrentPage === 1}
              onClick={() => {
                setCurrentPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#0f172a",
                padding: "4px 12px",
                background: "#f1f5f9",
                borderRadius: 6,
                border: "1px solid #e2e8f0",
              }}
            >
              Página {validCurrentPage} de {totalPages}
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              disabled={validCurrentPage === totalPages}
              onClick={() => {
                setCurrentPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              Siguiente <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
