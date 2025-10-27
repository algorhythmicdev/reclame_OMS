// src/lib/notifications/count.ts
import { derived } from 'svelte/store';
import { notifications } from '$lib/notifications/store'; // your existing list
export const unseenCount = derived(notifications, (n) => n.filter(x => !x.seen).length);
