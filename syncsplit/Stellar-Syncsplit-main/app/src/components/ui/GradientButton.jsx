import { motion } from 'motion/react';

/**
 * Gradient button with animated background shift and loading state.
 *
 * Variants:
 *  - primary: violet→pink gradient (default)
 *  - secondary: glassmorphic
 *  - ghost: transparent with text color
 */
export default function GradientButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  icon,
  variant = 'primary',
  className = '',
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const isDisabled = disabled || loading;

  const variants = {
    primary: [
      'gradient-btn',
      'text-on-primary-fixed',
      'font-headline font-black uppercase tracking-tight',
      'rounded-xl',
      'shadow-lg shadow-primary-container/20',
    ].join(' '),
    secondary: [
      'bg-surface-container-highest/40 backdrop-blur-xl',
      'border border-outline-variant/20',
      'text-on-surface',
      'font-headline font-bold',
      'rounded-xl',
      'hover:bg-surface-container-highest transition-all duration-300',
    ].join(' '),
    ghost: [
      'bg-transparent',
      'text-primary',
      'font-headline font-bold',
      'hover:bg-primary/10 transition-all duration-300',
      'rounded-xl',
    ].join(' '),
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        'relative flex items-center justify-center gap-3',
        'px-8 py-4',
        fullWidth ? 'w-full' : '',
        variants[variant] || variants.primary,
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].filter(Boolean).join(' ')}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {icon && (
            <span className="material-symbols-outlined text-lg">
              {icon}
            </span>
          )}
          {children}
        </>
      )}
    </motion.button>
  );
}
