import { Bell, Calendar, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import type { View } from "../App";
import { TENANT } from "../data/mock";

interface NavbarProps {
  view: View;
  isLoggedIn: boolean;
  onNavigate: (v: View) => void;
  onLogout: () => void;
  unreadCount: number;
}

export default function Navbar({ view, isLoggedIn, onNavigate, onLogout, unreadCount }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* On home page, hero is dark — use transparent/dark navbar. Elsewhere: white */
  const isHeroPage = view === "home";

  const navLinks: { label: string; anchor?: string; view?: View }[] = [
    { label: "Inicio", view: "home" },
    { label: "Servicios", anchor: "services" },
    { label: "Especialistas", anchor: "specialists" },
  ];

  const handleLink = (link: (typeof navLinks)[0]) => {
    if (link.view) {
      onNavigate(link.view);
    } else if (link.anchor) {
      if (view !== "home") { onNavigate("home"); setTimeout(() => document.getElementById(link.anchor!)?.scrollIntoView({ behavior: "smooth" }), 100); }
      else document.getElementById(link.anchor)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const transparent = isHeroPage && !scrolled;

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: transparent ? "rgba(12,10,26,0.6)" : "rgba(255,255,255,0.92)",
        backdropFilter: "blur(14px)",
        borderBottom: transparent ? "1px solid rgba(255,255,255,0.08)" : "1px solid var(--border)",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate("home")} className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: "linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)" }}
            >
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <span className={`font-display text-lg transition-colors ${transparent ? "text-white" : "text-foreground"}`}>
              {TENANT.name}
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleLink(link)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  transparent
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => onNavigate("notifications")}
                  className={`relative p-2 rounded-xl transition-colors ${transparent ? "text-white/70 hover:text-white hover:bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
                  )}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className={`flex items-center gap-2 p-1.5 pl-3 rounded-xl transition-colors ${transparent ? "hover:bg-white/10" : "hover:bg-secondary"}`}
                  >
                    <div className="w-7 h-7 rounded-full overflow-hidden border-2" style={{ borderColor: transparent ? "rgba(255,255,255,0.3)" : "var(--border)" }}>
                      <img src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&h=60&fit=crop&auto=format" alt="Perfil" className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm font-medium ${transparent ? "text-white" : "text-foreground"}`}>María José</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${menuOpen ? "rotate-180" : ""} ${transparent ? "text-white/60" : "text-muted-foreground"}`} />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-2xl shadow-xl border border-border overflow-hidden animate-scale-in">
                      <button onClick={() => { onNavigate("profile"); setMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm hover:bg-secondary transition-colors">
                        <User className="w-4 h-4" /> Mi perfil
                      </button>
                      <button onClick={() => { onNavigate("appointments"); setMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm hover:bg-secondary transition-colors">
                        <Calendar className="w-4 h-4" /> Mis citas
                      </button>
                      <div className="border-t border-border" />
                      <button onClick={() => { onLogout(); setMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-3 text-sm text-danger hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" /> Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate("login")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${transparent ? "text-white/70 hover:text-white" : "text-foreground hover:text-primary"}`}
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => onNavigate("booking")}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #4F35D2 0%, #7C3AED 100%)", boxShadow: "0 4px 14px rgba(79,53,210,0.35)" }}
                >
                  Agendar cita
                </button>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-2">
            {isLoggedIn && (
              <button onClick={() => onNavigate("notifications")} className="relative p-2">
                <Bell className={`w-5 h-5 ${transparent ? "text-white/80" : "text-muted-foreground"}`} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />}
              </button>
            )}
            {!isLoggedIn && (
              <button onClick={() => onNavigate("login")} className={`text-sm font-semibold ${transparent ? "text-white/80" : "text-primary"}`}>
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
