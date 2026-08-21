import { Bell, Calendar, CalendarDays, Home, User } from "lucide-react";
import { useRef, useLayoutEffect, useState } from "react";
import type { View } from "../App";

interface BottomNavProps {
  view: View;
  isLoggedIn: boolean;
  onNavigate: (v: View) => void;
  onBooking: () => void;
  unreadCount: number;
}

interface NavItem {
  label: string;
  icon: (active: boolean) => React.ReactNode;
  action: () => void;
  matchViews: View[];
  key: string;
}

export default function BottomNav({ view, isLoggedIn, onNavigate, onBooking, unreadCount }: BottomNavProps) {
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  const items: NavItem[] = [
    {
      key: "home",
      label: "Inicio",
      icon: (a) => <Home className={`w-5 h-5 transition-transform ${a ? "scale-110" : ""}`} />,
      action: () => onNavigate("home"),
      matchViews: ["home"],
    },
    {
      key: "booking",
      label: "Agendar",
      icon: (a) => <CalendarDays className={`w-5 h-5 transition-transform ${a ? "scale-110" : ""}`} />,
      action: onBooking,
      matchViews: ["booking", "booking-confirmed"],
    },
    {
      key: "appointments",
      label: "Mis citas",
      icon: (a) => <Calendar className={`w-5 h-5 transition-transform ${a ? "scale-110" : ""}`} />,
      action: () => isLoggedIn ? onNavigate("appointments") : onNavigate("login"),
      matchViews: ["appointments"],
    },
    {
      key: "notifications",
      label: "Alertas",
      icon: (a) => (
        <div className="relative">
          <Bell className={`w-5 h-5 transition-transform ${a ? "scale-110" : ""}`} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount}
            </span>
          )}
        </div>
      ),
      action: () => isLoggedIn ? onNavigate("notifications") : onNavigate("login"),
      matchViews: ["notifications"],
    },
    {
      key: "profile",
      label: "Perfil",
      icon: (a) => <User className={`w-5 h-5 transition-transform ${a ? "scale-110" : ""}`} />,
      action: () => isLoggedIn ? onNavigate("profile") : onNavigate("login"),
      matchViews: ["profile"],
    },
  ];

  const activeIndex = items.findIndex((item) => item.matchViews.includes(view));

  useLayoutEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el) {
      const rect = el.getBoundingClientRect();
      const parentRect = el.parentElement?.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - (parentRect?.left ?? 0) + rect.width / 2 - 16,
        width: 32,
      });
    }
  }, [activeIndex]);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="relative flex items-stretch">
        {/* Sliding pill indicator */}
        {activeIndex >= 0 && (
          <div
            className="absolute top-1.5 h-1 rounded-full bg-primary transition-all duration-350 ease-out"
            style={{ left: indicatorStyle.left, width: indicatorStyle.width }}
          />
        )}

        {items.map((item, i) => {
          const isActive = item.matchViews.includes(view);
          return (
            <button
              key={item.key}
              ref={(el) => { itemRefs.current[i] = el; }}
              onClick={item.action}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 pt-4 transition-colors duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon(isActive)}
              <span className={`text-[10px] font-medium transition-all ${isActive ? "text-primary" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
