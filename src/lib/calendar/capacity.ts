export type DayISO = string; // '2025-10-30'
export interface CapacityDay { date: DayISO; max: number; booked: string[] } // list of PO ids

const KEY='rf_capacity';
const mem: Record<DayISO, CapacityDay> =
  typeof localStorage!=='undefined' && localStorage.getItem(KEY)
  ? JSON.parse(localStorage.getItem(KEY)!) : {};

export function getDay(date: DayISO, defMax=6): CapacityDay {
  return mem[date] ?? { date, max: defMax, booked: [] };
}
export function setDay(d: CapacityDay){
  mem[d.date] = d;
  if (typeof localStorage!=='undefined') localStorage.setItem(KEY, JSON.stringify(mem));
}
export function book(date: DayISO, po: string, defMax=6): {ok:boolean; left:number} {
  const d = getDay(date, defMax);
  if (d.booked.includes(po)) return { ok:true, left: d.max - d.booked.length };
  if (d.booked.length >= d.max) return { ok:false, left:0 };
  d.booked.push(po); setDay(d);
  return { ok:true, left: d.max - d.booked.length };
}
export function unbook(date: DayISO, po:string){
  const d = getDay(date); d.booked = d.booked.filter(x=>x!==po); setDay(d);
}
