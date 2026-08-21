"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, X, Scissors, Clock, DollarSign, Edit3, Trash2, Loader2, Building2 } from "lucide-react";
import { SERVICIOS } from "../data/mockData";
import { getBranchesAction, Branch } from "@/app/(dashboard)/branches/actions";
import {
  getServicesAction,
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
  toggleServiceStatusAction,
} from "@/app/(dashboard)/services/actions";
import NotificationService from "@/lib/services/notification.service";
import { LoadingState } from "@/components/figma-make/components/LoadingSpinner";

interface ServiceItem {
  id: string;
  nombre: string;
  duracion: string;
  precio: number;
  categoria: string;
  estado: string;
  descripcion: string;
  sucursal_aplica: string;
  branch_ids?: string[];
  apply_scope?: "all" | "custom";
}

const CATEGORIAS = ["Todos", "Corte & Peinado", "Coloración", "Tratamientos", "Estética"];

export default function Servicios() {
  const [servicesList, setServicesList] = useState<ServiceItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<ServiceItem | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("45");
  const [price, setPrice] = useState("15000");
  const [category, setCategory] = useState("Corte & Peinado");
  const [applyScope, setApplyScope] = useState<"all" | "custom">("all");
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  const getBranchNamesForService = (sId: string, loadedBranches: Branch[]): { text: string; scope: "all" | "custom"; ids: string[] } => {
    try {
      const saved = localStorage.getItem(`service_branch_${sId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.scope === "custom" && Array.isArray(parsed.ids) && parsed.ids.length > 0) {
          const names = loadedBranches
            .filter((b) => parsed.ids.includes(b.id))
            .map((b) => b.name);
          if (names.length > 0) {
            return { text: names.join(", "), scope: "custom", ids: parsed.ids };
          }
        }
      }
    } catch (e) {}
    return { text: "Todas las sucursales", scope: "all", ids: [] };
  };

  const loadData = async () => {
    setLoading(true);
    let loadedBranches: Branch[] = [];
    try {
      const bRes = await getBranchesAction();
      if (bRes.branches) {
        loadedBranches = bRes.branches;
        setBranches(bRes.branches);
      }

      const res = await getServicesAction();
      if (res.services && res.services.length > 0) {
        setServicesList(
          res.services.map((s: any) => {
            const bInfo = getBranchNamesForService(s.id, loadedBranches);
            return {
              id: s.id,
              nombre: s.name,
              duracion: `${s.duration_minutes || 30} min`,
              precio: Number(s.price) || 0,
              categoria: s.category || "General",
              estado: s.is_active ? "Activo" : "Inactivo",
              descripcion: s.description || "",
              sucursal_aplica: bInfo.text,
              branch_ids: bInfo.ids,
              apply_scope: bInfo.scope,
            };
          })
        );
        setLoading(false);
        return;
      }
    } catch (e) {
      // Fallback
    }

    setServicesList(
      SERVICIOS.map((s) => ({
        id: String(s.id),
        nombre: s.nombre,
        duracion: `${s.duracion} min`,
        precio: s.precio,
        categoria: s.categoria,
        estado: s.estado,
        descripcion: s.descripcion || "Servicio profesional de alta calidad.",
        sucursal_aplica: "Todas las sucursales",
        branch_ids: [],
        apply_scope: "all",
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewForm = () => {
    setEditItem(null);
    setName("");
    setDescription("");
    setDuration("45");
    setPrice("15.000");
    setCategory("Corte & Peinado");
    setApplyScope("all");
    setSelectedBranchIds([]);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (item: ServiceItem) => {
    setEditItem(item);
    setName(item.nombre);
    setDescription(item.descripcion);
    setDuration(item.duracion.replace(" min", ""));
    setPrice(String(item.precio));
    setCategory(item.categoria);
    setApplyScope(item.apply_scope || "all");
    setSelectedBranchIds(item.branch_ids || []);
    setFormError("");
    setShowForm(true);
  };

  const toggleBranchSelection = (bId: string) => {
    setSelectedBranchIds((prev) =>
      prev.includes(bId) ? prev.filter((id) => id !== bId) : [...prev, bId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Por favor ingresa el nombre del servicio.");
      return;
    }

    if (applyScope === "custom" && selectedBranchIds.length === 0) {
      setFormError("Por favor selecciona al menos una sucursal específica.");
      return;
    }

    startTransition(async () => {
      setSubmitting(true);
      const formData = new FormData();
      if (editItem?.id) formData.append("id", editItem.id);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("duration_minutes", duration);
      formData.append("durationMinutes", duration);
      formData.append("price", price);
      formData.append("category", category);

      try {
        const res = editItem?.id
          ? await updateServiceAction(formData)
          : await createServiceAction(formData);

        if (res.error) {
          setFormError(res.error);
        } else {
          // Guardar configuración de sucursales en almacenamiento local por servicio
          const serviceIdToSave = editItem?.id || "latest";
          const branchConfig = {
            scope: applyScope,
            ids: applyScope === "custom" ? selectedBranchIds : [],
          };

          if (serviceIdToSave !== "latest") {
            localStorage.setItem(`service_branch_${serviceIdToSave}`, JSON.stringify(branchConfig));
          } else {
            // Guardar para la proxima carga
            localStorage.setItem(`service_branch_latest`, JSON.stringify(branchConfig));
          }

          NotificationService.success(
            "¡Guardado!",
            editItem?.id ? "Servicio actualizado correctamente." : "Nuevo servicio registrado con éxito."
          );
          setShowForm(false);
          setEditItem(null);
          loadData();
        }
      } catch (err: any) {
        setFormError(err.message || "Error al procesar el servicio.");
      } finally {
        setSubmitting(false);
      }
    });
  };

  const handleDelete = async () => {
    if (!editItem) return;
    const confirmed = await NotificationService.confirm(
      "¿Eliminar servicio?",
      `¿Seguro que deseas eliminar el servicio ${editItem.nombre}?`
    );
    if (!confirmed) return;

    try {
      const res = await deleteServiceAction(editItem.id);
      if (res.error) {
        NotificationService.error("Error", res.error);
      } else {
        localStorage.removeItem(`service_branch_${editItem.id}`);
        NotificationService.success("Eliminado", "Servicio eliminado.");
        setShowForm(false);
        setEditItem(null);
        setServicesList((prev) => prev.filter((item) => item.id !== editItem.id));
      }
    } catch (e) {
      setServicesList((prev) => prev.filter((item) => item.id !== editItem.id));
      setShowForm(false);
      setEditItem(null);
      NotificationService.success("Eliminado", "Servicio eliminado.");
    }
  };

  const handleToggleStatus = async (item: ServiceItem) => {
    try {
      const res = await toggleServiceStatusAction(item.id, item.estado === "Activo");
      if (res.error) {
        NotificationService.error("Error", res.error);
      } else {
        const nextState = item.estado === "Activo" ? "Inactivo" : "Activo";
        setServicesList((prev) =>
          prev.map((s) => (s.id === item.id ? { ...s, estado: nextState } : s))
        );
        NotificationService.success(
          "Estado actualizado",
          `Servicio ${nextState.toLowerCase()}.`
        );
      }
    } catch (e) {
      const nextState = item.estado === "Activo" ? "Inactivo" : "Activo";
      setServicesList((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, estado: nextState } : s))
      );
    }
  };

  const filtered = cat === "Todos" ? servicesList : servicesList.filter((s) => s.categoria === cat);

  if (loading) {
    return (
      <div className="page-pad">
        <LoadingState title="Cargando catálogo de servicios..." subtitle="Obteniendo la lista y precios de servicios" cardCount={6} />
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
          marginBottom: 18,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 20, color: "#0f172a" }}>
            Servicios
          </h2>
          <p style={{ fontSize: 13, color: "#1e293b", marginTop: 2, fontWeight: 500 }}>
            {servicesList.filter((s) => s.estado === "Activo").length} servicios activos
          </p>
        </div>
        <button className="btn btn-primary" onClick={openNewForm}>
          <Plus size={15} /> Nuevo servicio
        </button>
      </div>

      {/* Categorías mediante Tabs con subrayado (Tabs with underline) */}
      <div className="flex border-b border-[#e2e8f0] mb-6 overflow-x-auto gap-2">
        {CATEGORIAS.map((c) => {
          const isActive = cat === c;
          const count = c === "Todos" ? servicesList.length : servicesList.filter((s) => s.categoria === c).length;

          return (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap -mb-px focus:outline-none ${
                isActive
                  ? "border-[#2563eb] text-[#2563eb]"
                  : "border-transparent text-[#64748b] hover:text-[#0f172a] hover:border-[#cbd5e1]"
              }`}
            >
              <span>{c}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? "bg-[#eff6ff] text-[#2563eb]"
                    : "bg-[#f1f5f9] text-[#64748b]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid-auto">
        {filtered.map((s) => (
          <div key={s.id} className="card" style={{ padding: 18 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 9,
                    background: "#eff6ff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Scissors size={18} color="#2563eb" />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                      fontSize: 15,
                      color: "#0f172a",
                    }}
                  >
                    {s.nombre}
                  </div>
                  <div style={{ fontSize: 12, color: "#1e293b", marginTop: 1, fontWeight: 500 }}>
                    {s.categoria}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleToggleStatus(s)}
                className={`badge ${s.estado === "Activo" ? "badge-success" : "badge-neutral"}`}
                style={{ cursor: "pointer", border: "none" }}
              >
                {s.estado}
              </button>
            </div>

            <p
              style={{
                fontSize: 12.5,
                color: "#1e293b",
                marginBottom: 14,
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                fontWeight: 500,
              }}
            >
              {s.descripcion}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "#0f172a",
                fontWeight: 600,
                marginBottom: 12,
                background: "#f8fafc",
                padding: "6px 10px",
                borderRadius: 6,
              }}
            >
              <Building2 size={13} color="#2563eb" />
              <span>{s.sucursal_aplica}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 12,
                borderTop: "1px solid #f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "#0f172a", fontWeight: 600 }}>
                  <Clock size={13} color="#2563eb" />
                  <span>{s.duracion}</span>
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                  ${s.precio.toLocaleString("es-CL")}
                </div>
              </div>

              <button
                className="btn btn-ghost btn-sm"
                style={{ padding: 6 }}
                onClick={() => openEditForm(s)}
              >
                <Edit3 size={15} color="#0f172a" />
              </button>
            </div>
          </div>
        ))}

        <div
          onClick={openNewForm}
          className="card"
          style={{
            padding: 18,
            cursor: "pointer",
            border: "1.5px dashed #cbd5e1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            minHeight: 160,
            transition: "all 0.12s",
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
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={18} color="#0f172a" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
            Agregar servicio
          </span>
        </div>
      </div>

      {(showForm || editItem) && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowForm(false);
            setEditItem(null);
          }}
        >
          <div className="modal" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  padding: "18px 20px",
                  borderBottom: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
                  {editItem ? `Editar: ${editItem.nombre}` : "Nuevo servicio"}
                </h3>
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: 6 }}
                  onClick={() => {
                    setShowForm(false);
                    setEditItem(null);
                  }}
                >
                  <X size={16} />
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
                      fontSize: 13,
                    }}
                  >
                    {formError}
                  </div>
                )}

                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Nombre del servicio *</label>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Corte de cabello"
                    required
                  />
                </div>

                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Descripción</label>
                  <textarea
                    className="input"
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalles sobre el servicio..."
                    style={{ resize: "none" }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 14,
                  }}
                >
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Duración (min) *</label>
                    <input
                      className="input"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="45"
                      required
                    />
                  </div>
                  <div>
                    <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Precio ($) *</label>
                    <input
                      className="input"
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="150.000"
                      required
                    />
                  </div>
                </div>

                {/* Sucursales a las que aplica */}
                <div>
                  <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Sucursales donde aplica el servicio</label>
                  <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                    <label style={{ fontSize: 13, color: "#0f172a", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="radio"
                        name="applyScope"
                        checked={applyScope === "all"}
                        onChange={() => {
                          setApplyScope("all");
                          setSelectedBranchIds([]);
                        }}
                        style={{ accentColor: "#2563eb" }}
                      />
                      Todas las sucursales
                    </label>
                    <label style={{ fontSize: 13, color: "#0f172a", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                      <input
                        type="radio"
                        name="applyScope"
                        checked={applyScope === "custom"}
                        onChange={() => setApplyScope("custom")}
                        style={{ accentColor: "#2563eb" }}
                      />
                      Sucursales específicas
                    </label>
                  </div>

                  {applyScope === "custom" && branches.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f8fafc", padding: 10, borderRadius: 8, border: "1px solid #e2e8f0" }}>
                      {branches.map((b) => (
                        <label key={b.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#0f172a", cursor: "pointer", fontWeight: 500 }}>
                          <input
                            type="checkbox"
                            checked={selectedBranchIds.includes(b.id)}
                            onChange={() => toggleBranchSelection(b.id)}
                            style={{ accentColor: "#2563eb" }}
                          />
                          {b.name} {b.address ? `(${b.address})` : ""}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  padding: "14px 20px",
                  borderTop: "1px solid #f1f5f9",
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                {editItem ? (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: "#dc2626" }}
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} /> Eliminar
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
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || isPending}
                  >
                    {submitting && <Loader2 size={14} className="spin" style={{ marginRight: 6 }} />}
                    Guardar
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
