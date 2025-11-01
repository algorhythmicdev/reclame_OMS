import { writable } from 'svelte/store';

type Prefs = {
  theme: 'LightVim'|'DarkVim'|'HighContrastVim',
  density: 'compact'|'cozy'|'comfortable',
  fontScale: number
};

const isBrowser = typeof window !== 'undefined';

const init: Prefs = {
  theme: (isBrowser ? localStorage.getItem('rf_theme') : null) as any || 'LightVim',
  density: (isBrowser ? localStorage.getItem('rf_density') : null) as any || 'cozy',
  fontScale: +(isBrowser ? localStorage.getItem('rf_font') || '1.0' : '1.0')
};

export const ui = writable<Prefs>(init);

ui.subscribe(p => {
  if (!isBrowser) return;
  document.documentElement.dataset.theme   = p.theme;
  document.documentElement.dataset.density = p.density;
  document.documentElement.style.setProperty('--font-scale', String(p.fontScale));
  localStorage.setItem('rf_theme', p.theme);
  localStorage.setItem('rf_density', p.density);
  localStorage.setItem('rf_font', String(p.fontScale));
});
