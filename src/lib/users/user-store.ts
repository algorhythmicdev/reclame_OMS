import { writable, derived } from 'svelte/store';

export type Role = 'Admin' | 'Station';
export type StationTag =
  | 'CAD'
  | 'CNC'
  | 'SANDING'
  | 'BENDING'
  | 'WELDING'
  | 'PAINT'
  | 'ASSEMBLY'
  | 'QC'
  | 'LOGISTICS';

export type User = {
  id: string;
  name: string;
  role: Role;
  stations?: StationTag[];
};

const KEY_USER = 'rf_current_user';

export const users = writable<User[]>([
  { id: 'u-admin', name: 'Admin', role: 'Admin' },
  { id: 'u-cnc1', name: 'CNC-1', role: 'Station', stations: ['CNC'] },
  { id: 'u-sanding', name: 'Sanding', role: 'Station', stations: ['SANDING'] },
  { id: 'u-welding', name: 'Welding', role: 'Station', stations: ['WELDING'] },
  { id: 'u-paint', name: 'Paint', role: 'Station', stations: ['PAINT'] }
]);

const start = typeof window !== 'undefined' ? localStorage.getItem(KEY_USER) : null;
export const currentUserId = writable<string>(start || 'u-admin');

currentUserId.subscribe((value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY_USER, value);
  }
});

export const currentUser = derived([users, currentUserId], ([$users, $id]) => {
  return $users.find((user) => user.id === $id) || $users[0];
});
