import { writable } from 'svelte/store';
import type { Stage } from './wip';

export interface Ticket { id:string; po:string; title:string; stage:Stage; client?:string }
export const board = writable<Ticket[]>([
  { id:'t1', po:'PO-250375', title:'Long Frame', stage:'CNC', client:'ABTB BIJEN' },
  { id:'t2', po:'PO-250420', title:'Pylon Letters', stage:'SANDING', client:'KIA' }
]);

export function moveTicket(id:string, to:Stage){
  board.update(list => list.map(t => t.id===id ? ({...t, stage: to}) : t));
}
