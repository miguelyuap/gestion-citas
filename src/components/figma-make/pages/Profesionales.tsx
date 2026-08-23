"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, X, Trash2, Loader2, Building2, Upload, Camera, Users } from "lucide-react";
import {
  getStaffDataAction,
  createStaffAction,
  updateStaffAction,
  deleteStaffAction,
} from "@/app/(dashboard)/staff/actions";
import { Branch } from "@/app/(dashboard)/branches/actions";
import NotificationService from "@/lib/services/notification.service";
import { LoadingState } from "@/components/figma-make/components/LoadingSpinner";

interface StaffItem {
  id: string;
  nombre: string;
  especialidad: string;
  email: string;
  phone: string;
  branch_id?: string | null;
  sucursales_texto: string;
  estado: string;
  avatar: string;
  avatar_url?: string | null;
  color: string;
  citas: number;
}

export default function Profesionales() {
  const [staffList, setStaffList] = useState<StaffItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<StaffItem | null>(null);

  // Estados del Formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState<string>("");
  const [color, setColor] = useState("#2563eb");

  // Subida de foto/avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStaffDataAction();
      if (res.branches) {
        setBranches(res.branches);
      }

      if (res.staffList) {
        const loadedStaff: StaffItem[] = res.staffList.map((p: any) => {
          const initials = (p.name || "E")
            .split(" ")
            .map((n: string) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          const branchObj = res.branches.find((b: Branch) => b.id === p.branch_id);
          const sucursales_texto = branchObj ? branchObj.name : "Todas las sucursales";

          return {
            id: p.id,
            nombre: p.name,
            especialidad: "Especialista",
            email: p.email || "",
            phone: p.phone || "",
            branch_id: p.branch_id || null,
            sucursales_texto,
            estado: p.is_active ? "Activo" : "Inactivo",
            avatar: initials || "EP",
            avatar_url: p.avatar_url || null,
            color: p.color || "#2563eb",
            citas: p.citasCount || 0,
          };
        });
        setStaffList(loadedStaff);
      }
    } catch (e) {
      console.error("Error al cargar profesionales:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setRemoveAvatar(false);
    }
  };

  const openNewForm = () => {
    setEditItem(null);
    setName("");
    setEmail("");
    setPhone("");
    setSelectedBranchId("");
    setColor("#2563eb");
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(false);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (item: StaffItem) => {
    setEditItem(item);
    setName(item.nombre);
    setEmail(item.email);
    setPhone(item.phone);
    setSelectedBranchId(item.branch_id || "");
    setColor(item.color || "#2563eb");
    setAvatarFile(null);
    setAvatarPreview(item.avatar_url || null);
    setRemoveAvatar(false);
    setFormError("");
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Por favor ingresa el nombre del profesional.");
      return;
    }

    startTransition(async () => {
      setSubmitting(true);
      const formData = new FormData();
      if (editItem?.id) formData.append("id", editItem.id);
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("phone", phone.trim());
      formData.append("color", color);
      if (selectedBranchId) {
        formData.append("branch_id", selectedBranchId);
      }

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      } else if (avatarPreview && avatarPreview.startsWith("http") && !removeAvatar) {
        formData.append("avatar_url", avatarPreview);
      }

      if (removeAvatar) {
        formData.append("remove_avatar", "true");
      }

      try {
        const res = editItem?.id
          ? await updateStaffAction(formData)
          : await createStaffAction(formData);

        if (res.error) {
          setFormError(res.error);
        } else {
          NotificationService.success(
            "¡Guardado!",
            editItem?.id ? "Profesional actualizado con éxito." : "Nuevo profesional registrado con éxito."
          );
          setShowForm(false);
          setEditItem(null);
          loadData();
        }
      } catch (err: any) {
        setFormError(err.message || "Error al procesar los datos del profesional.");
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleDelete = async () => {
    if (!editItem) return;
    const confirmed = await NotificationService.confirm(
      "¿Eliminar profesional?",
      `¿Seguro que deseas eliminar a ${editItem.nombre}?`
    );
    if (!confirmed) return;

    try {
      const res = await deleteStaffAction(editItem.id);
      if (res.error) {
        NotificationService.error("Error", res.error);
      } else {
        NotificationService.success("Eliminado", "Profesional eliminado.");
        setShowForm(false);
        setEditItem(null);
        loadData();
      }
    } catch (e) {
      NotificationService.error("Error", "No se pudo eliminar el profesional.");
    }
  };

  if (loading) {
    return (
      <div className="page-pad">
        <LoadingState title="Cargando equipo de profesionales..." subtitle="Obteniendo la lista de colaboradores activos de Supabase" cardCount={6} />
      </div>
    );
  }

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
            Profesionales
          </h2>
          <p style={{ fontSize: 13.5, color: "#1e293b", marginTop: 2, fontWeight: 500 }}>
            {staffList.length} colaboradores registrados en tu negocio
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNewForm}>
          <Plus size={16} /> Nuevo profesional
        </button>
      </div>

      {staffList.length === 0 ? (
        /* Estado vacío si no hay profesionales registrados aún */
        <div
          className="card"
          style={{
            padding: 48,
            textAlign: "center",
            maxWidth: 520,
            margin: "40px auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={30} color="#2563eb" />
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
            No hay profesionales registrados aún
          </h3>
          <p style={{ color: "#1e293b", fontSize: 14, lineHeight: 1.5, fontWeight: 500 }}>
            Registra a los miembros de tu equipo para que tus clientes puedan agendar citas directamente con ellos.
          </p>
          <button className="btn btn-primary" onClick={openNewForm} style={{ marginTop: 8 }}>
            <Plus size={16} /> Registrar primer profesional
          </button>
        </div>
      ) : (
        /* Grid de Profesionales */
        <div className="grid-auto">
          {staffList.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{ padding: 20, cursor: "pointer", transition: "box-shadow 0.12s", background: "white" }}
              onClick={() => openEditForm(p)}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
            >
              <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt={p.nombre}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      objectFit: "cover",
                      flexShrink: 0,
                      border: "2px solid #cbd5e1",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background:
                        p.estado === "Activo"
                          ? "linear-gradient(135deg, #2563eb, #6366f1)"
                          : "linear-gradient(135deg, #475569, #64748b)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                  >
                    {p.avatar}
                  </div>
                )}
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#0f172a",
                    }}
                  >
                    {p.nombre}
                  </div>
                  <div style={{ fontSize: 13, color: "#1e293b", fontWeight: 600 }}>{p.especialidad}</div>
                  <span
                    className={`badge ${p.estado === "Activo" ? "badge-success" : "badge-neutral"}`}
                    style={{ marginTop: 4, color: p.estado === "Activo" ? "#15803d" : "#0f172a" }}
                  >
                    {p.estado}
                  </span>
                </div>
              </div>

              {p.email && (
                <div style={{ fontSize: 12.5, color: "#0f172a", fontWeight: 500, marginBottom: 4 }}>
                  {p.email}
                </div>
              )}

              {p.phone && (
                <div style={{ fontSize: 12.5, color: "#0f172a", fontWeight: 600, fontFamily: "var(--font-mono)", marginBottom: 12 }}>
                  {p.phone}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 12,
                  borderTop: "1px solid #f1f5f9",
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    {p.citas}
                  </div>
                  <div style={{ fontSize: 11, color: "#0f172a", fontWeight: 700 }}>atenciones</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#0f172a", fontWeight: 600 }}>
                  <Building2 size={14} color="#2563eb" />
                  <span>{p.sucursales_texto}</span>
                </div>
              </div>
            </div>
          ))}

          <div
            onClick={openNewForm}
            className="card"
            style={{
              padding: 20,
              cursor: "pointer",
              border: "2px dashed #cbd5e1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: 180,
              transition: "all 0.12s",
              background: "white",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#2563eb";
              e.currentTarget.style.background = "#eff6ff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#cbd5e1";
              e.currentTarget.style.background = "white";
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={22} color="#0f172a" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>
              Agregar profesional
            </span>
          </div>
        </div>
      )}

      {(showForm || editItem) && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        >
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#0f172a" }}>
                  {editItem ? `Editar: ${editItem.nombre}` : "Nuevo profesional"}
                </h3>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: 6, color: "#0f172a" }}
                  onClick={() => {
                    setShowForm(false);
                    setEditItem(null);
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {formError && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      padding: "10px 14px",
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 600,
                    }}
                  >
                    {formError}
                  </div>
                )}

                {/* Foto / Avatar */}
                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>Foto de Perfil</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        background: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                        border: "2px solid #cbd5e1",
                        flexShrink: 0,
                      }}
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Camera size={24} color="#0f172a" />
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <label className="btn btn-outline btn-sm" style={{ cursor: "pointer", color: "#0f172a", fontWeight: 700 }}>
                        <Upload size={14} style={{ marginRight: 6 }} /> Cargar foto
                        <input type="file" accept="image/*" onChange={handleImageFileChange} style={{ display: "none" }} />
                      </label>
                      {avatarPreview && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: "#dc2626", fontSize: 12.5, fontWeight: 700 }}
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                            setRemoveAvatar(true);
                          }}
                        >
                          Quitar
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>Nombre completo *</label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Dr. Carlos Rodríguez"
                    style={{ color: "#0f172a", fontWeight: 500 }}
                    required
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: 14,
                  }}
                >
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>Correo electrónico</label>
                    <input
                      className="input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="profesional@empresa.com"
                      style={{ color: "#0f172a", fontWeight: 500 }}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>Teléfono / WhatsApp</label>
                    <input
                      className="input"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 123 4567"
                      style={{ color: "#0f172a", fontWeight: 500 }}
                    />
                  </div>
                </div>

                {/* Seleccionar Sucursal */}
                {branches.length > 0 && (
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>Sucursal asignada</label>
                    <select
                      className="input"
                      value={selectedBranchId}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      style={{ color: "#0f172a", fontWeight: 600 }}
                    >
                      <option value="">Todas las sucursales</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>Color en agenda</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{
                        width: 44,
                        height: 38,
                        border: "none",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    />
                    <span style={{ fontSize: 13.5, color: "#0f172a", fontWeight: 700 }}>{color}</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                {editItem ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: "#dc2626", fontWeight: 700 }}
                    onClick={handleDelete}
                  >
                    <Trash2 size={16} /> Eliminar
                  </button>
                ) : (
                  <div />
                )}
                <div style={{ display: "flex", gap: 10, marginLeft: "auto" }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditItem(null);
                    }}
                    disabled={submitting}
                    style={{ color: "#0f172a", fontWeight: 600 }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || isPending}
                  >
                    {submitting && <Loader2 size={14} className="spin" style={{ marginRight: 6 }} />}
                    Guardar profesional
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
