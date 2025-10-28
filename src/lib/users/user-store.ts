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
  { id: 'u-admin', name: 'Lina Ops', role: 'Admin' },
  { id: 'u-cnc1', name: 'Marta Jansone', role: 'Station', stations: ['CNC'] },
  { id: 'u-sanding', name: 'Igor Petrovs', role: 'Station', stations: ['SANDING'] },
  { id: 'u-welding', name: 'Līga Ozola', role: 'Station', stations: ['WELDING'] },
  { id: 'u-paint', name: 'Anna Kalniņa', role: 'Station', stations: ['PAINT'] },
  { id: 'u-logistics', name: 'Ravi Nair', role: 'Station', stations: ['LOGISTICS'] }
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
