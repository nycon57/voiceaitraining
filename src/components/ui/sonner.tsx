'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={{
        '--normal-bg': 'hsl(var(--popover) / 0.95)',
        '--normal-text': 'var(--popover-foreground)',
        '--normal-border': 'var(--border)',
        '--success-bg': 'hsl(var(--popover) / 0.95)',
        '--success-text': 'hsl(142 76% 36%)',
        '--success-border': 'hsl(142 76% 36% / 0.2)',
        '--error-bg': 'hsl(var(--popover) / 0.95)',
        '--error-text': 'hsl(var(--destructive))',
        '--error-border': 'hsl(var(--destructive) / 0.2)',
        '--warning-bg': 'hsl(var(--popover) / 0.95)',
        '--warning-text': 'hsl(38 92% 50%)',
        '--warning-border': 'hsl(38 92% 50% / 0.2)',
        '--info-bg': 'hsl(var(--popover) / 0.95)',
        '--info-text': 'hsl(217 91% 60%)',
        '--info-border': 'hsl(217 91% 60% / 0.2)',
      }}
      toastOptions={{
        style: {
          backdropFilter: 'blur(8px)',
          border: '1px solid hsl(var(--border) / 0.5)',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-geist-sans)',
        },
        classNames: {
          title: 'font-headline font-medium',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
          cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80 transition-colors',
          closeButton: 'bg-background text-foreground hover:bg-accent transition-colors',
        },
      }}
      position="bottom-right"
      expand={true}
      richColors={true}
      {...props}
    />
  );
};

export { Toaster };
