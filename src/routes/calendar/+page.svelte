<script>
  import CalendarMonth from '$lib/calendar/CalendarMonth.svelte';

  let today = new Date();
  let y = today.getFullYear();
  let m = today.getMonth();
  let adminMode = true;

  function prev() {
    m -= 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
  }

  function next() {
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }
</script>

<section class="card">
  <div class="row" style="justify-content:space-between;align-items:center">
    <h2 style="margin:0">Calendar</h2>
    <div class="row" style="gap:8px; align-items:center">
      <button class="tag" on:click={prev}>◀</button>
      <div style="min-width:140px;text-align:center;font-weight:700">{y} · {m + 1}</div>
      <button class="tag" on:click={next}>▶</button>
      <button class="tag" on:click={() => (adminMode = !adminMode)} aria-pressed={adminMode}>
        {adminMode ? 'Loading Mode: ON' : 'Loading Mode: OFF'}
      </button>
    </div>
  </div>

  <CalendarMonth year={y} month={m} {adminMode} />
</section>
