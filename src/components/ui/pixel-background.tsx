'use client';

interface PixelBackgroundProps {
  className?: string;
}

/**
 * Simple, performant pixel-style background using CSS
 * Works reliably across all browsers without WebGL complexity
 */
export function PixelBackground({ className }: PixelBackgroundProps) {
  return (
    <div
      className={`${className}`}
      style={{
        background: `
          radial-gradient(circle at 20% 50%, rgba(255, 153, 85, 0.3) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(255, 153, 85, 0.25) 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, rgba(217, 120, 66, 0.2) 0%, transparent 50%),
          radial-gradient(circle at 60% 60%, rgba(255, 140, 66, 0.15) 0%, transparent 40%)
        `
      }}
    />
  );
}