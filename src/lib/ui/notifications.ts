import { writable } from 'svelte/store';

export type NotificationItem = {
  id: string;
  text: string;
  ts: string;
};

const MAX_ITEMS = 50;

function timestamp() {
  return new Date().toLocaleTimeString();
}

const store = writable<NotificationItem[]>([]);

export const notifications = {
  subscribe: store.subscribe
};

export function notify(text: string, ts: string = timestamp()) {
  const cryptoApi = typeof globalThis !== 'undefined' ? (globalThis as typeof globalThis & { crypto?: Crypto }).crypto : undefined;
  const id = cryptoApi && typeof cryptoApi.randomUUID === 'function'
    ? cryptoApi.randomUUID()
    : `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const item: NotificationItem = {
    id,
    text,
    ts
  };
  store.update((items) => [item, ...items].slice(0, MAX_ITEMS));
}

export function clearNotifications() {
  store.set([]);
}
