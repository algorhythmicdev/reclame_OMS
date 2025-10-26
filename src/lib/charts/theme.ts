import type { ApexOptions } from 'apexcharts';
import { get } from 'svelte/store';
import { theme, type ThemeName } from '$lib/stores/theme';

const FALLBACKS = {
  text: '#e7e7ee',
  grid: 'rgba(255,255,255,0.14)'
};

function readCssVariable(name: string) {
  if (typeof window === 'undefined') return undefined;
  const styles = getComputedStyle(document.documentElement);
  const value = styles.getPropertyValue(name);
  return value?.trim() || undefined;
}

function paletteFor(activeTheme?: ThemeName) {
  const text = readCssVariable('--text') || FALLBACKS.text;
  const muted = readCssVariable('--muted') || FALLBACKS.grid;
  return { text, grid: muted, theme: activeTheme === 'LightVim' ? 'light' : 'dark' };
}

export function withTheme(options: ApexOptions, activeTheme?: ThemeName): ApexOptions {
  const palette = paletteFor(activeTheme ?? get(theme));
  return {
    ...options,
    chart: {
      background: 'transparent',
      foreColor: palette.text,
      ...(options.chart ?? {})
    },
    colors: options.colors ?? ['var(--brand-violet)', 'var(--brand-amber)'],
    grid: {
      borderColor: palette.grid,
      strokeDashArray: options.grid?.strokeDashArray ?? 3,
      ...(options.grid ?? {})
    },
    tooltip: {
      theme: palette.theme,
      ...(options.tooltip ?? {})
    }
  };
}
