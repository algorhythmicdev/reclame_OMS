import type { Order, Revision, ChangeRequest, StationLog, Badge } from './types.signage';
import {
  getOrder,
  listOrders,
  createOrder,
  addRevision,
  setDefaultRevision,
  openPR as openCR,
  mergePR as approveCR,
  closePR as declineCR,
  setBadges as applyBadges,
  addBadge,
  removeBadge
} from './vcs-store';

// Re-export for read ops
export { listOrders, getOrder, createOrder, addRevision, setDefaultRevision, addBadge, removeBadge };

// Signage-named operations
export function openChangeRequest(
  orderId: string,
  payload: Omit<ChangeRequest, 'id' | 'createdAt' | 'status' | 'targetBranch'>
) {
  return openCR(orderId, payload);
}
export function approveChangeRequest(orderId: string, crId: string, admin = 'admin') {
  approveCR(orderId, crId, admin);
}
export function declineChangeRequest(orderId: string, crId: string) {
  declineCR(orderId, crId);
}

export function setBadges(orderId: string, badges: Badge[]) {
  applyBadges(orderId, badges);
}

// Optional: log alias, if you ever need to create synthetic logs
export type { StationLog, ChangeRequest, Revision, Order };
