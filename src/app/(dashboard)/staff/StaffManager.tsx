'use client';

import React, { useState, useTransition } from 'react';
import Swal from 'sweetalert2';
import { Staff } from '@/types/database';
import { createStaffAction, updateStaffAction, deleteStaffAction } from './actions';
import { Plus, Users, User, Mail, Phone, Trash2, Pencil, X, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';

interface StaffManagerProps {
  initialStaff: Staff[];
}

export function StaffManager({ initialStaff }: StaffManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const colorPresets = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];

  const handleOpenAddModal = () => {
    setEditingStaff(null);
    setSelectedColor('#6366f1');
    setAvatarPreview(null);
    setRemoveAvatar(false);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: Staff) => {
    setEditingStaff(member);
    setSelectedColor(member.color || '#6366f1');
    setAvatarPreview(member.avatar_url || null);
    setRemoveAvatar(false);
    setError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRemoveAvatar(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setRemoveAvatar(true);
  };

  const handleSubmitStaff = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set('color', selectedColor);
    formData.set('remove_avatar', removeAvatar ? 'true' : 'false');

    if (editingStaff) {
      formData.set('id', editingStaff.id);
    }

    startTransition(async () => {
      const res = editingStaff
        ? await updateStaffAction(formData)
        : await createStaffAction(formData);

      if (res?.error) {
        setError(res.error);
        Swal.fire({
          icon: 'error',
          title: editingStaff ? 'Error al actualizar especialista' : 'Error al guardar especialista',
          text: res.error,
          confirmButtonColor: '#4f46e5',
          background: '#0f172a',
          color: '#ffffff',
        });
      } else {
        setIsModalOpen(false);
        setEditingStaff(null);
        setAvatarPreview(null);
        setRemoveAvatar(false);
        Swal.fire({
          icon: 'success',
          title: editingStaff ? '¡Especialista Actualizado!' : '¡Especialista Guardado!',
          text: editingStaff
            ? 'Los datos del especialista fueron actualizados correctamente.'
            : 'El especialista ha sido registrado correctamente en tu equipo.',
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
      title: '¿Eliminar Especialista?',
      text: `¿Estás seguro de eliminar a "${name}" de tu equipo?`,
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
          const res = await deleteStaffAction(id);
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
              title: 'Especialista Eliminado',
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
          onClick={handleOpenAddModal}
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
            onClick={handleOpenAddModal}
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
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="w-12 h-12 rounded-full object-cover shadow-lg border-2 border-slate-700 flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg text-lg flex-shrink-0"
                    style={{ backgroundColor: member.color || '#6366f1' }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="space-y-1 truncate min-w-0">
                  <h3 className="font-bold text-base text-white truncate">{member.name}</h3>
                  {member.email && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-500 flex-shrink-0" /> <span className="truncate">{member.email}</span>
                    </p>
                  )}
                  {member.phone && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                      <Phone className="w-3 h-3 text-slate-500 flex-shrink-0" /> <span className="truncate">{member.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleOpenEditModal(member)}
                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                  title="Editar datos"
                >
                  <Pencil className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(member.id, member.name)}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Eliminar del equipo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Agregar/Editar Especialista */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingStaff(null);
                setAvatarPreview(null);
                setRemoveAvatar(false);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" />
                {editingStaff ? 'Editar Especialista' : 'Agregar Nuevo Especialista'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {editingStaff
                  ? 'Modifica los datos del profesional de tu equipo.'
                  : 'Registra un miembro de tu equipo de trabajo.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmitStaff} className="space-y-4">
              {/* Carga y eliminación de Fotografía de Perfil */}
              <div className="space-y-2 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-indigo-400" /> Imagen de Perfil / Foto (Opcional)
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Quitar Foto
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Vista previa"
                      className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500 shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-white shadow-md text-xl flex-shrink-0 border-2 border-slate-700"
                      style={{ backgroundColor: selectedColor }}
                    >
                      {editingStaff ? editingStaff.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}

                  <div className="flex-1 space-y-2">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition border border-slate-700">
                      <Upload className="w-3.5 h-3.5" /> {avatarPreview ? 'Cambiar Imagen' : 'Subir Imagen'}
                      <input
                        type="file"
                        name="avatar"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-500">PNG, JPG o WEBP. Máx 5MB.</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <input
                    type="url"
                    name="avatar_url"
                    value={removeAvatar ? '' : (editingStaff?.avatar_url || '')}
                    onChange={(e) => {
                      if (e.target.value) {
                        setRemoveAvatar(false);
                        setAvatarPreview(e.target.value);
                      }
                    }}
                    placeholder="o pega una URL de imagen directamente..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nombre Completo *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={editingStaff?.name || ''}
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
                    defaultValue={editingStaff?.email || ''}
                    placeholder="sofia@negocio.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Teléfono / WhatsApp</label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={editingStaff?.phone || ''}
                    placeholder="+57 300 987 6543"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Color distintivo en el calendario */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Color Distintivo en Calendario</label>
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
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingStaff(null);
                    setAvatarPreview(null);
                    setRemoveAvatar(false);
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
                  {isPending ? 'Guardando...' : editingStaff ? 'Actualizar Especialista' : 'Guardar Especialista'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
