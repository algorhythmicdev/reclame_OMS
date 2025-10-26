import { writable } from 'svelte/store';

export type ThemeName = 'LightVim' | 'DarkVim' | 'HighContrastVim';

const isBrowser = typeof window !== 'undefined';
const startup = (isBrowser ? (localStorage.getItem('rf_theme') as ThemeName | null) : null) || 'DarkVim';

export const theme = writable<ThemeName>(startup);

theme.subscribe((value) => {
  if (!isBrowser) return;
  localStorage.setItem('rf_theme', value);
  document.documentElement.setAttribute('data-theme', value);
});
