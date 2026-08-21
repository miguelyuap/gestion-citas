"use client";

import { useState, useEffect, useTransition } from "react";
import { Plus, X, Building2, Phone, MapPin, Clock, Trash2, Edit3, Loader2 } from "lucide-react";
import {
  getBranchesAction,
  createBranchAction,
  updateBranchAction,
  deleteBranchAction,
  toggleBranchStatusAction,
  Branch,
} from "@/app/(dashboard)/branches/actions";
import NotificationService from "@/lib/services/notification.service";
import { LoadingState } from "@/components/figma-make/components/LoadingSpinner";

interface SucursalFormProps {
  sucursal?: Branch | null;
  onClose: () => void;
  onSaved: () => void;
}

function SucursalForm({ sucursal, onClose, onSaved }: SucursalFormProps) {
  const [name, setName] = useState(sucursal?.name || "");
  const [address, setAddress] = useState(sucursal?.address || "");
  const [phone, setPhone] = useState(sucursal?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Por favor ingresa el nombre de la sucursal.");
      return;
    }

    startTransition(async () => {
      setLoading(true);
      const formData = new FormData();
      if (sucursal?.id) formData.append("id", sucursal.id);
      formData.append("name", name);
      formData.append("address", address);
      formData.append("phone", phone);

      try {
        const res = sucursal?.id
          ? await updateBranchAction(formData)
          : await createBranchAction(formData);

        if (res.error) {
          setError(res.error);
        } else {
          NotificationService.success(
            "¡Éxito!",
            sucursal?.id ? "Sucursal actualizada correctamente." : "Nueva sucursal creada con éxito."
          );
          onSaved();
          onClose();
        }
      } catch (err: any) {
        setError(err.message || "Error al procesar la sucursal.");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
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
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
              {sucursal?.id ? `Editar: ${sucursal.name}` : "Nueva sucursal"}
            </h3>
            <button type="button" className="btn btn-ghost" style={{ padding: 6 }} onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          <div style={{ padding: 20, overflowY: "auto", maxHeight: "calc(88vh - 140px)" }}>
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 13,
                  marginBottom: 14,
                }}
              >
                {error}
              </div>
            )}

            <div style={{ fontWeight: 700, fontSize: 12.5, marginBottom: 12, color: "#0f172a" }}>
              Información general
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Nombre de la sucursal *</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Sucursal Centro"
                  required
                />
              </div>

              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Dirección</label>
                <input
                  className="input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ej. Av. Principal 123, Piso 2"
                />
              </div>

              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 600 }}>Teléfono de contacto</label>
                <input
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  placeholder="Ej. +56 9 1234 5678"
                />
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid #f1f5f9",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || isPending}>
              {loading && <Loader2 size={14} className="spin" style={{ marginRight: 6 }} />}
              {sucursal?.id ? "Guardar cambios" : "Crear sucursal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Sucursales() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Branch | null>(null);

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await getBranchesAction();
      if (res.branches) {
        setBranches(res.branches);
      }
    } catch (e) {
      // Keep state clean
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleDelete = async (b: Branch) => {
    const confirmed = await NotificationService.confirm(
      "¿Eliminar sucursal?",
      `¿Seguro que deseas eliminar ${b.name}?`
    );
    if (!confirmed) return;

    try {
      const res = await deleteBranchAction(b.id);
      if (res.error) {
        NotificationService.error("No se puede eliminar", res.error);
      } else {
        NotificationService.success("Eliminado", "Sucursal eliminada.");
        setBranches((prev) => prev.filter((item) => item.id !== b.id));
      }
    } catch (err: any) {
      NotificationService.error("Error", err.message || "No se pudo eliminar la sucursal.");
    }
  };

  const handleToggleStatus = async (b: Branch) => {
    try {
      const res = await toggleBranchStatusAction(b.id, b.is_active);
      if (res.error) {
        NotificationService.error("Error", res.error);
      } else {
        setBranches((prev) =>
          prev.map((item) => (item.id === b.id ? { ...item, is_active: !b.is_active } : item))
        );
        NotificationService.success(
          "Estado actualizado",
          `Sucursal ${!b.is_active ? "activada" : "desactivada"}.`
        );
      }
    } catch (err) {
      setBranches((prev) =>
        prev.map((item) => (item.id === b.id ? { ...item, is_active: !b.is_active } : item))
      );
    }
  };

  if (loading) {
    return (
      <div className="page-pad">
        <LoadingState title="Cargando sucursales..." subtitle="Obteniendo las sedes activas de tu negocio" cardCount={4} />
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
            Sucursales
          </h2>
          <p style={{ fontSize: 13, color: "#1e293b", marginTop: 2, fontWeight: 500 }}>
            {branches.length} sucursales registradas
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={15} /> Nueva sucursal
        </button>
      </div>

      <div className="grid-auto">
        {branches.map((s) => (
          <div key={s.id} className="card" style={{ padding: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: s.is_active ? "#eff6ff" : "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Building2 size={18} color={s.is_active ? "#2563eb" : "#475569"} />
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
                    {s.name}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(s)}
                    className={`badge ${s.is_active ? "badge-success" : "badge-neutral"}`}
                    style={{ marginTop: 4, cursor: "pointer", border: "none" }}
                  >
                    {s.is_active ? "Activa" : "Inactiva"}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: 13,
                  color: "#1e293b",
                  alignItems: "flex-start",
                  fontWeight: 500,
                }}
              >
                <MapPin size={14} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{s.address || "Dirección no especificada"}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: 13,
                  color: "#1e293b",
                  alignItems: "flex-start",
                  fontWeight: 500,
                }}
              >
                <Phone size={14} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{s.phone || "Sin teléfono registrado"}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  fontSize: 13,
                  color: "#1e293b",
                  alignItems: "flex-start",
                  fontWeight: 500,
                }}
              >
                <Clock size={14} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Lun–Vie: 08:00–18:00</span>
              </div>
            </div>

            <div style={{ paddingTop: 12, borderTop: "1px solid #f8fafc", display: "flex", gap: 8 }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setEditItem(s)}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Edit3 size={13} /> Editar
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleDelete(s)}
                style={{ color: "#dc2626", justifyContent: "center" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        <div
          onClick={() => setShowForm(true)}
          className="card"
          style={{
            padding: 20,
            cursor: "pointer",
            border: "1.5px dashed #cbd5e1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            minHeight: 180,
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
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={18} color="#0f172a" />
          </div>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a" }}>Registrar sucursal</span>
        </div>
      </div>

      {(showForm || editItem) && (
        <SucursalForm
          sucursal={editItem}
          onClose={() => {
            setShowForm(false);
            setEditItem(null);
          }}
          onSaved={loadBranches}
        />
      )}
    </div>
  );
}
