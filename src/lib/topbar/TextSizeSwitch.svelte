<script lang="ts">
  import { ui } from '$lib/state/ui';
  import AArrowDown from 'lucide-svelte/icons/a-arrow-down';
  import AArrowUp from 'lucide-svelte/icons/a-arrow-up';
  import { onDestroy, onMount } from 'svelte';

  const steps = [0.90, 1.00, 1.10, 1.20, 1.30];
  const minScale = steps[0];
  const maxScale = steps[steps.length - 1];

  let refreshZoom: (() => void) | null = null;
  let currentScale = 1;
  const unsubscribe = ui.subscribe(p => {
    currentScale = p.fontScale;
    refreshZoom?.();
  });

  onDestroy(unsubscribe);

  $: iconSize = 18 * currentScale;
  $: canDecrement = currentScale > minScale + 0.001;
  $: canIncrement = currentScale < maxScale - 0.001;

  function inc() {
    const next = steps.find(s => s > currentScale);
    if (!next) return;
    ui.update(p => ({ ...p, fontScale: next }));
  }

  function dec() {
    const next = [...steps].reverse().find(s => s < currentScale);
    if (!next) return;
    ui.update(p => ({ ...p, fontScale: next }));
  }

  onMount(() => {
    if (typeof window === 'undefined') return;
    const doc = document.documentElement;
    const viewport = window.visualViewport;

    let raf = 0;
    const apply = () => {
      const zoom = viewport?.scale;
      if (zoom && !Number.isNaN(zoom)) {
        doc.style.setProperty('--text-zoom', zoom.toFixed(3));
      } else {
        const computed = parseFloat(getComputedStyle(doc).fontSize) || 16;
        const baseline = currentScale ? computed / (16 * currentScale) : computed / 16;
        doc.style.setProperty('--text-zoom', baseline.toFixed(3));
      }
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    apply();

    const resizeEvents: Array<[EventTarget, string]> = [];

    if (viewport) {
      resizeEvents.push([viewport, 'resize'], [viewport, 'scroll']);
    }
    resizeEvents.push([window, 'resize']);

    resizeEvents.forEach(([target, type]) => target.addEventListener(type, schedule, { passive: true }));

    refreshZoom = schedule;

    return () => {
      resizeEvents.forEach(([target, type]) => target.removeEventListener(type, schedule));
      cancelAnimationFrame(raf);
      refreshZoom = null;
    };
  });
</script>

<div class="row">
  <button
    class="icon"
    aria-label="Smaller text"
    on:click={dec}
    disabled={!canDecrement}
  >
    <AArrowDown size={iconSize} aria-hidden="true" />
  </button>
  <button
    class="icon"
    aria-label="Larger text"
    on:click={inc}
    disabled={!canIncrement}
  >
    <AArrowUp size={iconSize} aria-hidden="true" />
  </button>
</div>
