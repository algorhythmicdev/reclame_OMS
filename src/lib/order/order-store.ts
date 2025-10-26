import type { OrderRepo, Branch, Commit, Badge } from './order-model';

const KEY = 'rf_order_repos';

function load(): Record<string, OrderRepo> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
}
function save(db: Record<string, OrderRepo>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(db));
}

let DB = load();

export function getRepo(id: string): OrderRepo | null {
  return DB[id] ?? null;
}

export function initRepo(seed: OrderRepo) {
  if (!DB[seed.id]) { DB[seed.id] = seed; save(DB); }
}

export function branch(repoId: string, name: string, from = 'main') {
  const r = DB[repoId]; if (!r) return;
  if (r.branches.find(b => b.name === name)) return;
  const base = r.branches.find(b => b.name === from) || r.branches[0];
  const b: Branch = { name, head: base.head, commits: [...base.commits] };
  r.branches.push(b); save(DB);
}

export function setDefaultBranch(repoId: string, name: string) {
  const r = DB[repoId]; if (!r) return;
  r.defaultBranch = name;
  r.branches.forEach(b => b.isDefault = b.name === name);
  save(DB);
}

export function deleteBranch(repoId: string, name: string) {
  const r = DB[repoId]; if (!r || name === r.defaultBranch) return;
  r.branches = r.branches.filter(b => b.name !== name);
  save(DB);
}

export function commit(repoId: string, branchName: string, c: Omit<Commit,'id'|'ts'>) {
  const r = DB[repoId]; if (!r) return;
  const b = r.branches.find(x => x.name === branchName); if (!b) return;
  const commit: Commit = { id: crypto.randomUUID(), ts: new Date().toISOString(), ...c };
  b.commits = [commit, ...b.commits];
  b.head = commit.id;

  // Apply to working tree (repo snapshot used by UI)
  const ch = commit.changes;
  if (ch.title) r.title = ch.title;
  if (ch.client) r.client = ch.client;
  if (ch.fields) r.fields = ch.fields;
  if (ch.materials) r.materials = ch.materials;
  if (ch.files) r.files = ch.files;
  if (ch.badges) r.badges = ch.badges;
  if (ch.progress) r.progress = { ...r.progress, ...ch.progress };

  save(DB);
}

export function rollback(repoId: string, branchName: string, commitId: string) {
  const r = DB[repoId]; if (!r) return;
  const b = r.branches.find(x => x.name === branchName); if (!b) return;
  const idx = b.commits.findIndex(c => c.id === commitId);
  if (idx < 0) return;
  b.commits = b.commits.slice(idx); // keep from target to newest (target becomes head)
  b.head = b.commits[0]?.id || b.head;
  // naive: reapply from oldest to newest to build snapshot
  const snapshot: OrderRepo = { ...r, badges:[], files:[], fields:[], materials:[] };
  const ordered = [...b.commits].reverse();
  ordered.forEach(c => {
    const ch = c.changes;
    if (ch.title) snapshot.title = ch.title;
    if (ch.client) snapshot.client = ch.client;
    if (ch.fields) snapshot.fields = ch.fields;
    if (ch.materials) snapshot.materials = ch.materials;
    if (ch.files) snapshot.files = ch.files;
    if (ch.badges) snapshot.badges = ch.badges;
    if (ch.progress) snapshot.progress = { ...(snapshot.progress||{}), ...ch.progress };
  });
  Object.assign(r, snapshot);
  save(DB);
}

export function addBadge(repoId: string, badge: Badge) {
  const r = DB[repoId]; if (!r) return;
  if (!r.badges.includes(badge)) r.badges.push(badge);
  save(DB);
}

export function removeBadge(repoId: string, badge: Badge) {
  const r = DB[repoId]; if (!r) return;
  r.badges = r.badges.filter(b => b !== badge);
  save(DB);
}
