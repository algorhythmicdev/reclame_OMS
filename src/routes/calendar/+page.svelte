<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n';
  import { ordersStore } from '$lib/order/signage-store';
  import { loads } from '$lib/state/loads';
  import type { Order } from '$lib/order/types';
  import { Calendar, ChevronLeft, ChevronRight, Plus, Truck, Download, Filter } from 'lucide-svelte';
  import Badge from '$lib/ui/Badge.svelte';
  import { badgeTone } from '$lib/order/badges';
  import { downloadCSV, toCSV } from '$lib/export/csv';
  import { get } from 'svelte/store';
  
  let today = new Date();
  let y = today.getFullYear();
  let m = today.getMonth();
  let selectedDate: string | null = null;
  let orders: Order[] = [];
  let loadsList: any[] = [];
  let filterStatus: 'all' | 'scheduled' | 'unscheduled' = 'all';
  
  loads.subscribe(v => loadsList = v);
  
  async function refreshOrders() {
    try {
      const response = await fetch('/api/draft-orders');
      if (response.ok) {
        const data = await response.json();
        orders = data.map((d: any) => ({
          id: d.poNumber,
          title: d.title || d.clientName,
          client: d.clientName,
          due: d.deadline,
          loadingDate: d.loadingDate,
          badges: d.status === 'draft' ? ['DRAFT'] : [],
          fields: [],
          materials: [],
          stages: {},
          isDraft: d.status === 'draft',
          profiles: d.profiles || []
        }));
        ordersStore.set(orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }
  
  function prev() {
    m -= 1;
    if (m < 0) { m = 11; y -= 1; }
  }
  
  function next() {
    m += 1;
    if (m > 11) { m = 0; y += 1; }
  }
  
  function getDaysInMonth(year: number, month: number): Date[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: Date[] = [];
    
    // Add previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevMonthLastDay - i));
    }
    
    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add next month days to fill the grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  }
  
  function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  
  function getOrdersForDate(date: string): Order[] {
    return orders.filter(o => o.loadingDate === date);
  }
  
  function isLoadingDay(date: string): boolean {
    return loadsList.some(l => l.dateISO === date);
  }
  
  function isToday(date: Date): boolean {
    const todayStr = formatDate(new Date());
    return formatDate(date) === todayStr;
  }
  
  function isSelectedMonth(date: Date): boolean {
    return date.getMonth() === m && date.getFullYear() === y;
  }
  
  function selectDate(date: Date) {
    selectedDate = formatDate(date);
  }
  
  function exportDayCSV() {
    if (!selectedDate) return;
    const dayOrders = getOrdersForDate(selectedDate);
    const translate = get(t);
    const columns = [
      { label: translate('calendar.columns.po'), value: (order: Order) => order.id },
      { label: translate('calendar.columns.client'), value: (order: Order) => order.client },
      { label: translate('calendar.columns.title'), value: (order: Order) => order.title },
      { label: translate('calendar.columns.due'), value: (order: Order) => order.due }
    ];
    const rows = dayOrders.map((order) =>
      Object.fromEntries(columns.map((column) => [column.label, column.value(order)]))
    );
    downloadCSV(`loading-${selectedDate}.csv`, toCSV(rows, columns.map((column) => column.label)));
  }
  
  $: days = getDaysInMonth(y, m);
  $: selectedDayOrders = selectedDate ? getOrdersForDate(selectedDate) : [];
  $: filteredOrders = filterStatus === 'all' ? orders :
                      filterStatus === 'scheduled' ? orders.filter(o => o.loadingDate) :
                      orders.filter(o => !o.loadingDate);
  $: monthName = new Date(y, m, 1).toLocaleDateString('en-US', { month: 'long' });
  
  onMount(() => {
    refreshOrders();
    const handler = (event: StorageEvent) => {
      if (!event.key || event.key === 'rf_orders_vcs') {
        refreshOrders();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  });
</script>

<svelte:head>
  <title>Calendar - Reclame OMS</title>
</svelte:head>

<div class="calendar-page">
  <!-- Top Bar -->
  <div class="calendar-topbar">
    <div class="topbar-left">
      <Calendar size={24} />
      <h1>Loading Schedule</h1>
    </div>
    <div class="topbar-right">
      <button class="btn-secondary">
        <Plus size={18} />
        New Loading Day
      </button>
      <button class="btn-ghost" on:click={exportDayCSV} disabled={!selectedDate}>
        <Download size={18} />
        Export CSV
      </button>
    </div>
  </div>
  
  <!-- Main Content - Side by Side -->
  <div class="calendar-grid">
    <!-- Left: Calendar -->
    <div class="calendar-section">
      <div class="calendar-header">
        <button class="nav-btn" on:click={prev}>
          <ChevronLeft size={20} />
        </button>
        <h2 class="month-title">{monthName} {y}</h2>
        <button class="nav-btn" on:click={next}>
          <ChevronRight size={20} />
        </button>
      </div>
      
      <div class="calendar-body">
        <div class="weekdays">
          <div class="weekday">Sun</div>
          <div class="weekday">Mon</div>
          <div class="weekday">Tue</div>
          <div class="weekday">Wed</div>
          <div class="weekday">Thu</div>
          <div class="weekday">Fri</div>
          <div class="weekday">Sat</div>
        </div>
        
        <div class="days-grid">
          {#each days as day}
            {@const dateStr = formatDate(day)}
            {@const dayOrders = getOrdersForDate(dateStr)}
            {@const isLoading = isLoadingDay(dateStr)}
            <button
              class="day-cell"
              class:other-month={!isSelectedMonth(day)}
              class:today={isToday(day)}
              class:selected={selectedDate === dateStr}
              class:has-loading={isLoading}
              class:has-orders={dayOrders.length > 0}
              on:click={() => selectDate(day)}
            >
              <span class="day-number">{day.getDate()}</span>
              {#if dayOrders.length > 0}
                <span class="order-count">{dayOrders.length}</span>
              {/if}
              {#if isLoading}
                <div class="loading-indicator">
                  <Truck size={12} />
                </div>
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
    
    <!-- Right: Schedule List -->
    <div class="schedule-section">
      <div class="schedule-header">
        <h3>{selectedDate ? `Schedule for ${selectedDate}` : 'Select a date'}</h3>
        {#if selectedDate && selectedDayOrders.length > 0}
          <span class="order-badge">{selectedDayOrders.length} {selectedDayOrders.length === 1 ? 'order' : 'orders'}</span>
        {/if}
      </div>
      
      <div class="schedule-body">
        {#if selectedDate}
          {#if selectedDayOrders.length === 0}
            <div class="empty-state">
              <Calendar size={48} />
              <p>No orders scheduled for this date</p>
              <button class="btn-secondary">
                <Plus size={18} />
                Add Order to Schedule
              </button>
            </div>
          {:else}
            <div class="orders-list">
              {#each selectedDayOrders as order}
                <div class="order-card">
                  <div class="order-header">
                    <span class="order-id">{order.id}</span>
                    <div class="order-badges">
                      {#each order.badges as badge}
                        <Badge tone={badgeTone(badge)} label={badge}>
                          <span class="badge-text">{badge}</span>
                        </Badge>
                      {/each}
                    </div>
                  </div>
                  <h4 class="order-title">{order.title}</h4>
                  <div class="order-meta">
                    <span class="meta-item">Client: {order.client}</span>
                    <span class="meta-item">Due: {order.due}</span>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <div class="empty-state">
            <Calendar size={48} />
            <p>Select a date to view scheduled orders</p>
          </div>
        {/if}
      </div>
    </div>
  </div>
  
  <!-- Bottom: All Orders -->
  <div class="all-orders-section">
    <div class="section-header">
      <h3>All Orders</h3>
      <div class="filter-group">
        <button
          class="filter-btn"
          class:active={filterStatus === 'all'}
          on:click={() => filterStatus = 'all'}
        >
          All ({orders.length})
        </button>
        <button
          class="filter-btn"
          class:active={filterStatus === 'scheduled'}
          on:click={() => filterStatus = 'scheduled'}
        >
          Scheduled ({orders.filter(o => o.loadingDate).length})
        </button>
        <button
          class="filter-btn"
          class:active={filterStatus === 'unscheduled'}
          on:click={() => filterStatus = 'unscheduled'}
        >
          Unscheduled ({orders.filter(o => !o.loadingDate).length})
        </button>
      </div>
    </div>
    
    <div class="orders-table">
      {#each filteredOrders.slice(0, 10) as order}
        <div class="table-row">
          <span class="col-po">{order.id}</span>
          <span class="col-client">{order.client}</span>
          <span class="col-title">{order.title}</span>
          <span class="col-due">{order.due}</span>
          <span class="col-loading">{order.loadingDate || '—'}</span>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .calendar-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
    padding: var(--space-lg);
    background: var(--bg-0);
    min-height: 100vh;
  }
  
  /* Top Bar */
  .calendar-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md) var(--space-lg);
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
  }
  
  .topbar-left {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }
  
  .topbar-left h1 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text);
  }
  
  .topbar-right {
    display: flex;
    gap: var(--space-sm);
  }
  
  .btn-secondary, .btn-ghost {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid var(--border);
    background: var(--bg-1);
    color: var(--text);
  }
  
  .btn-secondary {
    background: var(--accent-1);
    color: white;
    border-color: var(--accent-1);
  }
  
  .btn-secondary:hover {
    background: color-mix(in oklab, var(--accent-1) 90%, black);
  }
  
  .btn-ghost:hover {
    background: var(--bg-2);
  }
  
  .btn-ghost:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  /* Main Grid */
  .calendar-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: var(--space-lg);
    align-items: start;
  }
  
  .calendar-section, .schedule-section {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }
  
  /* Calendar */
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
  }
  
  .month-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
  }
  
  .nav-btn {
    padding: var(--space-xs);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: transparent;
    color: var(--text);
    cursor: pointer;
    transition: background 0.2s ease;
  }
  
  .nav-btn:hover {
    background: var(--bg-2);
  }
  
  .weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--space-xs);
    margin-bottom: var(--space-sm);
  }
  
  .weekday {
    text-align: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: var(--space-xs);
  }
  
  .days-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--space-xs);
  }
  
  .day-cell {
    aspect-ratio: 1;
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--bg-0);
    color: var(--text);
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-xs);
  }
  
  .day-cell:hover {
    background: var(--bg-2);
    border-color: var(--accent-1);
  }
  
  .day-cell.other-month {
    opacity: 0.3;
  }
  
  .day-cell.today {
    border-color: var(--accent-1);
    border-width: 2px;
    font-weight: 600;
  }
  
  .day-cell.selected {
    background: var(--accent-1);
    color: white;
    border-color: var(--accent-1);
  }
  
  .day-cell.has-loading {
    background: color-mix(in oklab, var(--accent-1) 10%, var(--bg-0));
  }
  
  .day-number {
    font-size: 0.875rem;
  }
  
  .order-count {
    position: absolute;
    top: 4px;
    right: 4px;
    background: var(--accent-1);
    color: white;
    font-size: 0.625rem;
    padding: 2px 4px;
    border-radius: 999px;
    font-weight: 600;
    min-width: 16px;
    text-align: center;
  }
  
  .day-cell.selected .order-count {
    background: white;
    color: var(--accent-1);
  }
  
  .loading-indicator {
    position: absolute;
    bottom: 4px;
    right: 4px;
    color: var(--accent-1);
  }
  
  /* Schedule Section */
  .schedule-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
    padding-bottom: var(--space-md);
    border-bottom: 1px solid var(--border);
  }
  
  .schedule-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
  }
  
  .order-badge {
    padding: var(--space-xs) var(--space-sm);
    background: var(--bg-2);
    border-radius: var(--radius-full);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text);
  }
  
  .schedule-body {
    min-height: 400px;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl);
    color: var(--muted);
    gap: var(--space-md);
  }
  
  .empty-state p {
    margin: 0;
    font-size: 0.875rem;
  }
  
  .orders-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .order-card {
    padding: var(--space-md);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--bg-0);
    transition: all 0.2s ease;
  }
  
  .order-card:hover {
    border-color: var(--accent-1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
  }
  
  .order-id {
    font-weight: 600;
    color: var(--accent-1);
  }
  
  .order-badges {
    display: flex;
    gap: var(--space-xs);
  }
  
  .badge-text {
    font-size: 0.65rem;
  }
  
  .order-title {
    margin: 0 0 var(--space-sm) 0;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text);
  }
  
  .order-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-xxs);
  }
  
  .meta-item {
    font-size: 0.75rem;
    color: var(--muted);
  }
  
  /* All Orders Section */
  .all-orders-section {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-lg);
  }
  
  .section-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--text);
  }
  
  .filter-group {
    display: flex;
    gap: var(--space-xs);
  }
  
  .filter-btn {
    padding: var(--space-xs) var(--space-md);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: transparent;
    color: var(--text);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s ease;
  }
  
  .filter-btn:hover {
    background: var(--bg-2);
  }
  
  .filter-btn.active {
    background: var(--accent-1);
    color: white;
    border-color: var(--accent-1);
  }
  
  .orders-table {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
  }
  
  .table-row {
    display: grid;
    grid-template-columns: 120px 180px 1fr 120px 120px;
    gap: var(--space-md);
    padding: var(--space-md);
    background: var(--bg-0);
    font-size: 0.875rem;
  }
  
  .col-po {
    font-weight: 600;
    color: var(--accent-1);
  }
  
  .col-client, .col-title {
    color: var(--text);
  }
  
  .col-due, .col-loading {
    color: var(--muted);
  }
  
  @media (max-width: 1280px) {
    .calendar-grid {
      grid-template-columns: 1fr;
    }
    
    .schedule-section {
      order: -1;
    }
  }
  
  @media (max-width: 768px) {
    .calendar-topbar {
      flex-direction: column;
      gap: var(--space-md);
    }
    
    .topbar-left, .topbar-right {
      width: 100%;
      justify-content: space-between;
    }
    
    .table-row {
      grid-template-columns: 1fr;
      gap: var(--space-xs);
    }
  }
</style>
