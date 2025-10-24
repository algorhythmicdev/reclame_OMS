<script lang="ts">
  export let value: string = '';
  export let placeholder = '';
  export let type: string = 'text';
  export let ariaLabel = placeholder || 'input';

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement | null;
    value = target ? target.value : '';
  };
</script>

<input
  {value}
  type={type}
  placeholder={placeholder}
  aria-label={ariaLabel}
  class="rf-input"
  on:input={handleInput} />

<style>
.rf-input{
  width:100%; padding:.6rem .8rem; border-radius:12px;
  border:1px solid rgba(255,255,255,.12);
  background:var(--bg-2); color:var(--text);
}
.rf-input::placeholder{ color:var(--muted) }
</style>