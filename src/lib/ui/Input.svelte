<script lang="ts">
  export let value: string = '';
  export let placeholder = '';
  export let type = 'text';
  export let ariaLabel = placeholder || 'input';
</script>

<input
  bind:value
  {type}
  placeholder={placeholder}
  aria-label={ariaLabel}
  class="rf-input" />

<style>
.rf-input{
  width:100%; padding:.6rem .8rem; border-radius:12px;
  border:1px solid rgba(255,255,255,.12);
  background:var(--bg-2); color:var(--text);
}
.rf-input::placeholder{ color:var(--muted) }
</style>