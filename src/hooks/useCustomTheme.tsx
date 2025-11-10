import { useEffect } from 'react';
import { useTheme } from 'next-themes';

export interface CustomTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  card: string;
  border: string;
}

export const useCustomTheme = (customTheme: CustomTheme | null) => {
  const { theme } = useTheme();

  useEffect(() => {
    if (customTheme && theme === 'custom') {
      const root = document.documentElement;
      
      // Apply custom theme colors
      root.style.setProperty('--primary', customTheme.primary);
      root.style.setProperty('--secondary', customTheme.secondary);
      root.style.setProperty('--accent', customTheme.accent);
      root.style.setProperty('--background', customTheme.background);
      root.style.setProperty('--foreground', customTheme.foreground);
      root.style.setProperty('--muted', customTheme.muted);
      root.style.setProperty('--card', customTheme.card);
      root.style.setProperty('--border', customTheme.border);
    } else if (theme !== 'custom') {
      // Remove custom overrides when switching away from custom theme
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--secondary');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--background');
      root.style.removeProperty('--foreground');
      root.style.removeProperty('--muted');
      root.style.removeProperty('--card');
      root.style.removeProperty('--border');
    }
  }, [customTheme, theme]);
};
