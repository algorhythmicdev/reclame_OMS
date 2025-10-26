import type { LayoutLoad } from './$types';
import { setupI18n } from '$lib/i18n';

export const prerender = true;

export const load: LayoutLoad = async () => {
  await setupI18n();
  return {};
};
