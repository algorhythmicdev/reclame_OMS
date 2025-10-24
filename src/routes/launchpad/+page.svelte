<script>
  const tiles=[{href:'/orders',label:'Orders',desc:'Create & track jobs',emoji:'📦'},{href:'/calendar',label:'Calendar',desc:'Plan & deliveries',emoji:'🗓️'},{href:'/files',label:'Files',desc:'PDF/CDR previews',emoji:'📁'},{href:'/chat',label:'Chat',desc:'Team messaging',emoji:'💬'},{href:'/inventory',label:'Inventory',desc:'Stock levels & alerts',emoji:'📦'},{href:'/settings',label:'Settings',desc:'Brand & integrations',emoji:'⚙️'}];
</script>
<section class="card"><h2 style="margin-top:0">Launchpad</h2>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:12px">
    {#each tiles as t}<a class="tile" href={t.href}><div style="font-size:1.6rem">{t.emoji}</div><div><div style="font-weight:800">{t.label}</div><div class="muted">{t.desc}</div></div></a>{/each}
  </div>
</section>
