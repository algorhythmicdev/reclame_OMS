import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Scale = 'sm' | 'md' | 'lg' | 'xl';

const KEY = 'rf_scale';
const SCALE_TO_REM: Record<Scale, string> = {
  sm: '14px',
  md: '16px',
  lg: '18px',
  xl: '20px'
};

function readInitialScale(): Scale {
  if (!browser) return 'md';
  const stored = localStorage.getItem(KEY) as Scale | null;
  if (stored && stored in SCALE_TO_REM) {
    return stored;
  }
  return 'md';
}

function applyScale(value: Scale) {
  if (!browser) return;
  document.documentElement.style.setProperty('--rf-scale', value);
  document.documentElement.style.setProperty('--rf-font-size', SCALE_TO_REM[value]);
  document.documentElement.dataset.scale = value;
  localStorage.setItem(KEY, value);
}

const initial = readInitialScale();

export const scale = writable<Scale>(initial);

if (browser) {
  applyScale(initial);
}

scale.subscribe((value) => {
  applyScale(value);
});
