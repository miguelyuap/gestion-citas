'use client';

import React, { useState, useEffect } from 'react';
import {
  PRESET_PALETTES,
  DEFAULT_COMPLETE_APPEARANCE,
} from '@/lib/theme/presets';
import {
  CompleteTenantAppearance,
  TemplateType,
  ButtonStyleType,
  SectionKey,
  TenantGalleryItem,
  TenantTestimonialItem,
} from '@/types/theme';
import { PublicPageRenderer } from '@/components/public/templates/PublicPageRenderer';
import { Tenant, Service, Staff, WorkingHour } from '@/types/database';
import { NotificationService } from '@/lib/services/notification.service';
import {
  getTenantAppearanceAction,
  saveTenantAppearanceAction,
  uploadTenantAssetAction,
  addGalleryItemAction,
  deleteGalleryItemAction,
  saveTestimonialAction,
  deleteTestimonialAction,
} from './actions';
import {
  Monitor,
  Tablet,
  Smartphone,
  Check,
  Save,
  ExternalLink,
  Sparkles,
  Palette as PaletteIcon,
  Layout,
  Eye,
  Type,
  Image as ImageIcon,
  MessageCircle,
  Share2,
  ArrowUp,
  ArrowDown,
  Upload,
  Plus,
  Trash2,
  Star,
  Loader2,
  Edit,
} from 'lucide-react';

