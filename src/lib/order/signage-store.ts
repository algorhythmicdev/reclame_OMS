import type { ChangeRequest, Badge, Field, StationTag } from './types.signage';
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
  removeBadge,
  addRedoFlag as _addRedoFlag,
  setRedoSelection as _setRedoSelection,
  clearRedoFlag as _clearRedoFlag
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

export function setRedoSelection(orderId: string, stage: StationTag | '', reason: string): void {
  _setRedoSelection(orderId, stage, reason);
}

export function addRedoFlag(orderId: string, stage: StationTag, reason: string): StationTag[] {
  return _addRedoFlag(orderId, stage, reason);
}

export function clearRedoFlag(orderId: string, stage: StationTag): StationTag[] {
  return _clearRedoFlag(orderId, stage);
}

export function setLoadingDate(orderId: string, dateISO: string, admin = 'admin') {
  const order = _get(orderId);
  if (!order) return;
  const fields: Field[] = order.fields.map((field) => ({ ...field }));
  const value = dateISO || '';
  const idx = fields.findIndex((field) => field.key === 'loading' || field.label === 'Loading Date');
  if (idx >= 0) {
    fields[idx] = { ...fields[idx], value };
  } else {
    fields.push({ key: 'loading', label: 'Loading Date', value });
  }
  const prId = _open(orderId, {
    title: 'Loading day assignment',
    author: admin,
    proposed: { fields, loadingDate: dateISO }
  });
  order.loadingDate = dateISO;
  order.fields = fields;
  _merge(orderId, prId, admin);
}

// Optional: log alias, if you ever need to create synthetic logs
export type { StationLog, ChangeRequest, Revision, Order } from './types.signage';
