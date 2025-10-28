import { register, init, getLocaleFromNavigator, locale, addMessages } from 'svelte-i18n';
import en from '../locales/en.json';

const KEY = 'rf_locale';
const SUPPORTED_LOCALES = ['en', 'ru', 'lv'] as const;
type LocaleCode = (typeof SUPPORTED_LOCALES)[number];

addMessages('en', en);
register('ru', () => import('../locales/ru.json'));
register('lv', () => import('../locales/lv.json'));

function normalizeLocale(value: string | null | undefined, fallback: LocaleCode): LocaleCode {
  if (!value) return fallback;
  const lower = value.toLowerCase();
  if ((SUPPORTED_LOCALES as readonly string[]).includes(lower)) {
    return lower as LocaleCode;
  }
  const base = lower.split('-')[0];
  if ((SUPPORTED_LOCALES as readonly string[]).includes(base)) {
    return base as LocaleCode;
  }
  return fallback;
}

export async function setupI18n(defaultLocale: LocaleCode = 'en') {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
  const initial = normalizeLocale(saved || getLocaleFromNavigator(), defaultLocale);
  await init({
    fallbackLocale: 'en',
    initialLocale: initial
  });
}

export function setLocale(code: LocaleCode | string) {
  const normalized = normalizeLocale(code, 'en');
  locale.set(normalized);
  if (typeof window !== 'undefined') localStorage.setItem(KEY, normalized);
}
