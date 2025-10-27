<script lang="ts">
  import { base } from '$app/paths';
</script>

<header class="brandbar" role="banner">
  <a href={`${base}/`} class="brand-link" aria-label="ReclamFabrik home">
    <img
      src={`${base}/brand/logo-reclame-cube.webp`}
      alt="Reclamefabriek · cube"
      class="brand-logo"
      width="220" height="64" decoding="async" loading="eager" />
  </a>
  <slot />
</header>

<style>
.brandbar{
  background: var(--bg-1);
  border-bottom: 1px solid var(--border);
  display:flex; align-items:center; justify-content:space-between;
  padding: 8px 12px;
}
.brand-link{ display:inline-flex; align-items:center; gap:10px; text-decoration:none }
.brand-logo{ height:40px; width:auto; object-fit:contain; image-rendering:auto }
@media (prefers-contrast: more){
  .brand-logo{ filter: none; }
}
</style>