export default function AppearanceDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [appearance, setAppearance] = useState<CompleteTenantAppearance>(
    DEFAULT_COMPLETE_APPEARANCE
  );
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);

  const [deviceViewport, setDeviceViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'theme' | 'hero' | 'sections' | 'socials' | 'gallery' | 'testimonials'>('theme');

  // Modal / Form state para agregar foto a galería
  const [newGalleryCaption, setNewGalleryCaption] = useState('');

  // Modal / Form state para testimonios
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<TenantTestimonialItem>>({
    client_name: '',
    rating: 5,
    comment: '',
    client_avatar: null,
  });

  // 1. Cargar datos iniciales desde Supabase
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getTenantAppearanceAction();
        if (res.tenant) setTenant(res.tenant as Tenant);
        if (res.appearance) setAppearance(res.appearance);
        if (res.services) setServices(res.services);
        if (res.staff) setStaffList(res.staff);
        if (res.workingHours) setWorkingHours(res.workingHours);
      } catch (err: any) {
        console.error('Error cargando apariencia:', err);
        NotificationService.error('Error de Apariencia', err?.message || 'No se pudieron cargar los datos de apariencia de Supabase.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. Guardar cambios en Supabase
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await saveTenantAppearanceAction(appearance);
      if (res.success) {
        NotificationService.success('¡Apariencia Guardada!', 'Los cambios han sido guardados y publicados en tu sitio web.');
      } else {
        NotificationService.error('Error al Guardar', res.error || 'Ocurrió un fallo al guardar la configuración.');
      }
    } catch (err: any) {
      NotificationService.error('Error de Conexión', err.message || 'Error de red.');
    } finally {
      setSaving(false);
    }
  };

  // 3. Subir Logo de la Empresa
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'logo');

      const res = await uploadTenantAssetAction(formData);
      if (res.success && res.publicUrl) {
        if (tenant) {
          setTenant({ ...tenant, logo_url: res.publicUrl });
        }
        NotificationService.success('Logo Actualizado', 'El logo se ha guardado correctamente.');
      } else {
        NotificationService.error('Error de Subida', res.error || 'No se pudo subir el archivo.');
      }
    } catch (err: any) {
      NotificationService.error('Error', err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  // 4. Subir Imagen a Galería
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingGallery(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'gallery');

      const uploadRes = await uploadTenantAssetAction(formData);
      if (uploadRes.success && uploadRes.publicUrl) {
        const addRes = await addGalleryItemAction(uploadRes.publicUrl, newGalleryCaption);
        if (addRes.success && addRes.item) {
          setAppearance((prev) => ({
            ...prev,
            gallery: [...prev.gallery, addRes.item],
          }));
          setNewGalleryCaption('');
          NotificationService.success('Imagen Agregada', 'La imagen fue añadida a la galería exitosamente.');
        }
      } else {
        NotificationService.error('Error de Subida', uploadRes.error || 'Error subiendo la imagen.');
      }
    } catch (err: any) {
      NotificationService.error('Error', err.message);
    } finally {
      setUploadingGallery(false);
    }
  };

  // 5. Eliminar Imagen de Galería
  const handleDeleteGalleryItem = async (id: string) => {
    const confirm = await NotificationService.confirm(
      '¿Eliminar Imagen?',
      'Esta imagen será borrada permanentemente de la galería.',
      'Sí, eliminar',
      'Cancelar'
    );
    if (!confirm.isConfirmed) return;

    const res = await deleteGalleryItemAction(id);
    if (res.success) {
      setAppearance((prev) => ({
        ...prev,
        gallery: prev.gallery.filter((g) => g.id !== id),
      }));
      NotificationService.success('Eliminada', 'La imagen fue eliminada.');
    } else {
      NotificationService.error('Error', res.error || 'No se pudo eliminar.');
    }
  };

  // 6. Subir Avatar para Testimonio
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'testimonials');

      const res = await uploadTenantAssetAction(formData);
      if (res.success && res.publicUrl) {
        setEditingTestimonial((prev) => ({ ...prev, client_avatar: res.publicUrl }));
        NotificationService.success('Avatar Subido', 'La foto de perfil fue cargada.');
      }
    } catch (err: any) {
      NotificationService.error('Error', err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // 7. Guardar Testimonio
  const handleSaveTestimonial = async () => {
    if (!editingTestimonial.client_name || !editingTestimonial.comment) {
      NotificationService.warning('Campos incompletos', 'Por favor ingresa el nombre del cliente y el comentario.');
      return;
    }

    const res = await saveTestimonialAction({
      id: editingTestimonial.id,
      client_name: editingTestimonial.client_name,
      client_avatar: editingTestimonial.client_avatar,
      rating: editingTestimonial.rating || 5,
      comment: editingTestimonial.comment,
      display_order: appearance.testimonials.length + 1,
    });

    if (res.success && res.item) {
      setAppearance((prev) => {
        const exists = prev.testimonials.some((t) => t.id === res.item.id);
        const updatedList = exists
          ? prev.testimonials.map((t) => (t.id === res.item.id ? res.item : t))
          : [...prev.testimonials, res.item];
        return { ...prev, testimonials: updatedList };
      });
      setTestimonialModalOpen(false);
      setEditingTestimonial({ client_name: '', rating: 5, comment: '', client_avatar: null });
      NotificationService.success('Testimonio Guardado', 'El testimonio se ha guardado correctamente.');
    } else {
      NotificationService.error('Error', res.error || 'No se pudo guardar el testimonio.');
    }
  };

  // 8. Eliminar Testimonio
  const handleDeleteTestimonial = async (id: string) => {
    const confirm = await NotificationService.confirm(
      '¿Eliminar Testimonio?',
      'Este testimonio será removido de tu sitio web.',
      'Sí, eliminar',
      'Cancelar'
    );
    if (!confirm.isConfirmed) return;

    const res = await deleteTestimonialAction(id);
    if (res.success) {
      setAppearance((prev) => ({
        ...prev,
        testimonials: prev.testimonials.filter((t) => t.id !== id),
      }));
      NotificationService.success('Eliminado', 'El testimonio fue eliminado.');
    }
  };

  // Handlers para presets y plantillas
  const handlePresetSelect = (presetId: string) => {
    const found = PRESET_PALETTES.find((p) => p.id === presetId);
    if (found) {
      setAppearance((prev) => ({
        ...prev,
        theme: { ...found.theme },
      }));
    }
  };

  const handleTemplateSelect = (template: TemplateType) => {
    setAppearance((prev) => ({
      ...prev,
      settings: { ...prev.settings, template },
    }));
  };

  const handleSectionToggle = (key: SectionKey) => {
    setAppearance((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.section_key === key ? { ...sec, is_enabled: !sec.is_enabled } : sec
      ),
    }));
  };

  const handleSectionMove = (key: SectionKey, direction: 'up' | 'down') => {
    const list = [...appearance.sections].sort((a, b) => a.display_order - b.display_order);
    const index = list.findIndex((s) => s.section_key === key);
    if (index < 0) return;

    if (direction === 'up' && index > 0) {
      const temp = list[index].display_order;
      list[index].display_order = list[index - 1].display_order;
      list[index - 1].display_order = temp;
    } else if (direction === 'down' && index < list.length - 1) {
      const temp = list[index].display_order;
      list[index].display_order = list[index + 1].display_order;
      list[index + 1].display_order = temp;
    }

    setAppearance((prev) => ({ ...prev, sections: list }));
  };

  const viewportWidthClass = {
    desktop: 'w-full',
    tablet: 'max-w-[768px] mx-auto',
    mobile: 'max-w-[390px] mx-auto',
  }[deviceViewport];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold">Cargando configuración de apariencia...</p>
      </div>
    );
  }

  const demoTenant: Tenant = tenant || {
    id: 'tenant-demo',
    name: 'Mi Negocio SaaS',
    slug: 'mi-negocio',
    logo_url: null,
    email: 'contacto@minegocio.com',
    phone: '+57 300 000 0000',
    timezone: 'America/Bogota',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header Superior */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Personalización Multi-Tenant
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Apariencia & Sitio Web</h1>
          <p className="text-sm text-slate-400">
            Diseño visual, tipografía, paleta de colores, secciones, galería y testimonios de tu negocio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {tenant?.slug && (
            <a
              href={`/${tenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
            >
              <ExternalLink className="w-4 h-4" /> Ver Sitio Público
            </a>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Grid Principal de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Panel de Control de 6 Pestañas (5 cols) */}
        <div className="lg:col-span-5 space-y-6 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl">
          {/* Navegación por Pestañas */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1.5 bg-slate-950 rounded-2xl text-[11px] font-bold">
            <button
              onClick={() => setActiveTab('theme')}
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
                activeTab === 'theme'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PaletteIcon className="w-3.5 h-3.5" /> Tema
            </button>

            <button
              onClick={() => setActiveTab('hero')}
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
                activeTab === 'hero'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Type className="w-3.5 h-3.5" /> Hero/Logo
            </button>

            <button
              onClick={() => setActiveTab('sections')}
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
                activeTab === 'sections'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" /> Secciones
            </button>

            <button
              onClick={() => setActiveTab('socials')}
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
                activeTab === 'socials'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" /> Redes
            </button>

            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
                activeTab === 'gallery'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" /> Galería
            </button>

            <button
              onClick={() => setActiveTab('testimonials')}
              className={`py-2 px-1 rounded-xl flex items-center justify-center gap-1 transition ${
                activeTab === 'testimonials'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5" /> Opiniones
            </button>
          </div>

          {/* PESTAÑA 1: PLANTILLA, COLORES Y TIPOGRAFÍA */}
          {activeTab === 'theme' && (
            <div className="space-y-6 text-slate-200">
              {/* Plantilla Visual */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Plantilla del Sitio Web
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'modern', name: 'Modern', desc: 'Minimalista & Limpio' },
                    { id: 'elegant', name: 'Elegant', desc: 'Luxury & Premium' },
                    { id: 'bold', name: 'Bold', desc: 'Alto Impacto' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleTemplateSelect(t.id as TemplateType)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        appearance.settings.template === t.id
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300 ring-2 ring-indigo-500/20'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-white">{t.name}</div>
                      <div className="text-[10px] text-slate-400">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Paletas de Color Predefinidas */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Paletas Predefinidas (Presets)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_PALETTES.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className="p-2 rounded-xl border border-slate-800 bg-slate-950 hover:border-slate-700 text-left space-y-1 transition group"
                    >
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.theme.primary_color }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.theme.background_color }}
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.theme.surface_color }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white block truncate">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Controles HEX de Color */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Personalización Personalizada de Colores (HEX)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Color Principal', key: 'primary_color' },
                    { label: 'Color Secundario', key: 'secondary_color' },
                    { label: 'Fondo de Página', key: 'background_color' },
                    { label: 'Superficie (Tarjetas)', key: 'surface_color' },
                    { label: 'Texto Principal', key: 'text_color' },
                    { label: 'Texto Muted (Secundario)', key: 'muted_text_color' },
                    { label: 'Color Acento', key: 'accent_color' },
                  ].map((colorItem) => (
                    <div key={colorItem.key} className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-semibold">
                        {colorItem.label}
                      </label>
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1.5">
                        <input
                          type="color"
                          value={(appearance.theme as any)[colorItem.key]}
                          onChange={(e) =>
                            setAppearance((prev) => ({
                              ...prev,
                              theme: { ...prev.theme, [colorItem.key]: e.target.value },
                            }))
                          }
                          className="w-6 h-6 rounded-md cursor-pointer bg-transparent border-0"
                        />
                        <input
                          type="text"
                          value={(appearance.theme as any)[colorItem.key]}
                          onChange={(e) =>
                            setAppearance((prev) => ({
                              ...prev,
                              theme: { ...prev.theme, [colorItem.key]: e.target.value },
                            }))
                          }
                          className="w-full bg-transparent text-[11px] font-mono text-white focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipografía y Estilos de Botón */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tipografía Principal
                  </label>
                  <select
                    value={appearance.theme.font_family}
                    onChange={(e) =>
                      setAppearance((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, font_family: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                  >
                    <option value="Inter">Inter (Sans-Serif Moderno)</option>
                    <option value="Poppins">Poppins (Geométrica Redondeada)</option>
                    <option value="Roboto">Roboto (Clásica & Limpia)</option>
                    <option value="Montserrat">Montserrat (Urbana & Destacada)</option>
                    <option value="DM Sans">DM Sans (Elegante & Legible)</option>
                    <option value="Playfair Display">Playfair Display (Serif Luxury / Premium)</option>
                    <option value="Outfit">Outfit (Moderna & Dinámica)</option>
                    <option value="Plus Jakarta Sans">Plus Jakarta Sans (Moderna SaaS)</option>
                    <option value="Lora">Lora (Serif Editorial & Cálida)</option>
                    <option value="Oswald">Oswald (Condensada Alto Impacto)</option>
                    <option value="Raleway">Raleway (Sofisticada Delgado)</option>
                    <option value="Cinzel">Cinzel (Clásica Romana / Joyería)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech / Cyberpunk)</option>
                    <option value="Syne">Syne (Artística & Vanguardista)</option>
                    <option value="Quicksand">Quicksand (Amigable & Suave)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (Alta Costura)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Estilo de Botones
                  </label>
                  <select
                    value={appearance.theme.button_style}
                    onChange={(e) =>
                      setAppearance((prev) => ({
                        ...prev,
                        theme: { ...prev.theme, button_style: e.target.value as ButtonStyleType },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="rounded">Redondeados (12px)</option>
                    <option value="pill">Pill (Píldora Total)</option>
                    <option value="square">Suave (6px)</option>
                    <option value="sharp">Rectos (0px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: HERO, TEXTOS & LOGOTIPO */}
          {activeTab === 'hero' && (
            <div className="space-y-4 text-slate-200">
              {/* Carga de Logo */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Logotipo del Negocio
                </label>
                <div className="flex items-center gap-4">
                  {demoTenant.logo_url ? (
                    <img
                      src={demoTenant.logo_url}
                      alt="Logo Tenant"
                      className="w-14 h-14 rounded-xl object-contain bg-slate-900 p-1 border border-slate-800"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-md">
                      {demoTenant.name.charAt(0)}
                    </div>
                  )}

                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition">
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingLogo ? 'Subiendo Logo...' : 'Subir Logo en Storage'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Badge Superior (Hero)
                </label>
                <input
                  type="text"
                  value={appearance.settings.hero_badge || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, hero_badge: e.target.value },
                    }))
                  }
                  placeholder="Ej: RESERVA ONLINE 24/7"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Título Principal (Hero)
                </label>
                <input
                  type="text"
                  value={appearance.settings.hero_title}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, hero_title: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Subtítulo Explicativo (Hero)
                </label>
                <textarea
                  rows={2}
                  value={appearance.settings.hero_subtitle}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, hero_subtitle: e.target.value },
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Texto Botón CTA
                  </label>
                  <input
                    type="text"
                    value={appearance.settings.hero_cta_text}
                    onChange={(e) =>
                      setAppearance((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, hero_cta_text: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Texto CTA Secundario
                  </label>
                  <input
                    type="text"
                    value={appearance.settings.hero_secondary_cta_text || ''}
                    onChange={(e) =>
                      setAppearance((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, hero_secondary_cta_text: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  URL Imagen de Fondo / Destacada Hero
                </label>
                <input
                  type="text"
                  value={appearance.settings.hero_image_url || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, hero_image_url: e.target.value },
                    }))
                  }
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Título "Sobre Nosotros"
                  </label>
                  <input
                    type="text"
                    value={appearance.settings.about_title || ''}
                    onChange={(e) =>
                      setAppearance((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, about_title: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Descripción "Sobre Nosotros"
                  </label>
                  <textarea
                    rows={3}
                    value={appearance.settings.about_text || ''}
                    onChange={(e) =>
                      setAppearance((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, about_text: e.target.value },
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    URL Imagen "Sobre Nosotros"
                  </label>
                  <input
                    type="text"
                    value={appearance.settings.about_image_url || ''}
                    onChange={(e) =>
                      setAppearance((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, about_image_url: e.target.value },
                      }))
                    }
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: SECCIONES Y ORDEN */}
          {activeTab === 'sections' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Visibilidad y Ordenamiento de Secciones
              </label>

              <div className="space-y-2">
                {[...appearance.sections]
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((sec) => (
                    <div
                      key={sec.section_key}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                        sec.is_enabled
                          ? 'bg-slate-950 border-slate-800 text-white'
                          : 'bg-slate-950/40 border-slate-900 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={sec.is_enabled}
                          onChange={() => handleSectionToggle(sec.section_key)}
                          className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer"
                        />
                        <span className="font-bold text-xs capitalize">
                          {sec.section_key.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSectionMove(sec.section_key, 'up')}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="Mover Arriba"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSectionMove(sec.section_key, 'down')}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
                          title="Mover Abajo"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* PESTAÑA 4: REDES SOCIALES */}
          {activeTab === 'socials' && (
            <div className="space-y-4 text-slate-200">
              <p className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                Los canales y redes configurados aquí se mostrarán automáticamente en la sección de Contacto y en el pie de página del dashboard de tus clientes.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-emerald-400" /> WhatsApp Directo
                </label>
                <input
                  type="text"
                  value={appearance.settings.whatsapp_number || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, whatsapp_number: e.target.value },
                    }))
                  }
                  placeholder="+573000000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Instagram (URL)
                </label>
                <input
                  type="text"
                  value={appearance.socials?.instagram || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      socials: { ...prev.socials, instagram: e.target.value },
                    }))
                  }
                  placeholder="https://instagram.com/mi-negocio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Facebook (URL)
                </label>
                <input
                  type="text"
                  value={appearance.socials?.facebook || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      socials: { ...prev.socials, facebook: e.target.value },
                    }))
                  }
                  placeholder="https://facebook.com/mi-negocio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  TikTok (URL)
                </label>
                <input
                  type="text"
                  value={appearance.socials?.tiktok || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      socials: { ...prev.socials, tiktok: e.target.value },
                    }))
                  }
                  placeholder="https://tiktok.com/@mi-negocio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Twitter / X (URL)
                </label>
                <input
                  type="text"
                  value={appearance.socials?.twitter || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      socials: { ...prev.socials, twitter: e.target.value },
                    }))
                  }
                  placeholder="https://x.com/mi-negocio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  YouTube (URL)
                </label>
                <input
                  type="text"
                  value={appearance.socials?.youtube || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      socials: { ...prev.socials, youtube: e.target.value },
                    }))
                  }
                  placeholder="https://youtube.com/@mi-canal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  LinkedIn (URL)
                </label>
                <input
                  type="text"
                  value={appearance.socials?.linkedin || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      socials: { ...prev.socials, linkedin: e.target.value },
                    }))
                  }
                  placeholder="https://linkedin.com/company/mi-negocio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Sitio Web / URL Oficial
                </label>
                <input
                  type="text"
                  value={appearance.socials?.website || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      socials: { ...prev.socials, website: e.target.value },
                    }))
                  }
                  placeholder="https://mi-negocio.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Telegram (URL)
                </label>
                <input
                  type="text"
                  value={appearance.socials?.telegram || ''}
                  onChange={(e) =>
                    setAppearance((prev) => ({
                      ...prev,
                      socials: { ...prev.socials, telegram: e.target.value },
                    }))
                  }
                  placeholder="https://t.me/mi-negocio"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* PESTAÑA 5: GALERÍA DE FOTOS */}
          {activeTab === 'gallery' && (
            <div className="space-y-4 text-slate-200">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Agregar Nueva Imagen a Galería
                </label>

                <input
                  type="text"
                  value={newGalleryCaption}
                  onChange={(e) => setNewGalleryCaption(e.target.value)}
                  placeholder="Pie de foto / Descripción opcional"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />

                <label className="cursor-pointer inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30">
                  {uploadingGallery ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {uploadingGallery ? 'Subiendo a Storage...' : 'Seleccionar e Subir Foto'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Lista de Fotos Subidas */}
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {appearance.gallery.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No hay imágenes en la galería.</p>
                ) : (
                  appearance.gallery.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.caption || 'Galería'}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="text-slate-300 font-medium truncate max-w-[180px]">
                          {item.caption || 'Sin descripción'}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* PESTAÑA 6: TESTIMONIOS Y OPINIONES */}
          {activeTab === 'testimonials' && (
            <div className="space-y-4 text-slate-200">
              <button
                onClick={() => {
                  setEditingTestimonial({ client_name: '', rating: 5, comment: '', client_avatar: null });
                  setTestimonialModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30"
              >
                <Plus className="w-4 h-4" /> Agregar Nuevo Testimonio
              </button>

              {/* Formulario Inline / Modal de Testimonio */}
              {testimonialModalOpen && (
                <div className="p-4 bg-slate-950 border border-indigo-500/40 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-400 uppercase">
                      {editingTestimonial.id ? 'Editar Testimonio' : 'Nuevo Testimonio'}
                    </span>
                    <button
                      onClick={() => setTestimonialModalOpen(false)}
                      className="text-slate-400 hover:text-white text-xs font-bold"
                    >
                      Cancelar
                    </button>
                  </div>

                  <input
                    type="text"
                    value={editingTestimonial.client_name || ''}
                    onChange={(e) =>
                      setEditingTestimonial((prev) => ({ ...prev, client_name: e.target.value }))
                    }
                    placeholder="Nombre del Cliente"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold mb-1">
                      Calificación (1 a 5 Estrellas)
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setEditingTestimonial((prev) => ({ ...prev, rating: star }))}
                          className="p-1 text-amber-400 focus:outline-none"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= (editingTestimonial.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={editingTestimonial.comment || ''}
                    onChange={(e) =>
                      setEditingTestimonial((prev) => ({ ...prev, comment: e.target.value }))
                    }
                    placeholder="Comentario / Opinión del cliente..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />

                  {/* Subir Avatar para Testimonio */}
                  <div className="flex items-center gap-3 pt-1">
                    {editingTestimonial.client_avatar && (
                      <img
                        src={editingTestimonial.client_avatar}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <label className="cursor-pointer text-[11px] font-bold text-indigo-400 hover:underline">
                      {uploadingAvatar ? 'Subiendo Avatar...' : 'Subir Avatar de Cliente'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    onClick={handleSaveTestimonial}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                  >
                    Guardar Testimonio
                  </button>
                </div>
              )}

              {/* Lista de Testimonios */}
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {appearance.testimonials.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No hay testimonios agregados.</p>
                ) : (
                  appearance.testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{t.client_name}</span>
                          <div className="flex text-amber-400">
                            {Array.from({ length: t.rating }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTestimonial(t);
                              setTestimonialModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(t.id)}
                            className="p-1 text-rose-400 hover:text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-400 text-[11px] italic">"{t.comment}"</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Previsualizador Responsive en Vivo (7 cols, Sticky) */}
        <div className="lg:col-span-7 space-y-4 lg:sticky lg:top-6">
          {/* Barra de Viewport Responsive */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-200">
                <Eye className="w-4 h-4 text-indigo-400" />
                Previsualización en Vivo
              </div>

              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {appearance.settings.template || 'modern'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                  {appearance.theme.font_family || 'Inter'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setDeviceViewport('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  deviceViewport === 'desktop'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
              <button
                onClick={() => setDeviceViewport('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  deviceViewport === 'tablet'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" /> Tablet
              </button>
              <button
                onClick={() => setDeviceViewport('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition ${
                  deviceViewport === 'mobile'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
            </div>
          </div>

          {/* Marco de Navegador Simulado */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-2 sm:p-4 shadow-2xl overflow-hidden">
            {/* Barra superior de dirección URL */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 rounded-t-2xl border-b border-slate-800 text-xs mb-2">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 bg-slate-950 rounded-lg px-3 py-1 text-[11px] text-slate-400 font-mono text-center truncate">
                https://omnicitas.com/{demoTenant.slug}
              </div>
            </div>

            {/* Viewport del sitio público con scroll propio */}
            <div
              className={`transition-all duration-300 rounded-2xl overflow-hidden border border-slate-800 ${viewportWidthClass} min-h-[600px] max-h-[750px] overflow-y-auto break-words`}
            >
              <PublicPageRenderer
                tenant={demoTenant}
                appearance={appearance}
                services={services}
                staffList={staffList}
                workingHours={workingHours}
                bookingUrl={`#`}
                deviceViewport={deviceViewport}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
