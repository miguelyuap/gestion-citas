import { useState } from "react";
import {
  ArrowLeft, Calendar, CheckCircle2, Eye, EyeOff, Lock,
  Mail, Phone, Shield, User,
} from "lucide-react";
import type { View } from "../App";
import { TENANT } from "../data/mock";

interface AuthProps {
  onLogin?: () => void;
  onNavigate: (v: View) => void;
}

/* ─── Shared ─── */
function AuthShell({ children, title, subtitle, onBack }: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  onBack?: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel (desktop) */}
      <div className="hidden md:flex w-[45%] bg-primary flex-col justify-between p-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-display text-xl text-white">{TENANT.name}</span>
        </div>
        <div>
          <p className="font-display text-4xl text-white leading-tight mb-4">
            Tu bienestar, siempre a un clic de distancia.
          </p>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            Reserva tus citas de forma rápida y segura. Sin llamadas, sin esperas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {["photo-1494790108377-be9c29b29330", "photo-1438761681033-6461ffad8d80", "photo-1507003211169-0a1dd7228f2d"].map((id) => (
              <img
                key={id}
                src={`https://images.unsplash.com/${id}?w=60&h=60&fit=crop&auto=format`}
                className="w-8 h-8 rounded-full border-2 border-primary object-cover"
                alt=""
              />
            ))}
          </div>
          <p className="text-primary-foreground/70 text-xs">+500 clientes satisfechos</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 md:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl text-foreground">{TENANT.name}</span>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>
          )}

          <h1 className="font-display text-3xl text-foreground mb-1">{title}</h1>
          <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function Input({ label, type = "text", placeholder, value, onChange, icon, rightElement }: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-foreground block mb-1.5">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 text-sm text-foreground bg-muted border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary transition-colors placeholder:text-muted-foreground/60"
          style={{ paddingLeft: icon ? "2.75rem" : undefined, paddingRight: rightElement ? "3rem" : undefined }}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  );
}

/* ─── Login ─── */
export function LoginPage({ onLogin, onNavigate }: AuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    onLogin?.();
  };

  return (
    <AuthShell
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para gestionar tus citas."
      onBack={() => onNavigate("home")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          value={email}
          onChange={setEmail}
          icon={<Mail />}
        />
        <Input
          label="Contraseña"
          type={showPwd ? "text" : "password"}
          placeholder="Tu contraseña"
          value={password}
          onChange={setPassword}
          icon={<Lock />}
          rightElement={
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-muted-foreground hover:text-foreground transition-colors">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onNavigate("forgot-password")}
            className="text-xs text-primary font-medium hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Iniciando sesión...</>
          ) : "Iniciar sesión"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
        <div className="relative text-center"><span className="bg-background px-3 text-xs text-muted-foreground">o continúa con</span></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {["Google", "Apple"].map((provider) => (
          <button key={provider} className="py-3 border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
            {provider}
          </button>
        ))}
      </div>

      <p className="text-sm text-center text-muted-foreground mt-6">
        ¿No tienes cuenta?{" "}
        <button onClick={() => onNavigate("register")} className="text-primary font-semibold hover:underline">
          Crear cuenta
        </button>
      </p>
    </AuthShell>
  );
}

/* ─── Register ─── */
export function RegisterPage({ onLogin, onNavigate }: AuthProps) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", password: "", confirm: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pwdStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabels = ["", "Débil", "Media", "Fuerte"];
  const strengthColors = ["", "bg-danger", "bg-warning", "bg-success"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    onLogin?.();
  };

  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Únete para reservar citas en segundos."
      onBack={() => onNavigate("login")}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre" placeholder="María José" value={form.firstName} onChange={set("firstName")} icon={<User />} />
          <Input label="Apellido" placeholder="Pinto" value={form.lastName} onChange={set("lastName")} icon={<User />} />
        </div>
        <Input label="Correo electrónico" type="email" placeholder="tu@correo.com" value={form.email} onChange={set("email")} icon={<Mail />} />
        <Input label="Teléfono" type="tel" placeholder="+57 300 000 0000" value={form.phone} onChange={set("phone")} icon={<Phone />} />
        <Input
          label="Contraseña"
          type={showPwd ? "text" : "password"}
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={set("password")}
          icon={<Lock />}
          rightElement={
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-muted-foreground hover:text-foreground">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />
        {form.password.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((lvl) => (
                <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors ${pwdStrength >= lvl ? strengthColors[pwdStrength] : "bg-border"}`} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{strengthLabels[pwdStrength]}</p>
          </div>
        )}
        <Input label="Confirmar contraseña" type="password" placeholder="Repite tu contraseña" value={form.confirm} onChange={set("confirm")} icon={<Lock />} />

        <label className="flex items-start gap-3 cursor-pointer">
          <div
            onClick={() => setAgreed(!agreed)}
            className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${agreed ? "border-primary bg-primary" : "border-border"}`}
          >
            {agreed && <CheckCircle2 className="w-3 h-3 text-white" />}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Acepto los <a href="#" className="text-primary font-medium hover:underline">Términos y condiciones</a> y la{" "}
            <a href="#" className="text-primary font-medium hover:underline">Política de privacidad</a> de Studio Avara.
          </p>
        </label>

        <div className="flex items-center gap-2 px-3 py-2.5 bg-secondary rounded-xl">
          <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
          <p className="text-xs text-secondary-foreground">Tus datos están seguros y protegidos con cifrado SSL.</p>
        </div>

        <button
          type="submit"
          disabled={loading || !agreed || !form.firstName || !form.email || !form.password}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando cuenta...</>
          ) : "Crear cuenta"}
        </button>
      </form>

      <p className="text-sm text-center text-muted-foreground mt-6">
        ¿Ya tienes cuenta?{" "}
        <button onClick={() => onNavigate("login")} className="text-primary font-semibold hover:underline">
          Iniciar sesión
        </button>
      </p>
    </AuthShell>
  );
}

/* ─── Forgot Password ─── */
export function ForgotPasswordPage({ onNavigate }: AuthProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthShell
      title={sent ? "Revisa tu correo" : "Recuperar contraseña"}
      subtitle={sent ? `Enviamos un enlace de recuperación a ${email}` : "Ingresa tu correo para recibir un enlace de recuperación."}
      onBack={() => onNavigate("login")}
    >
      {sent ? (
        <div className="animate-scale-in">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-success" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
              Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
          </div>
          <button
            onClick={() => onNavigate("login")}
            className="w-full py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity"
          >
            Volver al inicio de sesión
          </button>
          <p className="text-xs text-center text-muted-foreground mt-4">
            ¿No llegó el correo?{" "}
            <button onClick={() => setSent(false)} className="text-primary font-medium hover:underline">
              Reenviar
            </button>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo electrónico"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={setEmail}
            icon={<Mail />}
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</>
            ) : "Enviar enlace de recuperación"}
          </button>
          <button
            type="button"
            onClick={() => onNavigate("login")}
            className="w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Volver al inicio de sesión
          </button>
        </form>
      )}
    </AuthShell>
  );
}
