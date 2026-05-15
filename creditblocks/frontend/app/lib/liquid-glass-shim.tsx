/**
 * Fallback implementation of liquid-glass-react for when the package is not installed.
 * This provides basic styling without the advanced WebGL displacement effects.
 */

import React, { ReactNode } from 'react';

interface LiquidGlassProps {
  children?: ReactNode;
  mode?: 'standard' | 'prominent' | 'shader' | 'polar';
  mouseContainer?: React.RefObject<HTMLElement>;
  className?: string;
}

const modeStyles: Record<string, React.CSSProperties> = {
  standard: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
  },
  prominent: {
    background: 'rgba(255, 255, 255, 0.09)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  },
  shader: {
    background: 'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(124,58,237,0.06) 50%, rgba(6,182,212,0.06))',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  polar: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.10)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
};

export const LiquidGlassShim: React.FC<LiquidGlassProps> = ({
  children,
  mode = 'standard',
  className = '',
}) => {
  return (
    <div style={modeStyles[mode]} className={className}>
      {children}
    </div>
  );
};

export default LiquidGlassShim;
