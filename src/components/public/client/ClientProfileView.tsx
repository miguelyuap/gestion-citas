'use client';

import React, { useState, useEffect } from 'react';
import {
  User, Mail, Phone, Edit3, Save, X, Camera, KeyRound, Shield,
  Bell, MessageSquare, LogOut, ChevronRight,
} from 'lucide-react';
import { updateClientProfileAction, logoutClientAction } from '@/app/(public)/[slug]/client-auth';
import NotificationService from '@/lib/services/notification.service';

interface ClientProfileViewProps {
  tenantSlug: string;
  client: any;
  onUpdateSuccess?: () => void;
}

import { useRouter } from 'next/navigation';

export function ClientProfileView({ tenantSlug, client, onUpdateSuccess }: ClientProfileViewProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const [firstName, setFirstName] = useState(client?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(client?.name?.split(' ').slice(1).join(' ') || '');
  const [phone, setPhone] = useState(client?.phone || '');
  const [email, setEmail] = useState(client?.email || '');

  const [prefs, setPrefs] = useState({
    notifications: true,
    reminders: true,
    marketing: false,
  });

  useEffect(() => {
    if (client) {
      const parts = (client.name || '').split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setPhone(client.phone || '');
      setEmail(client.email || '');
    }
  }, [client]);

  const handleSave = async () => {
    setLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();

    try {
      const res = await updateClientProfileAction({
        slug: tenantSlug,
        name: fullName,
        phone,
        email,
      });

      if (res.error) {
        NotificationService.error('Error al guardar', res.error);
      } else {
        NotificationService.success('¡Perfil Actualizado!', 'Tus datos de contacto han sido actualizados.');
        setEditing(false);
        router.refresh();
        if (onUpdateSuccess) onUpdateSuccess();
      }
    } catch (err: any) {
      NotificationService.error('Error inesperado', err?.message || 'Ocurrió un problema.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutClientAction(tenantSlug);
    router.refresh();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in font-[var(--font-sans)]">
      <h1 className="font-display text-2xl text-[var(--foreground)] mb-7">Mi perfil</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--secondary,#F0EFFE)] border-4 border-[var(--card,#ffffff)] shadow-lg flex items-center justify-center font-display text-3xl text-[var(--primary,#4F35D2)]">
            {firstName ? firstName.charAt(0).toUpperCase() : 'C'}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary,#4F35D2)] text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="font-display text-xl text-[var(--foreground)] mt-3">
          {firstName} {lastName}
        </p>
        <p className="text-sm text-[var(--muted-foreground)]">{email}</p>
      </div>

      {/* Personal info */}
      <div className="bg-[var(--card,#ffffff)] rounded-2xl border border-[var(--border,#E4E2EC)] overflow-hidden mb-4 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border,#E4E2EC)]">
          <p className="text-sm font-semibold text-[var(--foreground)]">Información personal</p>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary,#4F35D2)] hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEditing(false)}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary,#4F35D2)] hover:underline disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          )}
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1.5">
                Nombre
              </label>
              {editing ? (
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-[var(--foreground,#18181B)] bg-white border border-[var(--border,#E4E2EC)] rounded-xl focus:outline-none focus:border-[var(--primary,#4F35D2)] focus:ring-2 focus:ring-[var(--primary,#4F35D2)]/20 transition-all font-medium shadow-xs"
                />
              ) : (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-[var(--border,#E4E2EC)]/80 shadow-xs">
                  <User className="w-4 h-4 text-[var(--primary,#4F35D2)] shrink-0" />
                  <span className="text-sm font-medium text-[var(--foreground,#18181B)]">{firstName}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1.5">
                Apellido
              </label>
              {editing ? (
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm text-[var(--foreground,#18181B)] bg-white border border-[var(--border,#E4E2EC)] rounded-xl focus:outline-none focus:border-[var(--primary,#4F35D2)] focus:ring-2 focus:ring-[var(--primary,#4F35D2)]/20 transition-all font-medium shadow-xs"
                />
              ) : (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-[var(--border,#E4E2EC)]/80 shadow-xs">
                  <User className="w-4 h-4 text-[var(--primary,#4F35D2)] shrink-0" />
                  <span className="text-sm font-medium text-[var(--foreground,#18181B)]">{lastName}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1.5">
              Correo electrónico
            </label>
            {editing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-[var(--foreground,#18181B)] bg-white border border-[var(--border,#E4E2EC)] rounded-xl focus:outline-none focus:border-[var(--primary,#4F35D2)] focus:ring-2 focus:ring-[var(--primary,#4F35D2)]/20 transition-all font-medium shadow-xs"
              />
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-[var(--border,#E4E2EC)]/80 shadow-xs">
                <Mail className="w-4 h-4 text-[var(--primary,#4F35D2)] shrink-0" />
                <span className="text-sm font-medium text-[var(--foreground,#18181B)]">{email}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider block mb-1.5">
              Teléfono
            </label>
            {editing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-[var(--foreground,#18181B)] bg-white border border-[var(--border,#E4E2EC)] rounded-xl focus:outline-none focus:border-[var(--primary,#4F35D2)] focus:ring-2 focus:ring-[var(--primary,#4F35D2)]/20 transition-all font-medium shadow-xs"
              />
            ) : (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white rounded-xl border border-[var(--border,#E4E2EC)]/80 shadow-xs">
                <Phone className="w-4 h-4 text-[var(--primary,#4F35D2)] shrink-0" />
                <span className="text-sm font-medium text-[var(--foreground,#18181B)]">{phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-[var(--card,#ffffff)] rounded-2xl border border-[var(--border,#E4E2EC)] overflow-hidden mb-4 shadow-sm">
        <p className="text-sm font-semibold text-[var(--foreground)] px-5 py-4 border-b border-[var(--border,#E4E2EC)]">
          Seguridad
        </p>
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--muted,#F5F3FF)]/50 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center text-[var(--primary,#4F35D2)]">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">Cambiar contraseña</p>
              <p className="text-xs text-[var(--muted-foreground)]">Seguridad de la cuenta</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
        </button>
        <div className="border-t border-[var(--border,#E4E2EC)]" />
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--muted,#F5F3FF)]/50 transition-colors text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center text-[var(--primary,#4F35D2)]">
              <Shield className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-[var(--foreground)]">Verificación en 2 pasos</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
        </button>
      </div>

      {/* Preferences */}
      <div className="bg-[var(--card,#ffffff)] rounded-2xl border border-[var(--border,#E4E2EC)] overflow-hidden mb-4 shadow-sm">
        <p className="text-sm font-semibold text-[var(--foreground)] px-5 py-4 border-b border-[var(--border,#E4E2EC)]">
          Preferencias
        </p>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center text-[var(--primary,#4F35D2)]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Notificaciones</p>
                <p className="text-xs text-[var(--muted-foreground)]">Recibe alertas sobre tus citas</p>
              </div>
            </div>
            <button
              onClick={() => setPrefs((p) => ({ ...p, notifications: !p.notifications }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                prefs.notifications ? 'bg-[var(--primary,#4F35D2)]' : 'bg-[var(--border,#E4E2EC)]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  prefs.notifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[var(--secondary,#F0EFFE)] flex items-center justify-center text-[var(--primary,#4F35D2)]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Recordatorios de citas</p>
                <p className="text-xs text-[var(--muted-foreground)]">Avisos previas a tu cita</p>
              </div>
            </div>
            <button
              onClick={() => setPrefs((p) => ({ ...p, reminders: !p.reminders }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                prefs.reminders ? 'bg-[var(--primary,#4F35D2)]' : 'bg-[var(--border,#E4E2EC)]'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  prefs.reminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => setShowLogout(true)}
        className="w-full flex items-center justify-center gap-2 py-3 text-[var(--danger,#EF4444)] font-semibold text-sm rounded-2xl border border-[var(--danger,#EF4444)]/30 hover:bg-red-50 transition-colors mt-2"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>

      {/* Logout confirm modal */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-[var(--card,#ffffff)] rounded-2xl p-6 animate-slide-up shadow-2xl">
            <h3 className="font-display text-xl text-[var(--foreground)] mb-2">¿Cerrar sesión?</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">
              Tendrás que iniciar sesión nuevamente para gestionar tus citas.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-2.5 bg-[var(--muted,#F5F3FF)] text-[var(--foreground)] font-semibold text-sm rounded-xl hover:bg-[var(--border)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-[var(--danger,#EF4444)] text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
