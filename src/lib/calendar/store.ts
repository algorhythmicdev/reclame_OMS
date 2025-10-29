import type { CalEvent } from './types';
import { writable } from 'svelte/store';

const KEY = 'rf_calendar_events';
const initial: CalEvent[] = typeof localStorage !== 'undefined'
  ? JSON.parse(localStorage.getItem(KEY) || '[]') : [];

export const calEvents = writable<CalEvent[]>(initial);
calEvents.subscribe(v => { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(v)); });

export function addEvent(e: CalEvent){ 
  calEvents.update(list => [e, ...list]); 
}

export function updateEvent(e: CalEvent){ 
  calEvents.update(list => list.map(x => x.id===e.id? e : x)); 
}

export function removeEvent(id: string){ 
  calEvents.update(list => list.filter(x => x.id!==id)); 
}

export function byDate(iso: string): CalEvent[] { 
  let out: CalEvent[] = []; 
  const unsub = calEvents.subscribe(v => { out = v.filter(e => e.date===iso); });
  unsub();
  return out; 
}
