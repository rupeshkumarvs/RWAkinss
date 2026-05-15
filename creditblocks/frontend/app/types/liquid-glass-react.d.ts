declare module 'liquid-glass-react' {
  import React from 'react';

  interface LiquidGlassProps {
    children?: React.ReactNode;
    mode?: 'standard' | 'prominent' | 'shader' | 'polar';
    mouseContainer?: React.RefObject<HTMLElement>;
    className?: string;
  }

  const LiquidGlass: React.FC<LiquidGlassProps>;
  export default LiquidGlass;
}
