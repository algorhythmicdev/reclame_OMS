import { writable } from 'svelte/store';

export type ThemeName = 'LightVim' | 'DarkVim' | 'HighContrastVim';
const THEME_KEY = 'rf_theme';
const isBrowser = typeof window !== 'undefined';

const initial: ThemeName =
  (isBrowser && (localStorage.getItem(THEME_KEY) as ThemeName)) || 'DarkVim';

export const theme = writable<ThemeName>(initial);

function apply(t: ThemeName) {
  if (!isBrowser) return;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(THEME_KEY, t);
}

if (isBrowser) apply(initial);
theme.subscribe((t) => apply(t));
