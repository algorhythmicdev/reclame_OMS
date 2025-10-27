// src/lib/settings/service.ts
import { theme } from '$lib/stores/theme';
import { locale } from 'svelte-i18n';
import { get } from 'svelte/store';

export async function savePrefs() {
  const t = get(theme) as any; const l = get(locale) as any;
  await fetch('/api/settings', { method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({ theme: t, lang: l }) });
}
