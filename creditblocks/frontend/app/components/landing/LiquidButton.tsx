'use client';

import React, { ReactNode } from 'react';

interface LiquidButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  external?: boolean;
  // Legacy props (kept for backward compatibility, not used)
  mouseContainer?: React.RefObject<HTMLDivElement>;
}

const variantClass: Record<NonNullable<LiquidButtonProps['variant']>, string> = {
  primary: 'btn-gold',
  secondary: 'btn-silver',
  ghost: 'btn-ghost',
};

export const LiquidButton: React.FC<LiquidButtonProps> = ({
  children,
  onClick,
  href,
  variant = 'primary',
  className = '',
  disabled = false,
  external = false,
}) => {
  const cls = `${variantClass[variant]} ${className}`.trim();

  if (href) {
    return (
      <a
        href={href}
        className={cls}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
};

export default LiquidButton;
