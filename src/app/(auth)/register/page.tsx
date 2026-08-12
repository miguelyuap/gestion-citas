'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { registerTenantAction } from '../actions';
import { Building2, User, Mail, Lock, Phone, Link2, Sparkles, ArrowRight, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [businessName, setBusinessName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Actualizar el slug sugerido dinámicamente según el nombre del negocio
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBusinessName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(generatedSlug);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await registerTenantAction(formData);
      if (res?.error) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      {/* Glow ambient background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />

      <div className="relative z-10 w-full max-w-xl bg-slate-900/80 border border-slate-800 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Registra tu Negocio en Gestión Citas
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Comienza tu Prueba Gratis</h1>
          <p className="text-slate-400 text-sm">
            Configura tu catálogo de servicios y empieza a recibir citas online en minutos.
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
                placeholder="ej: Barbería Elite"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* URL Personalizada (Slug) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-indigo-400" /> Enlace de Reservas *
              </label>
              <input
                type="text"
                name="slug"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="barberia-elite"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* URL Preview */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
            <span>Tu URL pública será:</span>
            <span className="font-mono text-indigo-400 font-semibold truncate ml-2">
              gestioncitas.com/{slug || 'tu-negocio'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Nombre Completo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Nombre del Propietario *
              </label>
              <input
                type="text"
                name="fullName"
                required
                placeholder="Carlos Mendoza"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> Teléfono / WhatsApp
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+57 300 123 4567"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
              placeholder="admin@barberia.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/70 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" /> Contraseña *
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
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
                Crear Mi Cuenta & Negocio <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-slate-400">
          ¿Ya tienes una cuenta para tu negocio?{' '}
          <Link href="/login" className="text-indigo-400 hover:underline font-semibold">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
