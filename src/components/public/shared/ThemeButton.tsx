import React from 'react';

interface ThemeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  buttonStyle?: 'rounded' | 'pill' | 'square' | 'sharp';
  children: React.ReactNode;
  asAnchor?: boolean;
  href?: string;
}

export function ThemeButton({
  variant = 'primary',
  size = 'md',
  buttonStyle = 'rounded',
  children,
  className = '',
  asAnchor = false,
  href,
  ...props
}: ThemeButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs font-semibold',
    md: 'px-6 py-3 text-sm font-semibold',
    lg: 'px-8 py-4 text-base font-bold',
  };

  const styleClasses = {
    rounded: 'rounded-xl',
    pill: 'rounded-full',
    square: 'rounded-md',
    sharp: 'rounded-none',
  };

  let variantStyles = '';
  if (variant === 'primary') {
    variantStyles =
      'bg-[var(--primary)] text-white hover:brightness-110 shadow-lg shadow-[var(--primary)]/25 active:scale-[0.98] transition-all duration-200';
  } else if (variant === 'secondary') {
    variantStyles =
      'bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface)]/80 border border-[var(--foreground)]/10 active:scale-[0.98] transition-all duration-200';
  } else if (variant === 'outline') {
    variantStyles =
      'border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white active:scale-[0.98] transition-all duration-200';
  } else if (variant === 'ghost') {
    variantStyles =
      'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] active:scale-[0.98] transition-all duration-200';
  }

  const baseClasses = `inline-flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 ${sizeClasses[size]} ${styleClasses[buttonStyle]} ${variantStyles} ${className}`;

  if (asAnchor && href) {
    return (
      <a href={href} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}
