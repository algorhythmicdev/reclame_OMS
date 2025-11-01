export function logStage(po: string, station: string, notes = '', redo?: string) {
  const key = 'rf_station_log';
  const L = JSON.parse(localStorage.getItem(key) || '[]');
  L.push({ po, station, notes, redo, at: Date.now() });
  localStorage.setItem(key, JSON.stringify(L));
}
