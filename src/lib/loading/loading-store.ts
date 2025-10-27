// Local demo store for loading days; backed by localStorage for now.
import { listOrders } from '$lib/order/signage-store';

export type LoadingDay = {
  id: string; // YYYY-MM-DD
  date: string; // YYYY-MM-DD
  capacity: number;
  note?: string;
  active: boolean;
};

const KEY = 'rf_loading_days';
let DB: Record<string, LoadingDay> =
  typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(KEY) || '{}') : {};

function persist() {
  if (typeof window !== 'undefined') {
    localStorage.setItem(KEY, JSON.stringify(DB));
  }
}

export function listAll(): LoadingDay[] {
  return Object.values(DB).sort((a, b) => a.date.localeCompare(b.date));
}

export function get(id: string): LoadingDay | null {
  return DB[id] ?? null;
}

export function toggleDay(dateISO: string, defaults = { capacity: 6, note: '' }) {
  const id = dateISO;
  const existing = DB[id];
  if (existing) {
    existing.active = !existing.active;
  } else {
    DB[id] = {
      id,
      date: dateISO,
      capacity: defaults.capacity,
      note: defaults.note,
      active: true
    };
  }
  persist();
}

export function setCapacity(dateISO: string, capacity: number) {
  const d = DB[dateISO];
  if (!d) return;
  d.capacity = Math.max(0, capacity);
  persist();
}

export function setNote(dateISO: string, note: string) {
  const d = DB[dateISO];
  if (!d) return;
  d.note = note;
  persist();
}

export function upcoming(fromISO = new Date().toISOString().slice(0, 10)) {
  return listAll().filter((d) => d.active && d.date >= fromISO);
}

export function usage(dateISO: string) {
  const orders = listOrders();
  const assigned = orders.filter((order) => order.loadingDate === dateISO).length;
  const cap = DB[dateISO]?.capacity ?? 0;
  return { assigned, capacity: cap, full: cap > 0 && assigned >= cap };
}
