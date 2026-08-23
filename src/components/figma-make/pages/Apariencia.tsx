"use client";

import { useState, useEffect, useTransition } from "react";
import {
  Palette, Upload, Image as ImageIcon, Save, ExternalLink, Sparkles, Check, Loader2,
  Sliders, MessageSquare, Phone, MapPin, Scissors, Users, Info, ArrowRight, Eye, Layout,
  Globe, Instagram, Facebook, Video, Share2, Youtube, Linkedin, Send, Calendar, Clock,
  CheckCircle2, ChevronRight
} from "lucide-react";
import {
  getTenantAppearanceAction,
  saveTenantAppearanceAction,
  uploadTenantAssetAction,
} from "@/app/(dashboard)/dashboard/appearance/actions";
import NotificationService from "@/lib/services/notification.service";

const COLOR_PRESETS = [
  { name: "Azul Profesional", primary: "#2563eb", secondary: "#1d4ed8", bg: "#f8fafc", isDark: false },
  { name: "Índigo Elegante", primary: "#4f46e5", secondary: "#4338ca", bg: "#faf5ff", isDark: false },
  { name: "Esmeralda Luxe", primary: "#059669", secondary: "#047857", bg: "#ecfdf5", isDark: false },
  { name: "Rosa Beauty / Spa", primary: "#ec4899", secondary: "#db2777", bg: "#fdf2f8", isDark: false },
  { name: "Oscuro Moderno", primary: "#0f172a", secondary: "#1e293b", bg: "#0f172a", isDark: true },
  { name: "Ámbar Cálido", primary: "#d97706", secondary: "#b45309", bg: "#fffbeb", isDark: false },
  { name: "Borgoña Luxe", primary: "#9f1239", secondary: "#881337", bg: "#fff1f2", isDark: false },
  { name: "Turquesa Fresco", primary: "#0d9488", secondary: "#0f766e", bg: "#f0fdfa", isDark: false },
  { name: "Violeta Místico", primary: "#7c3aed", secondary: "#6d28d9", bg: "#f5f3ff", isDark: false },
  { name: "Coral Atardecer", primary: "#f97316", secondary: "#ea580c", bg: "#fff7ed", isDark: false },
  { name: "Menta Nórdico", primary: "#10b981", secondary: "#059669", bg: "#f0fdf4", isDark: false },
  { name: "Oro Royal / VIP", primary: "#ca8a04", secondary: "#a16207", bg: "#fefce8", isDark: false },
  { name: "Gris Minimalista", primary: "#475569", secondary: "#334155", bg: "#f8fafc", isDark: false },
  { name: "Cian Neón", primary: "#06b6d4", secondary: "#0891b2", bg: "#ecfeff", isDark: false },
  { name: "Fucsia Vibrante", primary: "#d946ef", secondary: "#c026d3", bg: "#fdf4ff", isDark: false },
  { name: "Negro Ónix VIP", primary: "#18181b", secondary: "#27272a", bg: "#18181b", isDark: true },
];

type PreviewMode = "full" | "services" | "staff" | "contact";

