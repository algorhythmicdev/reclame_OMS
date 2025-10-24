<script>
  import { base } from '$app/paths';
  let today=new Date(); let year=today.getFullYear(); let month=today.getMonth();
  const baseEvents=[{date:'2025-10-26',title:'Load: PO-250375',path:'/orders/PO-250375'},{date:'2025-10-30',title:'Paint QC: PO-250420',path:'/orders/PO-250420'},{date:'2025-11-03',title:'Client pickup: PO-250501',path:'/orders/PO-250501'}];
  const events = baseEvents.map((event) => ({ ...event, link: `${base}${event.path}` }));
  const daysInMonth=(y,m)=>new Date(y,m+1,0).getDate(); const firstDay=(y,m)=>new Date(y,m,1).getDay()||7;
  const next=()=>{if(month===11){month=0;year++}else month++}; const prev=()=>{if(month===0){month=11;year--}else month--};
  const fmt=(y,m,d)=>`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; const getEvents=(y,m,d)=>events.filter(e=>e.date===fmt(y,m,d));
</script>
<section class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Calendar</h2>
  <div class="row"><button class="tag" on:click={prev}>← Prev</button><div class="tag">{year} / {String(month+1).padStart(2,'0')}</div><button class="tag" on:click={next}>Next →</button></div></div>
  <div class="grid" style="grid-template-columns:repeat(7,1fr);margin-top:12px">{#each ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as w}<div class="muted" style="text-align:center;font-weight:700">{w}</div>{/each}
    {#each Array(firstDay(year,month)-1) as _}<div></div>{/each}
    {#each Array(daysInMonth(year,month)) as _,i}<div class="card" style="min-height:100px;background:var(--bg-2)"><div style="font-weight:800">{i+1}</div>
      {#each getEvents(year,month,i+1) as ev}<div style="margin-top:6px"><a class="tag" href={ev.link}>{ev.title}</a></div>{/each}
    </div>{/each}
  </div>
</section>
