<script>
  import { base } from '$app/paths';
  const tileConfig=[{path:'/orders',label:'Orders',desc:'Create & track jobs',emoji:'📦'},{path:'/calendar',label:'Calendar',desc:'Plan & deliveries',emoji:'🗓️'},{path:'/files',label:'Files',desc:'PDF/CDR previews',emoji:'📁'},{path:'/chat',label:'Chat',desc:'Team messaging',emoji:'💬'},{path:'/inventory',label:'Inventory',desc:'Stock levels & alerts',emoji:'📦'},{path:'/settings',label:'Settings',desc:'Brand & integrations',emoji:'⚙️'}];
  const tiles = tileConfig.map((tile) => ({ ...tile, href: `${base}${tile.path}` }));
</script>
<section class="card"><h2 style="margin-top:0">Launchpad</h2>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:12px">
    {#each tiles as t}<a class="tile" href={t.href}><div style="font-size:1.6rem">{t.emoji}</div><div><div style="font-weight:800">{t.label}</div><div class="muted">{t.desc}</div></div></a>{/each}
  </div>
</section>
