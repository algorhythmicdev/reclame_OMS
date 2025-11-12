// user-store.ts
import { writable } from 'svelte/store';
import type { User, Section } from './types';

export const currentUser = writable<User | null>(null);

// Utility for switching section
export function switchSection(section: Section) {
  currentUser.update(u => {
    if (u && u.sections.includes(section)) {
      return { ...u, primarySection: section };
    }
    return u;
  });
}
