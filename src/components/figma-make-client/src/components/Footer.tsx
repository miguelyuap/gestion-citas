import { Calendar, Mail, Phone, MapPin } from "lucide-react";
import type { View } from "../App";
import { TENANT } from "../data/mock";

interface FooterProps {
  onNavigate: (v: View) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-xl">{TENANT.name}</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              {TENANT.tagline}. Reserva tus citas de forma rápida, segura y sin complicaciones.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="#" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-xs font-bold">
                IG
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-xs font-bold">
                FB
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/80 uppercase tracking-wider">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-white/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                {TENANT.address}
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Phone className="w-4 h-4 shrink-0" />
                {TENANT.phone}
              </li>
              <li className="flex items-center gap-2.5 text-sm text-white/60">
                <Mail className="w-4 h-4 shrink-0" />
                {TENANT.email}
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white/80 uppercase tracking-wider">Accesos</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Inicio", view: "home" as View },
                { label: "Mis citas", view: "appointments" as View },
                { label: "Mi perfil", view: "profile" as View },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate(link.view)}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© 2026 {TENANT.name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white/70 transition-colors">Política de privacidad</a>
            <a href="#" className="hover:text-white/70 transition-colors">Términos y condiciones</a>
          </div>
          <p className="text-white/25">Powered by OmniCitas</p>
        </div>
      </div>
    </footer>
  );
}
