import { writable } from 'svelte/store';

export type Load = {
  id: string;              // '2025-11-01'
  dateISO: string;         // same as id
  carrier?: string;        // e.g. "DHL"
  notes?: string;
  pos: string[];           // PO ids assigned to this loading
  createdAt: string;
};

const KEY = 'rf_loads_v1';
const init: Load[] = typeof localStorage !== 'undefined' 
  ? JSON.parse(localStorage.getItem(KEY) || '[]')
  : [];

export const loads = writable<Load[]>(init);

if (typeof localStorage !== 'undefined') {
  loads.subscribe(v => localStorage.setItem(KEY, JSON.stringify(v)));
}

export function upsertLoad(p: Partial<Load> & { id: string }) {
  loads.update(list => {
    const i = list.findIndex(x => x.id === p.id);
    const base: Load = i >= 0 ? list[i] : { id: p.id, dateISO: p.id, pos: [], createdAt: new Date().toISOString() };
    const next = { ...base, ...p };
    if (i >= 0) list[i] = next; else list.unshift(next);
    return [...list];
  });
}

export function linkPO(loadId: string, po: string) {
  loads.update(list => {
    const L = list.find(l => l.id === loadId);
    if (!L) return list;
    if (!L.pos.includes(po)) L.pos = [...L.pos, po];
    return [...list];
  });
}

export function unlinkPO(loadId: string, po: string) {
  loads.update(list => {
    const L = list.find(l => l.id === loadId);
    if (!L) return list;
    L.pos = L.pos.filter(x => x !== po);
    return [...list];
  });
}
