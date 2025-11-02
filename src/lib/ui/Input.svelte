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
  .rf-input {
    width: 100%;
    padding: calc(var(--space-xs) + var(--space-xxs)) var(--space-md);
    min-height: calc(var(--control-size) * 0.9);
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    background: var(--bg-0);
    color: var(--text);
    font: inherit;
    line-height: 1.4;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .rf-input:focus-visible {
    border-color: var(--focus);
    box-shadow: 0 0 0 2px color-mix(in oklab, var(--focus) 28%, transparent);
  }

  .rf-input::placeholder {
    color: var(--muted);
  }
</style>
