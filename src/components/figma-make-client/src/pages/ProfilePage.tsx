import { useState } from "react";
import {
  Bell, Camera, ChevronRight, Edit3, KeyRound, LogOut,
  Mail, MessageSquare, Phone, Save, Shield, User, X,
} from "lucide-react";

interface ProfilePageProps {
  onLogout: () => void;
}

export default function ProfilePage({ onLogout }: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "María José",
    lastName: "Pinto",
    email: "mariajose@correo.com",
    phone: "+57 312 456 7890",
  });
  const [prefs, setPrefs] = useState({
    notifications: true,
    reminders: true,
    marketing: false,
  });
  const [showLogout, setShowLogout] = useState(false);

  const handleSave = () => setEditing(false);

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-display text-2xl text-foreground mb-7">Mi perfil</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-card shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&auto=format"
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:opacity-90 transition-opacity">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="font-display text-xl text-foreground mt-3">{form.firstName} {form.lastName}</p>
        <p className="text-sm text-muted-foreground">{form.email}</p>
      </div>

      {/* Personal info */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Información personal</p>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Editar
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => setEditing(false)} className="text-xs text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <Save className="w-3.5 h-3.5" />
                Guardar
              </button>
            </div>
          )}
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Nombre"
              icon={<User />}
              value={form.firstName}
              editing={editing}
              onChange={(v) => setForm((f) => ({ ...f, firstName: v }))}
            />
            <FormField
              label="Apellido"
              icon={<User />}
              value={form.lastName}
              editing={editing}
              onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}
            />
          </div>
          <FormField
            label="Correo electrónico"
            icon={<Mail />}
            value={form.email}
            editing={editing}
            type="email"
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          />
          <FormField
            label="Teléfono"
            icon={<Phone />}
            value={form.phone}
            editing={editing}
            type="tel"
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
        <p className="text-sm font-semibold text-foreground px-5 py-4 border-b border-border">Seguridad</p>
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <KeyRound className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Cambiar contraseña</p>
              <p className="text-xs text-muted-foreground">Última actualización hace 3 meses</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="border-t border-border" />
        <button className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <Shield className="w-4 h-4" />
            </div>
            <p className="text-sm font-medium text-foreground">Verificación en 2 pasos</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Preferences */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
        <p className="text-sm font-semibold text-foreground px-5 py-4 border-b border-border">Preferencias</p>
        <div className="p-5 space-y-4">
          <Toggle
            icon={<Bell />}
            label="Notificaciones"
            description="Recibe alertas sobre tus citas"
            value={prefs.notifications}
            onChange={(v) => setPrefs((p) => ({ ...p, notifications: v }))}
          />
          <Toggle
            icon={<Bell />}
            label="Recordatorios de citas"
            description="Avisos 24h antes de tu cita"
            value={prefs.reminders}
            onChange={(v) => setPrefs((p) => ({ ...p, reminders: v }))}
          />
          <Toggle
            icon={<MessageSquare />}
            label="Comunicaciones del negocio"
            description="Novedades, promociones y noticias"
            value={prefs.marketing}
            onChange={(v) => setPrefs((p) => ({ ...p, marketing: v }))}
          />
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => setShowLogout(true)}
        className="w-full flex items-center justify-center gap-2 py-3 text-danger font-semibold text-sm rounded-2xl border border-danger/30 hover:bg-red-50 transition-colors mt-2"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>

      {/* Logout confirm */}
      {showLogout && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card rounded-2xl p-6 animate-slide-up">
            <h3 className="font-display text-xl text-foreground mb-2">¿Cerrar sesión?</h3>
            <p className="text-sm text-muted-foreground mb-6">Tendrás que iniciar sesión nuevamente para gestionar tus citas.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogout(false)} className="flex-1 py-2.5 bg-muted text-foreground font-semibold text-sm rounded-xl hover:bg-border transition-colors">
                Cancelar
              </button>
              <button onClick={onLogout} className="flex-1 py-2.5 bg-danger text-white font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, icon, value, editing, type = "text", onChange }: {
  label: string;
  icon: React.ReactNode;
  value: string;
  editing: boolean;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">{label}</label>
      {editing ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2.5 text-sm text-foreground bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors"
        />
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-xl">
          <span className="text-muted-foreground [&>svg]:w-3.5 [&>svg]:h-3.5">{icon}</span>
          <span className="text-sm text-foreground">{value}</span>
        </div>
      )}
    </div>
  );
}

function Toggle({ icon, label, description, value, onChange }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary shrink-0 [&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-border"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}
