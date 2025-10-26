import { writable } from 'svelte/store';

export type ThemeName = 'LightVim'|'DarkVim'|'HighContrastVim';
const isBrowser = typeof window !== 'undefined';
const startup = isBrowser ? (localStorage.getItem('rf_theme') as ThemeName) || 'DarkVim' : 'DarkVim';

export const theme = writable<ThemeName>(startup);

theme.subscribe((t) => {
  if (!isBrowser) return;
  localStorage.setItem('rf_theme', t);
  document.documentElement.setAttribute('data-theme', t);
});
