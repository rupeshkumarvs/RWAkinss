/**
 * Pulsing skeleton loader matching the Kinetic Midnight tonal system.
 */
export default function LoadingSkeleton({
  width = '100%',
  height = '1rem',
  rounded = 'rounded-md',
  className = '',
  count = 1,
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-surface-container-high ${rounded} ${className}`}
          style={{ width, height }}
        />
      ))}
    </>
  );
}
