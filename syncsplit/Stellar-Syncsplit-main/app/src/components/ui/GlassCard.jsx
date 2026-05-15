import { motion } from 'motion/react';

/**
 * Glassmorphic card component from the Kinetic Midnight design system.
 * Applies backdrop-blur, kinetic border, and inner-stroke.
 */
export default function GlassCard({
  children,
  className = '',
  glow = false,
  as = 'div',
  animate = true,
  delay = 0,
  ...props
}) {
  const Component = animate ? motion.create(as) : as;

  const baseClasses = [
    'glass-card',
    'kinetic-border',
    'rounded-2xl',
    'relative',
    'overflow-hidden',
    glow ? 'hover:shadow-[0_0_40px_rgba(124,58,237,0.15)] transition-shadow duration-500' : '',
    className,
  ].filter(Boolean).join(' ');

  if (!animate) {
    return (
      <Component className={baseClasses} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={baseClasses}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      {...props}
    >
      {children}
    </Component>
  );
}
