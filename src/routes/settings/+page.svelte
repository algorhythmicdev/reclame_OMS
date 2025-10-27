<script>
  import UserSwitch from '$lib/users/UserSwitch.svelte';
</script>

<section class="card">
  <h2 style="margin-top:0">Settings</h2>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">
    <div class="card" style="background:var(--bg-2)">
      <h3>Branding</h3>
      <ul>
        <li>Logo: <code>static/brand/logo.png</code> (place your PNG there)</li>
        <li>Colors: <code>static/brand.css</code></li>
      </ul>
    </div>
    <div class="card" style="background:var(--bg-2)">
      <h3>Integrations</h3>
      <ul>
        <li>Telegram (mock)</li>
        <li>n8n (mock)</li>
        <li>OpenRouter (mock)</li>
      </ul>
    </div>
    <UserSwitch />
  </div>
</section>
