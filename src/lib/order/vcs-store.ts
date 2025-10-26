import type { Order, Revision, PullRequest, Commit, Badge } from './types';

const KEY = 'rf_orders_vcs';

let DB: Record<string, Order> = (typeof window !== 'undefined')
  ? JSON.parse(localStorage.getItem(KEY) || '{}')
  : {};

function persist() { if (typeof window !== 'undefined') localStorage.setItem(KEY, JSON.stringify(DB)); }

export function listOrders(): Order[] { return Object.values(DB); }
export function getOrder(id: string): Order | null { return DB[id] ?? null; }

export function createOrder(seed: Omit<Order, 'branches'|'prs'|'revisions'|'defaultBranch'|'defaultRevisionId'> & { file: Revision['file'] }) {
  if (DB[seed.id]) return DB[seed.id];
  const rev: Revision = {
    id: crypto.randomUUID(),
    parentId: null,
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
    message: `Initial upload for ${seed.id}`,
    file: seed.file
  };
  const initCommit: Commit = { id: 'init', ts: new Date().toISOString(), author: 'System', message: 'Order created', changes: {} };

  const order: Order = {
    id: seed.id,
    title: seed.title,
    client: seed.client,
    due: seed.due,
    badges: seed.badges,
    fields: seed.fields,
    materials: seed.materials,
    progress: seed.progress,
    defaultBranch: 'main',
    branches: [{ name: 'main', head: initCommit.id, commits: [initCommit], isDefault: true }],
    prs: [],
    revisions: [rev],
    defaultRevisionId: rev.id
  };
  DB[order.id] = order; persist(); return order;
}

// Admin-only: add a new file revision (same PO)
export function addRevision(orderId: string, file: Revision['file'], admin = 'admin', message?: string) {
  const o = DB[orderId]; if (!o) throw new Error('Order not found');
  const head = o.revisions[0];
  const rev: Revision = {
    id: crypto.randomUUID(),
    parentId: head?.id || null,
    createdAt: new Date().toISOString(),
    createdBy: admin,
    message: message || `Upload ${file.name}`,
    file
  };
  o.revisions = [rev, ...o.revisions];
  // Also record a commit on main that points to new default revision
  const c: Commit = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    author: admin,
    message: `File revision: ${file.name}`,
    changes: { defaultRevisionId: rev.id }
  };
  const main = o.branches.find(b=>b.name==='main')!;
  main.commits = [c, ...main.commits]; main.head = c.id;
  o.defaultRevisionId = rev.id;
  persist();
  return rev.id;
}

export function setDefaultRevision(orderId: string, revisionId: string, admin='admin') {
  const o = DB[orderId]; if (!o) return;
  if (!o.revisions.find(r=>r.id===revisionId)) return;
  const c: Commit = {
    id: crypto.randomUUID(), ts: new Date().toISOString(), author: admin,
    message: 'Switch default revision', changes: { defaultRevisionId: revisionId }
  };
  const main = o.branches.find(b=>b.name==='main')!;
  main.commits = [c, ...main.commits]; main.head = c.id;
  o.defaultRevisionId = revisionId; persist();
}

// Stations: open PR with proposed metadata changes
export function openPR(orderId: string, pr: Omit<PullRequest,'id'|'createdAt'|'status'|'targetBranch'>) {
  const o = DB[orderId]; if (!o) throw new Error('Order not found');
  const item: PullRequest = {
    id: crypto.randomUUID(),
    title: pr.title, author: pr.author,
    createdAt: new Date().toISOString(),
    message: pr.message, proposed: pr.proposed,
    targetBranch: 'main',
    status: 'open'
  };
  o.prs = [item, ...o.prs]; persist(); return item.id;
}

export function mergePR(orderId: string, prId: string, admin='admin') {
  const o = DB[orderId]; if (!o) return;
  const pr = o.prs.find(p=>p.id===prId && p.status==='open'); if (!pr) return;

  // Apply to working tree + add commit on main
  const c: Commit = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    author: admin,
    message: `Merge PR: ${pr.title}`,
    changes: pr.proposed
  };
  const main = o.branches.find(b=>b.name==='main')!;
  main.commits = [c, ...main.commits]; main.head = c.id;

  if (pr.proposed.title) o.title = pr.proposed.title;
  if (pr.proposed.client) o.client = pr.proposed.client;
  if (pr.proposed.due) o.due = pr.proposed.due;
  if (pr.proposed.fields) o.fields = pr.proposed.fields;
  if (pr.proposed.materials) o.materials = pr.proposed.materials;
  if (pr.proposed.badges) o.badges = pr.proposed.badges;
  if (pr.proposed.progress) o.progress = { ...o.progress, ...pr.proposed.progress };
  if (pr.proposed.defaultRevisionId) o.defaultRevisionId = pr.proposed.defaultRevisionId;

  pr.status = 'merged'; pr.mergedAt = new Date().toISOString(); pr.mergedBy = admin;
  persist();
}

export function closePR(orderId: string, prId: string) {
  const o = DB[orderId]; if (!o) return;
  const pr = o.prs.find(p=>p.id===prId && p.status==='open'); if (!pr) return;
  pr.status = 'closed'; persist();
}

export function addBadge(orderId: string, b: Badge) {
  const o = DB[orderId]; if (!o) return;
  if (!o.badges.includes(b)) o.badges.push(b);
  persist();
}
export function removeBadge(orderId: string, b: Badge) {
  const o = DB[orderId]; if (!o) return;
  o.badges = o.badges.filter(x=>x!==b); persist();
}
