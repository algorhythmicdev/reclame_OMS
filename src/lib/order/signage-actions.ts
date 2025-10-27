import { getOrder, openChangeRequest, approveChangeRequest } from './signage-store';
import type { StationTag, ReworkReason, StageCycle, StageState } from './stages';
import { notify } from '$lib/notifications/store';
import { sendMessage } from '$lib/chat/chat-store';

function broadcast(orderId: string, station: StationTag, text: string, mentions: string[] = []) {
  notify(`${orderId} · ${station}: ${text}`);
  sendMessage('workstations', `${orderId} · ${station}: ${text}`, mentions);
}

export function adminSendToRework(
  orderId: string,
  station: StationTag,
  reason: ReworkReason,
  note: string,
  admin = 'admin',
  mentions: string[] = []
) {
  const order = getOrder(orderId);
  if (!order) return;

  const idx = (order.cycles?.length || 0) + 1;
  const cycle: StageCycle = {
    idx,
    station,
    reason,
    note,
    at: new Date().toISOString(),
    by: admin
  };
  const cycles = [...(order.cycles ?? []), cycle];

  const prId = openChangeRequest(orderId, {
    title: `${station}: rework (${reason})`,
    author: admin,
    message: note,
    proposed: { stages: { [station]: 'REWORK' }, cycles }
  });
  approveChangeRequest(orderId, prId, admin);

  broadcast(orderId, station, 'rework requested', mentions);
}

export function adminApplyStage(
  orderId: string,
  station: StationTag,
  next: StageState,
  note = '',
  admin = 'admin',
  mentions: string[] = []
) {
  const prId = openChangeRequest(orderId, {
    title: `${station} → ${next}`,
    author: admin,
    message: note,
    proposed: { stages: { [station]: next } }
  });
  approveChangeRequest(orderId, prId, admin);

  if (next === 'COMPLETED') {
    broadcast(orderId, station, 'completed', mentions);
  }
}
