"use client";

import { useState, useEffect } from "react";
import { Search, Plus, ChevronUp, ChevronDown, ChevronRight, X, UserCircle, Calendar, AlertCircle } from "lucide-react";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { getAdminClientsAction, createAdminClientAction, ClientWithStats } from "@/app/(dashboard)/clients/actions";
import { LoadingState } from "@/components/figma-make/components/LoadingSpinner";

const PAGE_SIZE = 8;

interface ClienteFormProps {
  onClose: () => void;
  onSuccess: (newClient: ClientWithStats) => void;
}

function ClienteForm({ onClose, onSuccess }: ClienteFormProps) {
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones básicas frontend
    if (!name.trim()) {
      setError("El nombre del cliente es obligatorio.");
      return;
    }
    if (!email.trim()) {
      setError("El correo electrónico es obligatorio.");
      return;
    }
    if (!phone.trim()) {
      setError("El número de teléfono/WhatsApp es obligatorio.");
      return;
    }
    if (password && password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await createAdminClientAction({
        name: name.trim(),
        lastName: lastName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim(),
        password: password ? password.trim() : undefined,
        notes: notes.trim() || undefined,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      if (res.success && res.client) {
        const createdClient: ClientWithStats = {
          ...res.client,
          citasCount: 0,
          ultimaCita: "Sin citas",
          proximaCita: "Sin agendar",
          estado: "Nuevo",
        };
        onSuccess(createdClient);
        onClose();
      }
    } catch (err: any) {
      setError("Ocurrió un error inesperado al registrar el cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#0f172a" }}>
            Nuevo cliente
          </h3>
          <button className="btn btn-ghost" style={{ padding: 6, color: "#0f172a" }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {error && (
              <div
                style={{
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 8,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#991b1b",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <AlertCircle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>
                  Nombre *
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Ej. María"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ color: "#0f172a", fontWeight: 500 }}
                  required
                />
              </div>

              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>
                  Apellido
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Ej. González"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={{ color: "#0f172a", fontWeight: 500 }}
                />
              </div>

              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>
                  Correo electrónico *
                </label>
                <input
                  className="input"
                  type="email"
                  placeholder="cliente@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ color: "#0f172a", fontWeight: 500 }}
                  required
                />
              </div>

              <div>
                <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>
                  Teléfono / WhatsApp *
                </label>
                <input
                  className="input"
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ color: "#0f172a", fontWeight: 500 }}
                  required
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>
                  Contraseña de acceso (Opcional)
                </label>
                <input
                  className="input"
                  type="password"
                  placeholder="Mínimo 6 caracteres si deseas otorgar acceso al portal cliente"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ color: "#0f172a", fontWeight: 500 }}
                />
                <span style={{ fontSize: 11.5, color: "#334155", marginTop: 4, display: "block" }}>
                  Si asignas contraseña, el cliente podrá iniciar sesión en el portal público.
                </span>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label className="label" style={{ color: "#0f172a", fontWeight: 700, fontSize: 13 }}>
                  Observaciones / Notas
                </label>
                <textarea
                  className="input"
                  rows={2}
                  placeholder="Preferencias o notas sobre el cliente..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{ resize: "none", color: "#0f172a", fontWeight: 500 }}
                />
              </div>
            </div>
          </div>

          <div style={{ padding: "14px 20px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button type="button" className="btn btn-outline" style={{ color: "#0f172a", fontWeight: 600 }} onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Guardando cliente..." : "Guardar cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClienteDetail({ cliente, onClose }: { cliente: ClientWithStats; onClose: () => void }) {
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0]?.[0] || "C").toUpperCase();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 580 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "18px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #2563eb, #6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {getInitials(cliente.name)}
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "#0f172a" }}>
                {cliente.name}
              </h3>
              <span className={`badge ${cliente.estado === "Activo" ? "badge-success" : "badge-neutral"}`} style={{ color: cliente.estado === "Activo" ? "#15803d" : "#0f172a" }}>
                {cliente.estado}
              </span>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ padding: 6, color: "#0f172a" }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20, overflowY: "auto" }}>
          {/* Tarjetas de Estadísticas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Total citas", value: cliente.citasCount },
              { label: "Última cita", value: cliente.ultimaCita },
              { label: "Próxima cita", value: cliente.proximaCita },
            ].map((s) => (
              <div key={s.label} style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#1e293b", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {s.label}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#0f172a" }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Información Personal */}
          <div style={{ background: "#f8fafc", borderRadius: 10, border: "1px solid #cbd5e1", padding: "16px", marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 12 }}>
              Información del cliente
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              {[
                ["Nombre completo", cliente.name],
                ["Correo electrónico", cliente.email],
                ["Teléfono / WhatsApp", cliente.phone],
                ["Cuenta de usuario", cliente.user_id ? "Registrado en portal" : "Sin acceso al portal"],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 11.5, color: "#334155", fontWeight: 700, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0f172a", wordBreak: "break-all" }}>{v}</div>
                </div>
              ))}
            </div>

            {cliente.notes && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11.5, color: "#334155", fontWeight: 700, marginBottom: 3 }}>Observaciones / Notas</div>
                <div style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>{cliente.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Clientes() {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<ClientWithStats | null>(null);
  const [sort, setSort] = useState<"name" | "citas">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminClientsAction();
      if (res.error) {
        setError(res.error);
      } else if (res.clients) {
        setClients(res.clients);
      }
    } catch (err: any) {
      setError("Error al cargar la lista de clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleClientCreated = (newClient: ClientWithStats) => {
    setClients((prev) => [newClient, ...prev]);
    setToastMsg(`Cliente ${newClient.name} creado exitosamente.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const filtered = clients
    .filter((c) => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const v =
        sort === "name"
          ? a.name.localeCompare(b.name)
          : a.citasCount - b.citasCount;
      return sortDir === "asc" ? v : -v;
    });

  const pages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (col: "name" | "citas") => {
    if (sort === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(col);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: string }) =>
    sort === col ? (
      sortDir === "asc" ? (
        <ChevronUp size={14} color="#0f172a" />
      ) : (
        <ChevronDown size={14} color="#0f172a" />
      )
    ) : null;

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (parts[0]?.[0] || "C").toUpperCase();
  };

  if (loading) {
    return (
      <div className="page-pad">
        <LoadingState
          title="Cargando lista de clientes..."
          subtitle="Obteniendo la lista de clientes registrados en tu negocio"
          cardCount={6}
        />
      </div>
    );
  }

  return (
    <div className="page-pad fade-in">
      {/* Toast Notificación */}
      {toastMsg && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: "#10b981",
            color: "white",
            padding: "12px 18px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            fontWeight: 600,
            fontSize: 14,
            zIndex: 2000,
          }}
        >
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "#0f172a" }}>
            Clientes
          </h2>
          <p style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 500, marginTop: 2 }}>
            {clients.length} clientes registrados en tu negocio
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> {isMobile ? "Nuevo" : "Nuevo cliente"}
        </button>
      </div>

      {/* Búsqueda */}
      <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
        <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#1e293b" }} />
        <input
          className="input"
          style={{ paddingLeft: 38, color: "#0f172a", fontWeight: 500 }}
          placeholder="Buscar cliente por nombre, correo o teléfono..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Alerta de Error */}
      {error && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 16,
            color: "#991b1b",
            fontSize: 14,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertCircle size={18} color="#dc2626" />
          <span>{error}</span>
        </div>
      )}

      {isMobile ? (
        /* Mobile View: Card List */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {paginated.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", background: "white", borderRadius: 10, border: "1px solid #e2e8f0" }}>
              <UserCircle size={40} color="#94a3b8" style={{ margin: "0 auto 10px" }} />
              <div style={{ color: "#0f172a", fontSize: 14, fontWeight: 600 }}>No se encontraron clientes</div>
            </div>
          ) : (
            paginated.map((c) => (
              <div
                key={c.id}
                className="card"
                style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, cursor: "pointer" }}
                onClick={() => setSelected(c)}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: "linear-gradient(135deg, #2563eb, #6366f1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {getInitials(c.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: "#0f172a" }}>{c.name}</div>
                    <div style={{ fontSize: 12.5, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.email}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                      <span className={`badge ${c.estado === "Activo" ? "badge-success" : "badge-neutral"}`} style={{ color: c.estado === "Activo" ? "#15803d" : "#0f172a" }}>
                        {c.estado}
                      </span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#0f172a", fontWeight: 600 }}>
                        {c.citasCount} citas
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} color="#0f172a" style={{ flexShrink: 0 }} />
              </div>
            ))
          )}
        </div>
      ) : (
        /* Desktop View: Tabla */
        <div className="card">
          <div className="table-scroll">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 130px 180px 80px 110px 90px 90px",
                gap: 12,
                padding: "12px 18px",
                borderBottom: "2px solid #e2e8f0",
                fontSize: 12,
                fontWeight: 800,
                color: "#0f172a",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                minWidth: 740,
                background: "#f8fafc",
              }}
            >
              <span style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onClick={() => toggleSort("name")}>
                Nombre <SortIcon col="name" />
              </span>
              <span>Teléfono</span>
              <span>Correo electrónico</span>
              <span style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }} onClick={() => toggleSort("citas")}>
                Citas <SortIcon col="citas" />
              </span>
              <span>Última cita</span>
              <span>Estado</span>
              <span>Acciones</span>
            </div>

            {paginated.length === 0 ? (
              <div style={{ padding: 60, textAlign: "center" }}>
                <UserCircle size={44} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>No se encontraron clientes registrados</div>
              </div>
            ) : (
              paginated.map((c, i) => (
                <div
                  key={c.id}
                  className="table-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.2fr 130px 180px 80px 110px 90px 90px",
                    gap: 12,
                    padding: "14px 18px",
                    alignItems: "center",
                    minWidth: 740,
                    borderBottom: i < paginated.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: "linear-gradient(135deg, #2563eb, #6366f1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {getInitials(c.name)}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{c.name}</span>
                  </div>

                  <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                    {c.phone}
                  </span>

                  <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.email}
                  </span>

                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>
                    {c.citasCount}
                  </span>

                  <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 500 }}>
                    {c.ultimaCita}
                  </span>

                  <div>
                    <span className={`badge ${c.estado === "Activo" ? "badge-success" : "badge-neutral"}`} style={{ color: c.estado === "Activo" ? "#15803d" : "#0f172a" }}>
                      {c.estado}
                    </span>
                  </div>

                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelected(c)}
                    style={{ gap: 4, padding: "4px 10px", color: "#0f172a", fontWeight: 700 }}
                  >
                    Ver <ChevronRight size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Paginación */}
          {pages > 1 && (
            <div
              style={{
                padding: "14px 18px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 10,
                background: "#f8fafc",
              }}
            >
              <span style={{ fontSize: 13, color: "#0f172a", fontWeight: 600 }}>
                Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} clientes
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{ color: "#0f172a", fontWeight: 600 }}
                >
                  <ChevronRight size={14} style={{ transform: "rotate(180deg)" }} />
                </button>
                {[...Array(pages)].map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${page === i + 1 ? "btn-primary" : "btn-outline"}`}
                    onClick={() => setPage(i + 1)}
                    style={{ minWidth: 32, fontWeight: 700, color: page === i + 1 ? "white" : "#0f172a" }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="btn btn-outline btn-sm"
                  disabled={page === pages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{ color: "#0f172a", fontWeight: 600 }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showForm && <ClienteForm onClose={() => setShowForm(false)} onSuccess={handleClientCreated} />}
      {selected && <ClienteDetail cliente={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
