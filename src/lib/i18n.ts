import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';

const KEY = 'rf_locale';

register('en', () => import('../locales/en.json'));
register('ru', () => import('../locales/ru.json'));
register('lv', () => import('../locales/lv.json'));

export async function setupI18n(defaultLocale: 'en' | 'ru' | 'lv' = 'en') {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
  await init({
    fallbackLocale: 'en',
    initialLocale: saved || getLocaleFromNavigator() || defaultLocale
  });
}

export function setLocale(code: 'en' | 'ru' | 'lv') {
  locale.set(code);
  if (typeof window !== 'undefined') localStorage.setItem(KEY, code);
}

export { locale };
