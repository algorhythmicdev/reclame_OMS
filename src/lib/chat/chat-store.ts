import { writable, get } from 'svelte/store';
import type { Room, Message } from './types';
import { users, currentUser } from '$lib/users/user-store';

const KEY_ROOMS = 'rf_chat_rooms';
const KEY_MSGS = 'rf_chat_msgs';

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`Unable to load ${key}`, error);
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to persist ${key}`, error);
  }
}

export const rooms = writable<Room[]>(
  load(KEY_ROOMS, [
    { id: 'general', name: 'General' },
    { id: 'workstations', name: 'Workstations' },
    { id: 'logistics', name: 'Logistics' }
  ])
);
rooms.subscribe((value) => save(KEY_ROOMS, value));

export const messages = writable<Message[]>(load(KEY_MSGS, []));
messages.subscribe((value) => save(KEY_MSGS, value));

export function sendMessage(roomId: string, text: string, mentions: string[] = []) {
  const me = get(currentUser);
  const payload = text.trim();
  if (!payload) return;

  const message: Message = {
    id: crypto.randomUUID(),
    roomId,
    authorId: me.id,
    ts: new Date().toISOString(),
    text: payload,
    mentions
  };

  messages.update((value) => [...value, message]);
}

export function ensureRoom(room: Room) {
  rooms.update((value) => {
    if (value.some((item) => item.id === room.id)) return value;
    return [...value, room];
  });
}

export function deleteRoom(roomId: string) {
  rooms.update((value) => value.filter((room) => room.id !== roomId));
  messages.update((value) => value.filter((message) => message.roomId !== roomId));
}

export function mentionsForMessage(message: Message) {
  const idSet = new Set(message.mentions || []);
  const lookup = get(users);
  return lookup.filter((user) => idSet.has(user.id));
}
