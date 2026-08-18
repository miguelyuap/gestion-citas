'use client';

import React from 'react';
import { TenantTheme } from '@/types/theme';

interface ThemeProviderProps {
  theme: TenantTheme;
  children: React.ReactNode;
  className?: string;
}

export function ThemeProvider({ theme, children, className = '' }: ThemeProviderProps) {
  const fontFamilyName = theme.font_family || 'Inter';
  const formattedFont = fontFamilyName.replace(/\s+/g, '+');
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    formattedFont
  )}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap`;

  const cssVariables = {
    '--primary': theme.primary_color,
    '--secondary': theme.secondary_color,
    '--background': theme.background_color,
    '--surface': theme.surface_color,
    '--foreground': theme.text_color,
    '--muted': theme.muted_text_color,
    '--accent': theme.accent_color || '#f59e0b',
    '--radius': theme.border_radius || '0.75rem',
    '--font-family': `"${fontFamilyName}", sans-serif`,
    fontFamily: `"${fontFamilyName}", system-ui, -apple-system, sans-serif`,
  } as React.CSSProperties;

  return (
    <>
      {/* Cargar dinámicamente Google Fonts */}
      <link rel="stylesheet" href={googleFontUrl} />
      <div
        style={cssVariables}
        className={`min-h-screen text-[var(--foreground)] bg-[var(--background)] transition-colors duration-300 ${className}`}
      >
        {children}
      </div>
    </>
  );
}
