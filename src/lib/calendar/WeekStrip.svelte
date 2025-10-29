<script lang="ts">
  import dayjs from 'dayjs';
  
  export let year: number;
  export let month: number;
  
  let weekStart = dayjs().startOf('week');
  
  $: days = Array.from({length: 7}, (_, i) => weekStart.add(i, 'day'));
  
  function prev() {
    weekStart = weekStart.subtract(7, 'day');
  }
  
  function next() {
    weekStart = weekStart.add(7, 'day');
  }
</script>

<div class="cal-weekstrip">
  <div class="row" style="justify-content:space-between;margin-bottom:8px">
    <button class="tag" on:click={prev}>◀</button>
    <strong>{weekStart.format('MMM D')} - {weekStart.add(6, 'day').format('MMM D, YYYY')}</strong>
    <button class="tag" on:click={next}>▶</button>
  </div>
  <div class="week-grid">
    {#each days as d}
      <div class="day-cell">
        <div class="day-name">{d.format('ddd')}</div>
        <div class="day-num">{d.date()}</div>
      </div>
    {/each}
  </div>
</div>

<style>
.cal-weekstrip{
  display:none;
}
.week-grid{
  display:grid;
  grid-template-columns:repeat(7, 1fr);
  gap:4px;
}
.day-cell{
  padding:8px;
  text-align:center;
  border:1px solid var(--border);
  border-radius:8px;
  background:var(--bg-1);
}
.day-name{
  font-size:0.75rem;
  color:var(--muted);
  text-transform:uppercase;
}
.day-num{
  font-weight:700;
  margin-top:4px;
  color:var(--text);
}
</style>
