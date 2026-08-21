'use client';

import React, { useState } from 'react';
import { X, LogIn, UserPlus, Mail, Lock, Phone, User, Eye, EyeOff } from 'lucide-react';
import { loginClientAction, registerClientAction } from '@/app/(public)/[slug]/client-auth';
import NotificationService from '@/lib/services/notification.service';

interface ClientAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenantSlug: string;
  onSuccess?: (user?: any, client?: any) => void;
  defaultTab?: 'login' | 'register';
}

export function ClientAuthModal({
  isOpen,
  onClose,
  tenantSlug,
  onSuccess,
  defaultTab = 'login',
}: ClientAuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form State Register
  const [regName, setRegName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginClientAction({
        slug: tenantSlug,
        email: loginEmail,
        password: loginPassword,
      });

      if (res.error) {
        await NotificationService.error('Error de Inicio de Sesión', res.error);
      } else {
        if (onSuccess) onSuccess(res.user, res.client);
        onClose();
      }
    } catch (err: any) {
      await NotificationService.error('Ocurrió un error', err?.message || 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerClientAction({
        slug: tenantSlug,
        name: regName,
        lastName: regLastName,
        email: regEmail,
        phone: regPhone,
        password: regPassword,
      });

      if (res.error) {
        await NotificationService.error('Error de Registro', res.error);
      } else {
        await NotificationService.success(
          '¡Cuenta Creada!',
          res.requiresEmailConfirmation
            ? 'Te hemos enviado un correo de confirmación. Por favor revisa tu bandeja de entrada.'
            : 'Tu cuenta ha sido creada exitosamente.'
        );
        if (onSuccess) onSuccess(res.user, res.client);
        onClose();
      }
    } catch (err: any) {
      await NotificationService.error('Ocurrió un error', err?.message || 'Error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[var(--surface)] border border-[var(--foreground)]/10 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--muted)] hover:text-[var(--foreground)] rounded-full hover:bg-[var(--background)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tabs */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-extrabold text-[var(--foreground)] tracking-tight">
            Portal del Cliente
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            Ingresa o crea tu cuenta para gestionar tus reservas
          </p>

          <div className="grid grid-cols-2 gap-1 p-1 mt-4 rounded-2xl bg-[var(--background)] border border-[var(--foreground)]/10">
            <button
              onClick={() => setTab('login')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${tab === 'login'
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Iniciar Sesión
            </button>

            <button
              onClick={() => setTab('register')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-xl transition-all ${tab === 'register'
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Registrarse
            </button>
          </div>
        </div>

        {/* Tab Login */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Ingresar a mi cuenta
                </>
              )}
            </button>
          </form>
        )}

        {/* Tab Register */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Nombre *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Carlos"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  placeholder="Gómez"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="carlos@correo.com"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Teléfono / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+57 300 1234567"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--foreground)] mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl bg-[var(--background)] border border-[var(--foreground)]/10 text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Crear mi cuenta
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
