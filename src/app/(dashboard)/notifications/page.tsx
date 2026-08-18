import React from 'react';
import { Bell, Clock, Construction } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <Bell className="w-4 h-4" /> Notificaciones
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Centro de Notificaciones</h1>
          <p className="text-sm text-slate-400">
            Recordatorios automáticos por WhatsApp, Email y alertas en tiempo real.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto">
          <Construction className="w-8 h-8 animate-bounce" />
        </div>
        <h2 className="text-xl font-bold text-white">Notificaciones & Alertas (Próxima Fase)</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Permitirá enviar confirmaciones de cita, recordatorios previos de 24 horas vía WhatsApp e historial de mensajes entregados.
        </p>
        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5" /> Programado para la siguiente fase
          </span>
        </div>
      </div>
    </div>
  );
}
