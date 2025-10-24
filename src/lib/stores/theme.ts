import { writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';
const startup = isBrowser ? localStorage.getItem('rf_theme') || 'dark' : 'dark';

export const theme = writable(startup);

theme.subscribe((t) => {
  if (!isBrowser) return;
  localStorage.setItem('rf_theme', t);
  document.documentElement.setAttribute('data-theme', t);
});