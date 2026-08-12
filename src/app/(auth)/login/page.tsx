'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { loginAction } from '../actions';
import { Mail, Lock, ArrowRight, AlertCircle, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      {/* Ambient Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />

      <div className="relative z-10 w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400 font-bold text-xl mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Iniciar Sesión</h1>
          <p className="text-slate-400 text-sm">
            Ingresa a tu panel de administración de Gestión Citas.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" /> Correo Electrónico
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="admin@barberia.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Contraseña
              </label>
            </div>
            <input
              type="password"
              name="password"
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-500/20 transition duration-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
          >
            {isPending ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
            ) : (
              <>
                Entrar al Dashboard <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-slate-400">
          ¿Aún no has registrado tu negocio?{' '}
          <Link href="/register" className="text-indigo-400 hover:underline font-semibold">
            Registrar Negocio
          </Link>
        </div>
      </div>
    </div>
  );
}
