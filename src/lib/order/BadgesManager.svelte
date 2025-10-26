<script lang="ts">
  import { t } from 'svelte-i18n';
  import Badge from '$lib/ui/Badge.svelte';
  import type { Badge as BadgeType } from './types.signage';

  export let value: BadgeType[] = [];
  export let onChange: (badges: BadgeType[]) => void = () => {};

  const allBadges: BadgeType[] = ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'READY_TO_SHIP', 'DONE', 'URGENT', 'LOW_STOCK'];

  function toggle(badge: BadgeType) {
    const next = new Set(value);
    if (next.has(badge)) {
      next.delete(badge);
    } else {
      next.add(badge);
    }
    onChange(Array.from(next));
  }

  const toneFor = (badge: BadgeType) => {
    if (badge === 'URGENT') return 'danger';
    if (badge === 'READY_TO_SHIP') return 'success';
    if (badge === 'BLOCKED') return 'warn';
    return 'primary';
  };
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">{$t('badges.heading')}</h3>
  <div class="row" style="flex-wrap:wrap;gap:6px">
    {#each allBadges as badge}
      <button class="tag" aria-pressed={value.includes(badge)} on:click={() => toggle(badge)}>
        <Badge tone={toneFor(badge)} label={badge}>{badge}</Badge>
      </button>
    {/each}
  </div>
</div>
