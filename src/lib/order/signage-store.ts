import type { ChangeRequest, Badge } from './types.signage';
import {
  getOrder as _get,
  listOrders,
  createOrder as _create,
  addRevision,
  setDefaultRevision,
  openPR as _open,
  mergePR as _merge,
  closePR as _close,
  setBadges as _setBadges,
  addBadge,
  removeBadge
} from './vcs-store';

// Re-export for read ops
export { listOrders, _get as getOrder, _create as createOrder, addRevision, setDefaultRevision, addBadge, removeBadge };

// Signage-named operations
export function openChangeRequest(
  orderId: string,
  payload: Omit<ChangeRequest, 'id' | 'createdAt' | 'status' | 'targetBranch'>
) {
  return _open(orderId, payload);
}
export function approveChangeRequest(orderId: string, crId: string, admin = 'admin') {
  _merge(orderId, crId, admin);
}
export function declineChangeRequest(orderId: string, crId: string) {
  _close(orderId, crId);
}

export function setBadges(orderId: string, badges: Badge[]) {
  _setBadges(orderId, badges);
}

export function setLoadingDate(orderId: string, dateISO: string, admin = 'admin') {
  const order = _get(orderId);
  if (!order) return;
  const prId = _open(orderId, {
    title: 'Loading day assignment',
    author: admin,
    proposed: { fields: [...order.fields] }
  });
  order.loadingDate = dateISO;
  _merge(orderId, prId, admin);
}

// Optional: log alias, if you ever need to create synthetic logs
export type { StationLog, ChangeRequest, Revision, Order } from './types.signage';
