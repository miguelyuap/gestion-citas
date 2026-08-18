'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '../actions';
import NotificationService from '@/lib/services/notification.service';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Detectar errores en la URL (ej: otp_expired de confirmación de correo)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));

    const error = searchParams.get('error') || hashParams.get('error');
    const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
    const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');

    if (error || errorCode) {
      let message = 'El enlace de confirmación por correo no es válido o ha expirado.';
      if (errorCode === 'otp_expired' || errorDesc?.includes('expired')) {
        message = 'El enlace de confirmación por correo ha expirado o ya fue utilizado. Por favor intenta iniciar sesión o solicita un nuevo registro.';
      } else if (errorDesc) {
        message = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
      }

      NotificationService.error('Enlace no válido o expirado', message);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const res = await loginAction(formData);

        if (res?.error) {
          await NotificationService.error('Credenciales incorrectas', res.error);
        } else if (res?.success) {
          // Redirigir al Dashboard tras autenticación exitosa
          router.push('/dashboard');
          router.refresh();
        }
      } catch (err: any) {
        console.error('Error durante el inicio de sesión:', err);
        await NotificationService.error(
          'Error inesperado',
          'No pudimos completar la operación. Por favor inténtalo nuevamente.'
        );
      }
    });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Fondo con resplandor ambiental dinámico */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/80 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Branding Header GST Software */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> GST Software &bull; OmniCitas
          </div>

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center mx-auto text-indigo-400 font-bold text-2xl shadow-inner">
            <Building2 className="w-7 h-7 text-indigo-400" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Iniciar Sesión
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Accede a tu panel de administración de agenda.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Correo Electrónico */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="tu@negocio.com"
              disabled={isPending}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm disabled:opacity-50"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isPending}
                className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={isPending}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Botón Iniciar Sesión */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/25 transition duration-200 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                Iniciando sesión...
              </span>
            ) : (
              <>
                Ingresar al Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-slate-400 border-t border-slate-800/60">
          ¿Aún no has registrado tu negocio?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold transition">
            Registrar Nuevo Negocio
          </Link>
        </div>
      </div>
    </div>
  );
}
