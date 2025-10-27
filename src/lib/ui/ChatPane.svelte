<script lang="ts">
  import { onMount } from 'svelte';
  import MentionInput from '$lib/chat/MentionInput.svelte';
  import { rooms, messages, sendMessage } from '$lib/chat/chat-store';
  import { users, currentUser } from '$lib/users/user-store';
  import { t } from 'svelte-i18n';

  $: $rooms, $messages, $users, $currentUser, $t;

  let activeRoomId = 'general';
  let scroller: HTMLDivElement | null = null;

  $: activeRoom = $rooms.find((room) => room.id === activeRoomId) || $rooms[0];
  $: roomMessages = $messages.filter((message) => message.roomId === activeRoomId);

  function formatTime(iso: string) {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function authorName(id: string) {
    return $users.find((user) => user.id === id)?.name ?? id;
  }

  function isMention(messageMentions: string[] | undefined) {
    if (!messageMentions || messageMentions.length === 0) return false;
    return messageMentions.includes($currentUser.id);
  }

  function commit(text: string, mentions: string[]) {
    if (!activeRoom) return;
    sendMessage(activeRoom.id, text, mentions);
    setTimeout(() => {
      if (scroller) {
        scroller.scrollTop = scroller.scrollHeight;
      }
    });
  }

  function selectRoom(id: string) {
    activeRoomId = id;
    setTimeout(() => {
      if (scroller) {
        scroller.scrollTop = scroller.scrollHeight;
      }
    });
  }

  onMount(() => {
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight;
    }
  });
</script>

<div class="rf-panel chat-panel">
  <header class="chat-header">
    <div>
      <div class="chat-title">Team Chat</div>
      {#if $currentUser}
        <div class="muted" style="font-size:.8rem">
          Signed in as <strong>{$currentUser.name}</strong>
        </div>
      {/if}
    </div>
    <div class="rooms" aria-label={$t('chat.rooms')}>
      {#each $rooms as room (room.id)}
        <button
          type="button"
          class="tag"
          class:is-active={room.id === activeRoomId}
          on:click={() => selectRoom(room.id)}
        >
          {room.name}
        </button>
      {/each}
    </div>
  </header>

  <div
    class="rf-scroll messages"
    role="log"
    aria-live="polite"
    aria-atomic="false"
    bind:this={scroller}
  >
    {#each roomMessages as message (message.id)}
      <article class="card message" data-mention={isMention(message.mentions)}>
        <header class="message-head">
          <strong>{authorName(message.authorId)}</strong>
          <span class="muted">{formatTime(message.ts)}</span>
        </header>
        <p class="message-body">{message.text}</p>
        {#if message.mentions && message.mentions.length}
          <div class="muted mentions">
            Mentions:
            {message.mentions
              .map((id) => authorName(id))
              .join(', ')}
          </div>
        {/if}
      </article>
    {/each}
    {#if roomMessages.length === 0}
      <div class="muted">No messages yet.</div>
    {/if}
  </div>

  <MentionInput onCommit={commit} placeholder={$t('chat.message_placeholder')} />
</div>

<style>
.chat-panel{
  gap:12px;
}
.chat-header{
  display:flex;
  flex-direction:column;
  gap:8px;
}
.chat-title{
  font-weight:900;
  margin-bottom:2px;
}
.rooms{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}
.rooms .tag{
  border-radius:999px;
  font-size:.75rem;
}
.messages{
  display:grid;
  gap:8px;
  min-height:0;
  max-height:100%;
}
.message{
  background:var(--bg-2);
  padding:10px;
}
.message-head{
  display:flex;
  justify-content:space-between;
  font-size:.85rem;
  margin-bottom:4px;
}
.message-body{
  margin:0;
  word-break:break-word;
}
.mentions{
  margin-top:4px;
  font-size:.75rem;
}
.message[data-mention="true"]{
  outline:2px solid var(--accent-1);
}
</style>
