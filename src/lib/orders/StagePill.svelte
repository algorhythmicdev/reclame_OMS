<script lang="ts">
  export let stage = 'CNC';     // CAD, CNC, Sanding, Bending, Welding, Paint, Assembly, QC, Delivery
  export let done  = false;
  export let redo: string | null = null;      // 'resand' | 'recut' | 'repaint' | ...
</script>

<span class="pill" data-done={done} data-redo={!!redo} title={redo ? `Redo: ${redo}` : stage}>
  {stage}{#if redo}<small aria-label="Redo required">⟲</small>{/if}
</span>

<style>
.pill{ display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border:1px solid var(--border); border-radius:999px; }
.pill[data-done="true"]{ background: var(--ok); color:white; border-color: color-mix(in oklab,var(--ok) 80%, black); }
.pill[data-redo="true"]{ outline:2px dashed var(--warn); outline-offset:2px; }
.pill small{ font-size:.8em; opacity:.9 }
</style>