export default function Apariencia() {
  const [heroTitle, setHeroTitle] = useState("Reserva tu Cita en Línea");
  const [heroSubtitle, setHeroSubtitle] = useState("Elige tu servicio y especialista preferido en pocos segundos");
  const [ctaText, setCtaText] = useState("Reservar Cita");
  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#1d4ed8");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Section titles
  const [servicesTitle, setServicesTitle] = useState("Nuestros Servicios");
  const [servicesSubtitle, setServicesSubtitle] = useState("Selecciona el tratamiento que deseas agendar");
  const [teamTitle, setTeamTitle] = useState("Nuestro Equipo de Especialistas");
  const [teamSubtitle, setTeamSubtitle] = useState("Profesionales capacitados para brindarte la mejor atención");
  const [aboutTitle, setAboutTitle] = useState("Sobre Nosotros");
  const [aboutText, setAboutText] = useState("Somos un centro especializado enfocado en ofrecer experiencias únicas con los mejores estándares de calidad.");

  // Social & Contact
  const [contactPhone, setContactPhone] = useState("+56 9 1234 5678");
  const [contactAddress, setContactAddress] = useState("Av. Principal 123, Piso 2");
  const [whatsappNumber, setWhatsappNumber] = useState("+56912345678");
  const [instagramUrl, setInstagramUrl] = useState("@tunegocio");
  const [facebookUrl, setFacebookUrl] = useState("facebook.com/tunegocio");
  const [tiktokUrl, setTiktokUrl] = useState("@tunegocio");
  const [twitterUrl, setTwitterUrl] = useState("@tunegocio");
  const [youtubeUrl, setYoutubeUrl] = useState("youtube.com/@tunegocio");
  const [linkedinUrl, setLinkedinUrl] = useState("linkedin.com/company/tunegocio");
  const [websiteUrl, setWebsiteUrl] = useState("https://tunegocio.com");
  const [telegramUrl, setTelegramUrl] = useState("t.me/tunegocio");

  const [tenantSlug, setTenantSlug] = useState("");
  const [tenantName, setTenantName] = useState("Mi Negocio");
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewTab, setPreviewTab] = useState<PreviewMode>("full");
  const [isPending, startTransition] = useTransition();

  const loadAppearance = async () => {
    try {
      const res = await getTenantAppearanceAction();
      if (res) {
        if (res.tenant?.slug) setTenantSlug(res.tenant.slug);
        if (res.tenant?.name) setTenantName(res.tenant.name);
        if (res.tenant?.logo_url) setLogoUrl(res.tenant.logo_url);
        if (res.appearance?.settings) {
          setHeroTitle(res.appearance.settings.hero_title || "Reserva tu Cita en Línea");
          setHeroSubtitle(res.appearance.settings.hero_subtitle || "Elige tu servicio y especialista preferido en pocos segundos");
          setCtaText(res.appearance.settings.hero_cta_text || "Reservar Cita");
          setAboutTitle(res.appearance.settings.about_title || "Sobre Nosotros");
          setAboutText(res.appearance.settings.about_text || "Somos un centro especializado enfocado en ofrecer experiencias únicas.");
          setWhatsappNumber(res.appearance.settings.whatsapp_number || "+56912345678");
        }
        if (res.appearance?.theme) {
          setPrimaryColor(res.appearance.theme.primary_color || "#2563eb");
          setSecondaryColor(res.appearance.theme.secondary_color || "#1d4ed8");
        }
        if (res.appearance?.socials) {
          setInstagramUrl(res.appearance.socials.instagram || "@tunegocio");
          setFacebookUrl(res.appearance.socials.facebook || "");
          setTiktokUrl(res.appearance.socials.tiktok || "");
          if (res.appearance.socials.whatsapp) setWhatsappNumber(res.appearance.socials.whatsapp);
          if (res.appearance.socials.twitter) setTwitterUrl(res.appearance.socials.twitter);
          if (res.appearance.socials.youtube) setYoutubeUrl(res.appearance.socials.youtube);
          if (res.appearance.socials.linkedin) setLinkedinUrl(res.appearance.socials.linkedin);
          if (res.appearance.socials.website) setWebsiteUrl(res.appearance.socials.website);
          if (res.appearance.socials.telegram) setTelegramUrl(res.appearance.socials.telegram);
        }
      }
    } catch (err) {
      // Graceful fallback
    }
  };

  useEffect(() => {
    loadAppearance();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "logo");

    try {
      const res = await uploadTenantAssetAction(formData);
      if (res.success && res.publicUrl) {
        setLogoUrl(res.publicUrl);
        NotificationService.success("¡Logo cargado!", "El logotipo ha sido guardado exitosamente.");
      } else {
        NotificationService.error("Error", res.error || "No se pudo subir el logo.");
      }
    } catch (err: any) {
      NotificationService.error("Error", err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSave = async () => {
    setErrorMsg("");
    setSaving(true);
    try {
      const res = await saveTenantAppearanceAction({
        settings: {
          template: "modern",
          hero_title: heroTitle,
          hero_subtitle: heroSubtitle,
          hero_cta_text: ctaText,
          about_title: aboutTitle,
          about_text: aboutText,
          whatsapp_number: whatsappNumber,
        },
        theme: {
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          background_color: "#f8fafc",
          surface_color: "#ffffff",
          text_color: "#0f172a",
          muted_text_color: "#475569",
          accent_color: primaryColor,
          font_family: "Outfit, sans-serif",
          border_radius: "12px",
          button_style: "rounded",
        },
        sections: [
          { section_key: "hero", is_enabled: true, display_order: 1 },
          { section_key: "services", is_enabled: true, display_order: 2 },
          { section_key: "staff", is_enabled: true, display_order: 3 },
          { section_key: "about", is_enabled: true, display_order: 4 },
          { section_key: "contact", is_enabled: true, display_order: 5 },
        ],
        socials: {
          instagram: instagramUrl,
          facebook: facebookUrl,
          tiktok: tiktokUrl,
          whatsapp: whatsappNumber,
          twitter: twitterUrl,
          youtube: youtubeUrl,
          linkedin: linkedinUrl,
          website: websiteUrl,
          telegram: telegramUrl,
        },
        gallery: [],
        testimonials: [],
      });

      if (res.success) {
        await NotificationService.success(
          "¡Apariencia Guardada!",
          "El portal de reserva público ha sido actualizado exitosamente con los parámetros guardados."
        );
      } else {
        setErrorMsg(res.error || "No se pudo guardar la configuración.");
        await NotificationService.error("Error al guardar", res.error || "No se pudo guardar la configuración.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al guardar la apariencia.");
      await NotificationService.error("Error al guardar", err.message || "Error al guardar la apariencia.");
    } finally {
      setSaving(false);
    }
  };


  return (
    <div className="page-pad fade-in">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#0f172a" }}>
            Personalización del Sitio Público
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 2, fontWeight: 500 }}>
            Configura secciones, paletas de color y redes sociales de tu portal de reservas online.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {tenantSlug && (
            <a
              href={`/${tenantSlug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline"
              style={{ textDecoration: "none", color: "#0f172a", fontWeight: 600 }}
            >
              <ExternalLink size={14} style={{ marginRight: 6 }} /> Ver sitio público
            </a>
          )}
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || isPending}
          >
            {saving ? (
              <Loader2 size={15} className="spin" style={{ marginRight: 6 }} />
            ) : (
              <Save size={15} style={{ marginRight: 6 }} />
            )}
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="grid-2col" style={{ gap: 24, alignItems: "flex-start" }}>
        {/* Editor Form Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Logo & Identity */}
          <div className="card" style={{ padding: 20 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#0f172a",
              }}
            >
              <ImageIcon size={18} color="#2563eb" /> Logotipo de la Empresa
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 12,
                  border: "1px dashed #cbd5e1",
                  background: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <Sparkles size={24} color="#0f172a" />
                )}
              </div>

              <div>
                <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", color: "#0f172a", fontWeight: 600 }}>
                  <Upload size={14} style={{ marginRight: 6 }} />
                  {uploadingLogo ? "Subiendo..." : "Subir nuevo logo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: "none" }}
                    disabled={uploadingLogo}
                  />
                </label>
                <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 6, fontWeight: 500 }}>
                  Aparecerá en la cabecera del portal de reservas online y en tu panel.
                </div>
              </div>
            </div>
          </div>

          {/* Color Pickers & Presets */}
          <div className="card" style={{ padding: 20 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 15,
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#0f172a",
              }}
            >
              <Palette size={18} color="#2563eb" /> Paletas de Colores Recomendadas
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label" style={{ color: "#0f172a", fontWeight: 600, marginBottom: 8, display: "block" }}>
                Selecciona una paleta de color predefinida:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
                {COLOR_PRESETS.map((p) => {
                  const isSelected = primaryColor === p.primary;
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(p.primary);
                        setSecondaryColor(p.secondary);
                      }}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: `1.5px solid ${isSelected ? p.primary : p.isDark ? "#334155" : "#cbd5e1"}`,
                        background: p.bg,
                        cursor: "pointer",
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: p.isDark ? "#ffffff" : "#0f172a",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        boxShadow: isSelected ? `0 2px 8px ${p.primary}40` : "none",
                        transition: "all 0.15s",
                      }}
                    >
                      <span
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          background: p.primary,
                          display: "inline-block",
                          flexShrink: 0,
                          boxShadow: "0 0 0 1px rgba(255,255,255,0.4)",
                        }}
                      />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
                paddingTop: 12,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Color Primario (Botones y Acentos)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ width: 44, height: 38, border: "none", borderRadius: 8, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#0f172a", fontWeight: 700 }}>
                    {primaryColor}
                  </span>
                </div>
              </div>

              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Color Secundario (Fondos y Degradados)</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ width: 44, height: 38, border: "none", borderRadius: 8, cursor: "pointer" }}
                  />
                  <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", color: "#0f172a", fontWeight: 700 }}>
                    {secondaryColor}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secciones del Portal */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
              <Layout size={18} color="#2563eb" /> Secciones del Portal Público
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Header / Botón Cita */}
              <div style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a", marginBottom: 8 }}>Banner Principal & Botón Cita</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Título del Banner *</label>
                    <input className="input" value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Subtítulo / Mensaje</label>
                    <input className="input" value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Texto del Botón de Reserva (CTA)</label>
                    <input className="input" value={ctaText} onChange={(e) => setCtaText(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Servicios */}
              <div style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Scissors size={15} color="#2563eb" /> Sección Servicios
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Título</label>
                    <input className="input" value={servicesTitle} onChange={(e) => setServicesTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Subtítulo</label>
                    <input className="input" value={servicesSubtitle} onChange={(e) => setServicesSubtitle(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Equipo */}
              <div style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Users size={15} color="#2563eb" /> Sección Equipo / Profesionales
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Título</label>
                    <input className="input" value={teamTitle} onChange={(e) => setTeamTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Subtítulo</label>
                    <input className="input" value={teamSubtitle} onChange={(e) => setTeamSubtitle(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Nosotros */}
              <div style={{ padding: 14, border: "1px solid #e2e8f0", borderRadius: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <Info size={15} color="#2563eb" /> Sección Nosotros
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Título</label>
                    <input className="input" value={aboutTitle} onChange={(e) => setAboutTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Descripción / Reseña del Negocio</label>
                    <textarea className="input" rows={2} value={aboutText} onChange={(e) => setAboutText(e.target.value)} style={{ resize: "none" }} />
                  </div>
                </div>
              </div>

              {/* Contacto & Redes Ampliado */}
              <div style={{ padding: 16, border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Share2 size={16} color="#2563eb" /> Sección Contacto & Redes Sociales Completa
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Phone size={13} color="#2563eb" /> Teléfono Directo
                    </label>
                    <input className="input" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+56 9 1234 5678" />
                  </div>

                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={13} color="#2563eb" /> Dirección Física
                    </label>
                    <input className="input" value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} placeholder="Av. Principal 123" />
                  </div>

                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <MessageSquare size={13} color="#16a34a" /> WhatsApp
                    </label>
                    <input className="input" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+56912345678" />
                  </div>

                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Instagram size={13} color="#ec4899" /> Instagram
                    </label>
                    <input className="input" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="@tunegocio" />
                  </div>

                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Facebook size={13} color="#2563eb" /> Facebook
                    </label>
                    <input className="input" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="facebook.com/tunegocio" />
                  </div>

                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Video size={13} color="#000000" /> TikTok
                    </label>
                    <input className="input" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="@tunegocio" />
                  </div>

                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Globe size={13} color="#0284c7" /> Twitter / X
                    </label>
                    <input className="input" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)} placeholder="@tunegocio" />
                  </div>

                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Youtube size={13} color="#dc2626" /> YouTube
                    </label>
                    <input className="input" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="youtube.com/@tunegocio" />
                  </div>

                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Linkedin size={13} color="#0a66c2" /> LinkedIn
                    </label>
                    <input className="input" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="linkedin.com/company/..." />
                  </div>

                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                      <Globe size={13} color="#059669" /> Sitio Web Externo
                    </label>
                    <input className="input" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://tunegocio.com" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Column (Real Client View) */}
        <div style={{ position: "sticky", top: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
              <Eye size={14} color="#2563eb" /> Vista Previa en Vivo (Portal del Cliente Real)
            </div>
          </div>

          {/* Mode Selector Tabs inside Preview */}
          <div style={{ display: "flex", gap: 4, marginBottom: 10, background: "#e2e8f0", padding: 3, borderRadius: 10 }}>
            {[
              { id: "full", label: "🌐 Sitio Completo" },
              { id: "services", label: "✂️ Servicios" },
              { id: "staff", label: "👤 Especialistas" },
              { id: "contact", label: "📍 Contacto" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPreviewTab(tab.id as PreviewMode)}
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 7,
                  border: "none",
                  background: previewTab === tab.id ? "white" : "transparent",
                  color: previewTab === tab.id ? "#0f172a" : "#64748b",
                  cursor: "pointer",
                  boxShadow: previewTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.15s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="card"
            style={{
              overflow: "hidden",
              border: "1px solid #cbd5e1",
              borderRadius: 16,
              boxShadow: "0 12px 36px rgba(0,0,0,0.12)",
              background: "#f8fafc",
            }}
          >
            {/* Topbar del Cliente */}
            <div
              style={{
                padding: "12px 18px",
                background: "white",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover" }} />
                ) : (
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: primaryColor,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {(tenantName || "MN").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                  {tenantName}
                </span>
              </div>

              <button
                style={{
                  background: primaryColor,
                  color: "white",
                  border: "none",
                  padding: "6px 14px",
                  borderRadius: 8,
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {ctaText}
              </button>
            </div>

            {/* VISTA COMPLETA / HERO */}
            {(previewTab === "full" || previewTab === "services") && (
              <div
                style={{
                  padding: "28px 20px",
                  background: `linear-gradient(135deg, ${primaryColor}18, ${secondaryColor}28)`,
                  textAlign: "center",
                  borderBottom: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 20,
                    background: "white",
                    fontSize: 11,
                    fontWeight: 700,
                    color: primaryColor,
                    marginBottom: 10,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <Sparkles size={13} color={primaryColor} /> Reservas Online 24/7
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 20,
                    color: "#0f172a",
                    marginBottom: 6,
                    lineHeight: 1.2,
                  }}
                >
                  {heroTitle}
                </h3>
                <p style={{ fontSize: 12.5, color: "#475569", maxWidth: 360, margin: "0 auto 16px", lineHeight: 1.4, fontWeight: 500 }}>
                  {heroSubtitle}
                </p>
                <button
                  style={{
                    background: primaryColor,
                    color: "white",
                    border: "none",
                    padding: "9px 22px",
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 700,
                    boxShadow: `0 4px 14px ${primaryColor}40`,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  {ctaText} <ArrowRight size={14} />
                </button>
              </div>
            )}

            {/* VISTA DE SERVICIOS REAL */}
            {(previewTab === "full" || previewTab === "services") && (
              <div style={{ padding: 18, borderBottom: "1px solid #e2e8f0", background: "white" }}>
                <div style={{ marginBottom: 12 }}>
                  <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                    {servicesTitle}
                  </h4>
                  <p style={{ fontSize: 11.5, color: "#64748b", margin: 0 }}>{servicesSubtitle}</p>
                </div>

                {/* Cards de Servicios */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { nombre: "Corte de Cabello & Estilizado", duracion: "45 min", precio: 15000, cat: "Corte" },
                    { nombre: "Tratamiento Capilar Profundo", duracion: "60 min", precio: 25000, cat: "Tratamientos" },
                  ].map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        background: idx === 0 ? `${primaryColor}08` : "#fafafa",
                        borderColor: idx === 0 ? primaryColor : "#e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: idx === 0 ? primaryColor : "#f1f5f9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Scissors size={15} color={idx === 0 ? "white" : "#64748b"} />
                        </div>
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0f172a" }}>{s.nombre}</div>
                          <div style={{ fontSize: 11, color: "#64748b", display: "flex", gap: 8 }}>
                            <span>⏱️ {s.duracion}</span>
                            <span style={{ fontWeight: 700, color: primaryColor }}>${s.precio.toLocaleString("es-CL")}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        style={{
                          background: idx === 0 ? primaryColor : "white",
                          color: idx === 0 ? "white" : "#0f172a",
                          border: idx === 0 ? "none" : "1px solid #cbd5e1",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "4px 10px",
                          borderRadius: 6,
                          cursor: "pointer",
                        }}
                      >
                        {idx === 0 ? "Seleccionado" : "Elegir"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VISTA DE ESPECIALISTAS Y DISPONIBILIDAD REAL */}
            {(previewTab === "full" || previewTab === "staff") && (
              <div style={{ padding: 18, borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
                <div style={{ marginBottom: 12 }}>
                  <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
                    {teamTitle}
                  </h4>
                  <p style={{ fontSize: 11.5, color: "#64748b", margin: 0 }}>{teamSubtitle}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { name: "Carlos Mendoza", role: "Estilista Senior", color: "#2563eb" },
                    { name: "Ana Gutiérrez", role: "Especialista Color", color: "#ec4899" },
                  ].map((staff, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 10,
                        background: "white",
                        borderRadius: 10,
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: staff.color,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {staff.name.substring(0, 1)}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {staff.name}
                        </div>
                        <div style={{ fontSize: 10.5, color: "#64748b" }}>{staff.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECCIÓN SOBRE NOSOTROS Y CONTACTO REAL */}
            {(previewTab === "full" || previewTab === "contact") && (
              <div style={{ padding: 18, background: "white" }}>
                <div style={{ marginBottom: 14 }}>
                  <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>
                    {aboutTitle}
                  </h4>
                  <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.4, margin: 0 }}>{aboutText}</p>
                </div>

                <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <MapPin size={13} color={primaryColor} /> Ubicación & Contacto
                  </div>

                  <div style={{ fontSize: 11.5, color: "#475569", display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
                    {contactPhone && <div>📞 {contactPhone}</div>}
                    {contactAddress && <div>📍 {contactAddress}</div>}
                  </div>

                  {/* Iconos de Redes Sociales Renderizados */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 8, borderTop: "1px solid #f8fafc" }}>

                    {whatsappNumber && (
                      <span title="WhatsApp" style={{ width: 28, height: 28, borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <MessageSquare size={14} />
                      </span>
                    )}
                    {instagramUrl && (
                      <span title="Instagram" style={{ width: 28, height: 28, borderRadius: "50%", background: "#fce7f3", color: "#ec4899", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Instagram size={14} />
                      </span>
                    )}
                    {facebookUrl && (
                      <span title="Facebook" style={{ width: 28, height: 28, borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Facebook size={14} />
                      </span>
                    )}
                    {tiktokUrl && (
                      <span title="TikTok" style={{ width: 28, height: 28, borderRadius: "50%", background: "#f1f5f9", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Video size={14} />
                      </span>
                    )}
                    {youtubeUrl && (
                      <span title="YouTube" style={{ width: 28, height: 28, borderRadius: "50%", background: "#fee2e2", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Youtube size={14} />
                      </span>
                    )}
                    {linkedinUrl && (
                      <span title="LinkedIn" style={{ width: 28, height: 28, borderRadius: "50%", background: "#e0f2fe", color: "#0284c7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Linkedin size={14} />
                      </span>
                    )}
                    {websiteUrl && (
                      <span title="Sitio Web" style={{ width: 28, height: 28, borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Globe size={14} />
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
