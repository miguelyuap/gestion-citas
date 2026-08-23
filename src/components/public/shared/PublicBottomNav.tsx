'use client';

import React from 'react';
import { Home, CalendarDays, Calendar, Bell, User } from 'lucide-react';

interface PublicBottomNavProps {
  activeView: 'landing' | 'booking' | 'appointments' | 'profile';
  isAuthenticated: boolean;
  onNavigateView: (view: 'landing' | 'booking' | 'appointments' | 'profile') => void;
  onOpenAuth?: (tab: 'login' | 'register') => void;
  unreadCount?: number;
}

export function PublicBottomNav({
  activeView,
  isAuthenticated,
  onNavigateView,
  onOpenAuth,
  unreadCount = 0,
}: PublicBottomNavProps) {
  const items = [
    {
      label: 'Inicio',
      icon: <Home className="w-5 h-5" />,
      action: () => onNavigateView('landing'),
      isActive: activeView === 'landing',
    },
    {
      label: 'Agendar',
      icon: <CalendarDays className="w-5 h-5" />,
      action: () => {
        if (isAuthenticated) onNavigateView('booking');
        else if (onOpenAuth) onOpenAuth('login');
        else onNavigateView('booking');
      },
      isActive: activeView === 'booking',
    },
    {
      label: 'Mis citas',
      icon: <Calendar className="w-5 h-5" />,
      action: () => {
        if (isAuthenticated) onNavigateView('appointments');
        else if (onOpenAuth) onOpenAuth('login');
      },
      isActive: activeView === 'appointments',
    },
    {
      label: 'Perfil',
      icon: <User className="w-5 h-5" />,
      action: () => {
        if (isAuthenticated) onNavigateView('profile');
        else if (onOpenAuth) onOpenAuth('login');
      },
      isActive: activeView === 'profile',
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--card)]/95 backdrop-blur-md border-t border-[var(--border)] font-[var(--font-sans)]">
      <div className="flex items-stretch">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-colors ${
              item.isActive ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
            }`}
          >
            {item.icon}
            <span className={`text-[10px] font-medium ${item.isActive ? 'text-[var(--primary)]' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
