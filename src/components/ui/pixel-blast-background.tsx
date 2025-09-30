'use client';

import { useTheme } from 'next-themes';
import PixelBlast from './pixel-blast';

interface PixelBlastBackgroundProps {
  className?: string;
}

/**
 * Theme-aware PixelBlast background component
 * Automatically adjusts color and opacity based on light/dark mode
 * Configured for subtle, elegant effect that preserves text legibility
 */
export function PixelBlastBackground({ className }: PixelBlastBackgroundProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Light mode: Primary orange
  // Dark mode: Much brighter for visibility
  const color = isDark ? '#FF9955' : '#D97842'; // Very bright orange for dark mode

  return (
    <div className={className} style={{ opacity: 1 }}>
      <PixelBlast
        variant="circle"
        pixelSize={6}
        color={color}
        patternScale={3}
        patternDensity={3.0}
        pixelSizeJitter={0.3}
        enableRipples
        rippleSpeed={0.4}
        rippleThickness={0.1}
        rippleIntensityScale={1.5}
        liquid
        liquidStrength={0.1}
        liquidRadius={1.0}
        liquidWobbleSpeed={4}
        speed={0.5}
        edgeFade={0.3}
        transparent
      />
    </div>
  );
}