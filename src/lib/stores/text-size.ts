import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type TextSize = 'normal' | 'large' | 'x-large';

const KEY = 'rf_text_size';

function getInitialSize(): TextSize {
  if (!browser) return 'normal';
  const stored = localStorage.getItem(KEY);
  if (stored === 'large' || stored === 'x-large') return stored;
  return 'normal';
}

export const textSize = writable<TextSize>(getInitialSize());

textSize.subscribe((value) => {
  if (browser) {
    localStorage.setItem(KEY, value);
    
    // Apply text size class to document
    document.documentElement.classList.remove('text-size-normal', 'text-size-large', 'text-size-x-large');
    document.documentElement.classList.add(`text-size-${value}`);
  }
});

export function cycleTextSize() {
  textSize.update((current) => {
    if (current === 'normal') return 'large';
    if (current === 'large') return 'x-large';
    return 'normal';
  });
}
