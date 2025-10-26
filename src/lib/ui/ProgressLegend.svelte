<script lang="ts">
  export let stages: { name: string; value: number }[] = []; // 0..100
  $: total = stages.reduce((a,b)=>a+b.value,0) / (stages.length || 1);
</script>

<div class="card" aria-label="Progress">
  <div class="progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(total)} role="progressbar">
    <span style="width:100%;background:transparent;position:relative;display:block">
      {#each stages as s, i}
        <span style={`position:absolute;left:${i* (100/stages.length)}%;width:${100/stages.length}%;
          height:100%;background:linear-gradient(90deg,var(--brand-amber),var(--brand-cyan));opacity:${Math.max(0.2,s.value/100)}`}></span>
      {/each}
    </span>
  </div>
  <ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:6px;margin-top:8px">
    {#each stages as s}
      <li><b>{s.name}</b> — {s.value}%</li>
    {/each}
  </ul>
</div>
