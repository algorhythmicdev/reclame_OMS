import { register, init, getLocaleFromNavigator, locale } from 'svelte-i18n';

register('en', () => import('../locales/en.json'));
register('ru', () => import('../locales/ru.json'));
register('lv', () => import('../locales/lv.json'));

export async function setupI18n(defaultLocale: 'en' | 'ru' | 'lv' = 'en') {
  await init({
    fallbackLocale: 'en',
    initialLocale: getLocaleFromNavigator() || defaultLocale
  });
}

export function setLocale(code: 'en' | 'ru' | 'lv') {
  locale.set(code);
}

export { locale };
