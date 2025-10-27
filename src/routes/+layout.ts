import { setupI18n, setLocale } from '$lib/i18n';
import { theme, type ThemeName } from '$lib/stores/theme';
import { building } from '$app/environment';

export const load = async ({ url }) => {
  await setupI18n();

  if (!building) {
    const params = new URLSearchParams(url.search ?? '');
    const lang = params.get('lang');
    if (lang && (['en', 'ru', 'lv'] as const).includes(lang as any)) {
      setLocale(lang as 'en' | 'ru' | 'lv');
    }

    const th = params.get('theme') as ThemeName | null;
    if (th && ['LightVim', 'DarkVim', 'HighContrastVim'].includes(th)) {
      theme.set(th);
    }
  }

  return {};
};
