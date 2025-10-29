<script lang="ts">
  import dayjs from 'dayjs';
  import { listAll } from '$lib/loading/loading-store';
  import { listOrders } from '$lib/order/signage-store';
  
  let days = listAll();
  let orders = listOrders();
  
  // Memoize current date to avoid recalculation on every render
  const today = dayjs().subtract(1, 'day');
  
  // Get upcoming 14 days with loadings
  $: upcoming = days
    .filter(d => dayjs(d.id).isAfter(today))
    .slice(0, 14);
</script>

<div class="day-list">
  {#each upcoming as day}
    {@const dayOrders = orders.filter(o => o.loadingDate === day.id)}
    <div class="day-item">
      <div class="day-header">
        <strong>{dayjs(day.id).format('MMM D, YYYY')}</strong>
        <span class="tag tag--meta">{dayOrders.length} orders</span>
      </div>
      {#if day.note}
        <div class="muted" style="font-size:0.85rem;margin-top:4px">{day.note}</div>
      {/if}
      {#if dayOrders.length > 0}
        <div class="order-list">
          {#each dayOrders as order}
            <div class="order-item">
              <div class="row" style="justify-content:space-between">
                <strong>{order.client}</strong>
                <span class="muted">{order.id}</span>
              </div>
              <div class="muted" style="font-size:0.85rem">{order.title}</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/each}
  {#if upcoming.length === 0}
    <div class="muted" style="text-align:center;padding:20px">No upcoming loadings scheduled.</div>
  {/if}
</div>

<style>
.day-list{
  display:grid;
  gap:12px;
  margin-top:12px;
}
.day-item{
  border:1px solid var(--border);
  border-radius:12px;
  padding:12px;
  background:var(--bg-1);
}
.day-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:8px;
}
.order-list{
  margin-top:8px;
  display:grid;
  gap:6px;
}
.order-item{
  padding:8px;
  border:1px solid var(--border);
  border-radius:8px;
  background:var(--bg-0);
}
</style>
