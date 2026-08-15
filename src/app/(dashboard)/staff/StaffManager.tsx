'use client';

import React, { useState, useTransition } from 'react';
import { Staff } from '@/types/database';
import { createStaffAction, deleteStaffAction } from './actions';
import { Plus, Users, User, Mail, Phone, Trash2, X, AlertCircle } from 'lucide-react';

interface StaffManagerProps {
  initialStaff: Staff[];
}

export function StaffManager({ initialStaff }: StaffManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [isPending, startTransition] = useTransition();

  const colorPresets = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];

  const handleCreateStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('color', selectedColor);

    startTransition(async () => {
      const res = await createStaffAction(formData);
      if (res?.error) {
        setError(res.error);
      } else {
        setIsModalOpen(false);
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a "${name}" del equipo?`)) return;
    startTransition(async () => {
      await deleteStaffAction(id);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Gestión de Colaboradores
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Equipo / Especialistas</h1>
          <p className="text-slate-400 text-sm mt-1">
            Administra a los profesionales de tu equipo a quienes los clientes asignarán sus citas.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Agregar Especialista
        </button>
      </div>

      {/* Grid de Personal */}
      {initialStaff.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Users className="w-10 h-10 text-indigo-400 mx-auto opacity-70" />
          <h3 className="font-bold text-lg text-white">No tienes miembros de equipo registrados</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Registra a los miembros de tu equipo o a ti mismo como especialista para que tus clientes puedan seleccionarlos en el agendador.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Agregar Primer Especialista
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialStaff.map((member) => (
            <div
              key={member.id}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-lg flex-shrink-0"
                  style={{ backgroundColor: member.color || '#6366f1' }}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">{member.name}</h3>
                  {member.email && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-500" /> {member.email}
                    </p>
                  )}
                  {member.phone && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-500" /> {member.phone}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleDelete(member.id, member.name)}
                className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition flex-shrink-0"
                title="Eliminar del equipo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Agregar Especialista */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" /> Agregar Nuevo Especialista
              </h2>
              <p className="text-xs text-slate-400 mt-1">Registra un miembro de tu equipo de trabajo.</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre Completo *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="ej: Sofía Ramírez"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="sofia@negocio.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+57 300 987 6543"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Color distintivo en el calendario */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Color Distintivo</label>
                <div className="flex items-center gap-2 pt-1">
                  {colorPresets.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full transition transform active:scale-95 ${
                        selectedColor === color ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : 'Guardar Especialista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
