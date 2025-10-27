<script>
  import UserSwitch from '$lib/users/UserSwitch.svelte';
  import ThemeSwitch from '$lib/ui/ThemeSwitch.svelte';
  import LanguageSwitch from '$lib/ui/LanguageSwitch.svelte';
  import { t } from 'svelte-i18n';
</script>

<section class="card">
  <h2 style="margin-top:0">{$t('settings.title')}</h2>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:12px">
    <div class="card" style="background:var(--bg-2)">
      <h3>{$t('settings.sections.branding')}</h3>
      <ul>
        <li>
          {$t('settings.branding.logo.label')}: <code>{$t('settings.branding.logo.path')}</code>
          {$t('settings.branding.logo.note')}
        </li>
        <li>
          {$t('settings.branding.colors.label')}: <code>{$t('settings.branding.colors.path')}</code>
        </li>
      </ul>
    </div>
    <div class="card" style="background:var(--bg-2)">
      <h3>{$t('settings.sections.integrations')}</h3>
      <ul>
        <li>{$t('settings.integrations.telegram')}</li>
        <li>{$t('settings.integrations.n8n')}</li>
        <li>{$t('settings.integrations.openrouter')}</li>
      </ul>
    </div>
    <ThemeSwitch />
    <LanguageSwitch />
    <UserSwitch />
  </div>
</section>
