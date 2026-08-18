'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerTenantAction, checkSlugAvailability, sanitizeSlug } from '../actions';
import NotificationService from '@/lib/services/notification.service';
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  Link2,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugState, setSlugState] = useState<{
    loading: boolean;
    available: boolean | null;
    message?: string;
  }>({ loading: false, available: null });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Generar automáticamente el slug al cambiar el nombre del negocio (si no ha sido editado manualmente)
  const handleBusinessNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBusinessName(val);

    if (!slugManuallyEdited) {
      const generated = await sanitizeSlug(val);
      setSlug(generated);
    }
  };

  // Manejar edición manual del slug
  const handleSlugChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    const val = e.target.value;
    const sanitized = await sanitizeSlug(val);
    setSlug(sanitized);
  };

  // Validar disponibilidad del slug con debounce
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugState({
        loading: false,
        available: false,
        message: slug ? 'Mínimo 3 caracteres.' : undefined,
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
  }, [slug]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones de Frontend
    if (!businessName.trim()) {
      NotificationService.error('Campo requerido', 'Por favor ingresa el nombre de tu negocio.');
      return;
    }

    if (!slug.trim() || slug.length < 3) {
      NotificationService.error('Identificador inválido', 'El enlace de reservas (slug) debe tener al menos 3 caracteres.');
      return;
    }

    if (slugState.available === false) {
      NotificationService.error('Slug no disponible', slugState.message || 'El enlace seleccionado no está disponible.');
      return;
    }

    if (password.length < 6) {
      NotificationService.error('Contraseña corta', 'La contraseña debe tener una longitud mínima de 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      NotificationService.error('Contraseñas no coinciden', 'La confirmación de la contraseña no coincide.');
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await registerTenantAction(formData);

        if (res?.error) {
          await NotificationService.error('Error en el registro', res.error);
        } else if (res?.success) {
          if (res.requiresEmailConfirmation) {
            await NotificationService.info(
              '¡Registro exitoso!',
              `Tu cuenta para ${businessName} ha sido creada correctamente. Revisa la bandeja de entrada de ${res.email} para confirmar tu correo antes de iniciar sesión.`
            );
            router.push('/login');
          } else {
            await NotificationService.success(
              '¡Registro exitoso!',
              `Tu cuenta y el negocio ${businessName} han sido configurados correctamente.`
            );
            router.push('/dashboard');
            router.refresh();
          }
        }
      } catch (err: any) {
        console.error('Error en el envío del registro:', err);
        await NotificationService.error(
          'Error inesperado',
          'No pudimos completar la operación. Por favor inténtalo nuevamente.'
        );
      }
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Fondo dinámico con resplandor */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Registra tu Negocio en OmniCitas
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 font-bold text-2xl shadow-inner">
            <Building2 className="w-7 h-7 text-indigo-400" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Crea tu Cuenta de Negocio
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Configura tu SaaS Multi-Tenant y empieza a gestionar citas en tiempo real.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nombre del Negocio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Nombre del Negocio *
              </label>
              <input
                type="text"
                name="businessName"
                required
                value={businessName}
                onChange={handleBusinessNameChange}
                disabled={isPending}
                placeholder="ej: Barbería Centro"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50"
              />
            </div>

            {/* URL Personalizada (Slug) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-400" /> Enlace de Reservas (Slug) *
                </label>
                {slugState.loading && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-400" /> Verificando...
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  name="slug"
                  required
                  value={slug}
                  onChange={handleSlugChange}
                  disabled={isPending}
                  placeholder="barberia-centro"
                  className={`w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/60 border text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 text-sm disabled:opacity-50 ${
                    slugState.available === true
                      ? 'border-emerald-500/60 focus:ring-emerald-500'
                      : slugState.available === false
                      ? 'border-rose-500/60 focus:ring-rose-500'
                      : 'border-slate-700/70 focus:ring-indigo-500'
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {slugState.available === true && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  {slugState.available === false && (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vista previa de URL */}
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <span>Tu sitio de reserva online será:</span>
            <span className="font-mono text-indigo-400 font-semibold truncate bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              gestioncitas.com/<span className="text-white">{slug || 'tu-negocio'}</span>
            </span>
          </div>

          {/* Nombre Propietario & Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Nombre del Propietario *
              </label>
              <input
                type="text"
                name="fullName"
                required
                disabled={isPending}
                placeholder="Carlos Mendoza"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                name="phone"
                disabled={isPending}
                placeholder="+57 300 123 4567"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Correo Electrónico *
            </label>
            <input
              type="email"
              name="email"
              required
              disabled={isPending}
              autoComplete="email"
              placeholder="admin@barberia.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50"
            />
          </div>

          {/* Contraseña & Confirmación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isPending}
                  placeholder="••••••••"
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  disabled={isPending}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Confirmar Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isPending}
                  placeholder="••••••••"
                  className={`w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-800/60 border text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 text-sm disabled:opacity-50 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-rose-500/60 focus:ring-rose-500'
                      : confirmPassword && confirmPassword === password
                      ? 'border-emerald-500/60 focus:ring-emerald-500'
                      : 'border-slate-700/70 focus:ring-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                  disabled={isPending}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Botón de Enviar */}
          <button
            type="submit"
            disabled={isPending || slugState.available === false}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/25 transition duration-200 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creando negocio y cuenta...
              </span>
            ) : (
              <>
                Crear Mi Cuenta & Negocio <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-800/60">
          ¿Ya tienes una cuenta registrada para tu negocio?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
