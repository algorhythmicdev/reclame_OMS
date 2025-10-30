// Local demo store for loading days; backed by localStorage for now.
import { listOrders } from '$lib/order/signage-store';
import type { Badge, StageMap } from '$lib/order/types';

export type LoadingDay = {
  id: string; // YYYY-MM-DD
  date: string; // YYYY-MM-DD
  carrier?: string;
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

export function toggleDay(dateISO: string, defaults = { carrier: '', note: '' }) {
  const id = dateISO;
  const existing = DB[id];
  if (existing) {
    existing.active = !existing.active;
  } else {
    DB[id] = {
      id,
      date: dateISO,
      carrier: defaults.carrier,
      note: defaults.note,
      active: true
    };
  }
  persist();
}

export function setCarrier(dateISO: string, carrier: string) {
  const d = DB[dateISO];
  if (!d) return;
  d.carrier = carrier;
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

export type LoadingAssignment = {
  id: string;
  title: string;
  client: string;
  due: string;
  badges: Badge[];
  stages: StageMap;
};

export function usage(dateISO: string) {
  const matching = listOrders().filter((order) => order.loadingDate === dateISO);
  const orders: LoadingAssignment[] = matching
    .map((order) => ({
      id: order.id,
      title: order.title,
      client: order.client,
      due: order.due,
      badges: [...order.badges],
      stages: order.stages
    }))
    .sort((a, b) => a.due.localeCompare(b.due));

  const carrier = DB[dateISO]?.carrier ?? '';
  return { assigned: orders.length, carrier, orders };
}
