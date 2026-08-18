import React from 'react';

interface SectionHeadingProps {
  badge?: string | null;
  title: string;
  subtitle?: string | null;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({
  badge,
  title,
  subtitle,
  centered = true,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`space-y-3 ${centered ? 'text-center max-w-2xl mx-auto' : ''} ${className}`}>
      {badge && (
        <span className="inline-block text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
