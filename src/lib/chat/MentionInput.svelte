<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { users } from '$lib/users/user-store';

  export let value = '';
  export let onCommit: (text: string, mentions: string[]) => void = () => {};
  export let placeholder = 'Message (use @name to mention)';

  let inputEl: HTMLTextAreaElement;
  let cursor = 0;
  let showList = false;
  let query = '';
  let picked: string[] = [];

  $: $users;
  $: suggestions = showList
    ? $users.filter((user) => {
        if (picked.includes(user.id)) return false;
        return user.name.toLowerCase().includes(query.toLowerCase());
      })
    : [];

  function updateCursor() {
    cursor = inputEl?.selectionStart ?? value.length;
  }

  function updateMentionState() {
    const head = value.slice(0, cursor);
    const match = /@([\w-]*)$/i.exec(head);
    if (!match) {
      query = '';
      showList = false;
      return;
    }
    query = match[1] ?? '';
    showList = true;
  }

  function handleInput(event: Event) {
    value = (event.target as HTMLTextAreaElement).value;
    updateCursor();
    updateMentionState();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const payload = value.trim();
      if (!payload) return;
      onCommit(payload, [...picked]);
      value = '';
      picked = [];
      showList = false;
      query = '';
      return;
    }
    if (event.key === 'ArrowDown' && showList) {
      event.preventDefault();
      inputEl?.blur();
    }
  }

  function insertMention(id: string) {
    const user = $users.find((item) => item.id === id);
    if (!user) return;
    const before = value.slice(0, cursor).replace(/@[\w-]*$/i, `@${user.name.replace(/\s+/g, '')} `);
    const after = value.slice(cursor);
    value = `${before}${after}`;
    picked = picked.includes(id) ? picked : [...picked, id];
    showList = false;
    query = '';
    tick().then(() => {
      if (!inputEl) return;
      inputEl.focus();
      inputEl.selectionStart = inputEl.selectionEnd = before.length;
    });
  }

  onMount(() => {
    updateCursor();
  });
</script>

<textarea
  class="rf-input"
  rows="3"
  bind:this={inputEl}
  bind:value
  placeholder={placeholder}
  on:input={handleInput}
  on:click={() => {
    updateCursor();
    updateMentionState();
  }}
  on:keyup={updateCursor}
  on:keydown={handleKeydown}
/>

{#if showList && suggestions.length > 0}
  <div class="mention-list card" role="listbox">
    {#each suggestions as user}
      <button type="button" class="mention-item" on:click={() => insertMention(user.id)}>
        @{user.name}
      </button>
    {/each}
  </div>
{/if}

<style>
textarea.rf-input{
  resize:vertical;
  min-height:72px;
}
.mention-list{
  margin-top:6px;
  display:grid;
  gap:6px;
  padding:8px;
  background:var(--bg-2);
}
.mention-item{
  border:none;
  text-align:left;
  background:transparent;
  color:var(--text);
  padding:6px 8px;
  border-radius:8px;
  cursor:pointer;
}
.mention-item:hover{
  background:rgba(255,255,255,.08);
}
</style>
