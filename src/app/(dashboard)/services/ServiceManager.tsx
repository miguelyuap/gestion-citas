'use client';

import React, { useState, useTransition } from 'react';
import Swal from 'sweetalert2';
import { Service } from '@/types/database';
import { createServiceAction, updateServiceAction, deleteServiceAction, toggleServiceStatusAction } from './actions';
import { Plus, Scissors, Clock, Trash2, Pencil, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

interface ServiceManagerProps {
  initialServices: Service[];
}

export function ServiceManager({ initialServices }: ServiceManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleOpenAddModal = () => {
    setEditingService(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: Service) => {
    setEditingService(service);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmitService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    if (editingService) {
      formData.set('id', editingService.id);
    }

    startTransition(async () => {
      const res = editingService
        ? await updateServiceAction(formData)
        : await createServiceAction(formData);

      if (res?.error) {
        setError(res.error);
        Swal.fire({
          icon: 'error',
          title: editingService ? 'Error al actualizar servicio' : 'Error al guardar servicio',
          text: res.error,
          confirmButtonColor: '#4f46e5',
          background: '#0f172a',
          color: '#ffffff',
        });
      } else {
        setIsModalOpen(false);
        setEditingService(null);
        Swal.fire({
          icon: 'success',
          title: editingService ? '¡Servicio Actualizado!' : '¡Servicio Guardado!',
          text: editingService
            ? 'El servicio ha sido actualizado exitosamente.'
            : 'El servicio ha sido agregado exitosamente a tu catálogo.',
          timer: 2200,
          showConfirmButton: false,
          background: '#0f172a',
          color: '#ffffff',
        });
      }
    });
  };

  const handleDelete = (id: string, name: string) => {
    Swal.fire({
      title: '¿Eliminar Servicio?',
      text: `¿Estás seguro de eliminar el servicio "${name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#0f172a',
      color: '#ffffff',
    }).then((result) => {
      if (result.isConfirmed) {
        startTransition(async () => {
          const res = await deleteServiceAction(id);
          if (res?.error) {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: res.error,
              confirmButtonColor: '#4f46e5',
              background: '#0f172a',
              color: '#ffffff',
            });
          } else {
            Swal.fire({
              icon: 'success',
              title: 'Servicio Eliminado',
              text: `"${name}" ha sido removido exitosamente.`,
              timer: 2000,
              showConfirmButton: false,
              background: '#0f172a',
              color: '#ffffff',
            });
          }
        });
      }
    });
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      await toggleServiceStatusAction(id, currentStatus);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold flex items-center gap-1.5">
            <Scissors className="w-4 h-4" /> Configuración de Catálogo
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">Catálogo de Servicios</h1>
          <p className="text-slate-400 text-sm mt-1">
            Administra los servicios que ofrece tu negocio, sus precios y la duración estimada.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/20 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Agregar Servicio
        </button>
      </div>

      {/* Grid de Servicios */}
      {initialServices.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Scissors className="w-10 h-10 text-indigo-400 mx-auto opacity-70" />
          <h3 className="font-bold text-lg text-white">No tienes servicios registrados</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Crea tu primer servicio (ej: Corte de Cabello, Consulta Médica, Cambio de Aceite) para que tus clientes puedan empezar a agendar.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Crear Primer Servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialServices.map((service) => (
            <div
              key={service.id}
              className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-white">{service.name}</h3>
                  <button
                    onClick={() => handleToggle(service.id, service.is_active)}
                    title={service.is_active ? 'Servicio Activo' : 'Servicio Inactivo'}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5 border ${
                      service.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {service.is_active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {service.is_active ? 'Activo' : 'Inactivo'}
                  </button>
                </div>
                {service.description && (
                  <p className="text-xs text-slate-400 line-clamp-2">{service.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-300 font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> {service.duration_minutes} min
                  </span>
                  {service.buffer_time_minutes > 0 && (
                    <span className="text-slate-500" title="Tiempo de limpieza/margen">
                      (+{service.buffer_time_minutes} min buffer)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-base mr-2">
                    ${Number(service.price).toLocaleString('es-CO')} <span className="text-[10px] text-slate-400">{service.currency}</span>
                  </span>

                  <button
                    onClick={() => handleOpenEditModal(service)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                    title="Editar Servicio"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(service.id, service.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                    title="Eliminar Servicio"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Crear/Editar Servicio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingService(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-indigo-400" />
                {editingService ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {editingService
                  ? 'Modifica los detalles del servicio en tu catálogo.'
                  : 'Configura los detalles del servicio para tu catálogo público.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmitService} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre del Servicio *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingService?.name || ''}
                  placeholder="ej: Corte de Cabello Premium"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Descripción (Opcional)</label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editingService?.description || ''}
                  placeholder="Breve explicación de lo que incluye el servicio..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Duración (Minutos) *</label>
                  <input
                    type="number"
                    name="durationMinutes"
                    required
                    min={5}
                    step={5}
                    defaultValue={editingService?.duration_minutes ?? 30}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Tiempo Limpieza / Buffer (Min)</label>
                  <input
                    type="number"
                    name="bufferMinutes"
                    min={0}
                    step={5}
                    defaultValue={editingService?.buffer_time_minutes ?? 0}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Precio *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="price"
                    required
                    placeholder="ej: 35.500 o 35.50"
                    defaultValue={editingService ? Number(editingService.price).toLocaleString('es-CO') : '35.500'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Moneda</label>
                  <select
                    name="currency"
                    defaultValue={editingService?.currency || 'COP'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="COP">COP ($)</option>
                    <option value="USD">USD ($)</option>
                    <option value="MXN">MXN ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingService(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  {isPending ? 'Guardando...' : editingService ? 'Actualizar Servicio' : 'Guardar Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
