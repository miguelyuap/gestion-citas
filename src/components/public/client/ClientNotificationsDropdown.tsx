'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  CheckCheck,
  Clock,
  Calendar,
  X,
  Info,
  Scissors,
  User,
  Ban,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import {
  getClientNotificationsAction,
  markClientNotificationReadAction,
  markAllClientNotificationsReadAction,
} from '@/app/(public)/[slug]/book/actions';

interface ClientNotificationsDropdownProps {
  tenantSlug: string;
}

export function ClientNotificationsDropdown({ tenantSlug }: ClientNotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getClientNotificationsAction(tenantSlug);
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling cada 30s
    return () => clearInterval(interval);
  }, [tenantSlug]);

  const updateCoords = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords);
    }
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markClientNotificationReadAction(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleNotificationClick = (item: any) => {
    if (!item.is_read) {
      handleMarkRead(item.id);
    }
    setSelectedNotification(item);
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllClientNotificationsReadAction(tenantSlug);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getItemIconDetails = (item: any) => {
    const type = item.type || '';
    const title = (item.title || '').toLowerCase();
    const msg = (item.message || '').toLowerCase();

    if (type === 'appointment_cancelled' || title.includes('cancelad') || msg.includes('cancelad')) {
      return {
        bg: '#fee2e2',
        color: '#dc2626',
        Icon: Ban,
      };
    }

    if (type === 'appointment_confirmed' || title.includes('confirmad') || msg.includes('confirmad')) {
      return {
        bg: '#dcfce7',
        color: '#16a34a',
        Icon: CheckCircle2,
      };
    }

    if (type === 'appointment_created' || title.includes('cita') || title.includes('solicitud') || title.includes('nueva')) {
      return {
        bg: '#eff6ff',
        color: '#2563eb',
        Icon: Calendar,
      };
    }

    return {
      bg: '#fef3c7',
      color: '#d97706',
      Icon: Clock,
    };
  };

  const formatItemTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      const time = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${day}/${month}/${year}, ${time}`;
    } catch {
      return isoString;
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => {
          const nextState = !isOpen;
          setIsOpen(nextState);
          if (nextState) {
            updateCoords();
            fetchNotifications();
          }
        }}
        className="relative p-2 rounded-full text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors focus:outline-none bg-white shadow-sm"
        title="Notificaciones"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-rose-600 text-[10px] sm:text-xs font-bold text-white shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover con diseño idéntico al Dashboard (Imagen 1) */}
      {mounted && isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'fixed',
            top: `${dropdownCoords.top}px`,
            right: `${dropdownCoords.right}px`,
          }}
          className="w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-[99999] overflow-hidden animate-in fade-in duration-150 text-left"
        >
          {/* Header idéntico a la Imagen 1 */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <h4 className="font-bold text-sm text-slate-900">Notificaciones</h4>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-blue-600 hover:underline transition-colors"
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* Lista de Notificaciones estilo Imagen 1 */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 bg-white">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 font-medium">Cargando notificaciones...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center space-y-1 bg-white">
                <Bell className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Sin notificaciones recientes</p>
                <p className="text-[11px] text-slate-500">Te avisaremos cuando haya novedades en tus citas.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const { bg, color, Icon } = getItemIconDetails(item);
                const formattedTime = formatItemTime(item.created_at);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 transition-colors cursor-pointer text-left flex items-start gap-3 ${
                      item.is_read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/40 hover:bg-blue-50/70'
                    }`}
                  >
                    {/* Icono circular de color estilo Imagen 1 */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: bg }}
                    >
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h5>
                        {!item.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-[11.5px] text-slate-600 mt-0.5 leading-snug line-clamp-3">
                        {item.message}
                      </p>

                      <div className="text-[10.5px] text-slate-400 mt-1 font-medium">
                        {formattedTime}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Detalle Estructurado (Montado en Portal) */}
      {mounted && selectedNotification && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 text-left">
          <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedNotification(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center flex-shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedNotification.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {new Date(selectedNotification.created_at).toLocaleDateString('es-CO', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-800">
              <p className="leading-relaxed font-medium">{selectedNotification.message}</p>

              {selectedNotification.metadata && (
                <div className="pt-3 border-t border-slate-200 space-y-1.5 text-[11.5px] text-slate-600">
                  {selectedNotification.metadata.service_name && (
                    <div className="flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                      <span>Servicio: <strong className="text-slate-900">{selectedNotification.metadata.service_name}</strong></span>
                    </div>
                  )}
                  {selectedNotification.metadata.staff_name && (
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                      <span>Especialista: <strong className="text-slate-900">{selectedNotification.metadata.staff_name}</strong></span>
                    </div>
                  )}
                  {selectedNotification.metadata.appointment_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Fecha: <strong className="text-slate-900">{selectedNotification.metadata.appointment_date}</strong> {selectedNotification.metadata.appointment_time ? `a las ${selectedNotification.metadata.appointment_time}` : ''}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
