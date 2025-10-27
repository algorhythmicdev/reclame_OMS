import { setupI18n, setLocale } from '$lib/i18n';
import { theme, type ThemeName } from '$lib/stores/theme';
import { browser } from '$app/environment';

export const load = async ({ url }) => {
  await setupI18n();

  if (browser) {
    const lang = url.searchParams.get('lang');
    if (lang && (['en','ru','lv'] as const).includes(lang as any)) {
      setLocale(lang as 'en'|'ru'|'lv');
    }

    const th = url.searchParams.get('theme') as ThemeName | null;
    if (th && ['LightVim','DarkVim','HighContrastVim'].includes(th)) {
      theme.set(th);
    }
  }

  return {};
};
