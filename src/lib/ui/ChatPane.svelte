<script lang="ts">
  import { onMount } from 'svelte';
  import MentionInput from '$lib/chat/MentionInput.svelte';
  import { rooms, messages, sendMessage } from '$lib/chat/chat-store';
  import { users, currentUser } from '$lib/users/user-store';
  import { t } from 'svelte-i18n';
  import { TERMS } from '$lib/order/names';
  import { REWORK_LABEL } from '$lib/order/stages';
  import type { StationTag, ReworkReason } from '$lib/order/stages';

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
    if (id === 'system') return $t('chat.system.name');
    return $users.find((user) => user.id === id)?.name ?? id;
  }

  function stationLabel(station: StationTag) {
    return $t(TERMS.stations[station]);
  }

  function reworkReasonLabel(reason: ReworkReason) {
    return $t(REWORK_LABEL[reason]);
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
      <div class="chat-title">{$t('chat.title')}</div>
      {#if $currentUser}
        <div class="muted" style="font-size:.8rem">
          {$t('chat.signed_in_as')} <strong>{$currentUser.name}</strong>
        </div>
      {/if}
    </div>
    <div class="rooms" role="tablist" aria-label={$t('chat.rooms')}>
      {#each $rooms as room (room.id)}
        <button
          type="button"
          class="tag"
          class:is-active={room.id === activeRoomId}
          role="tab"
          aria-selected={room.id === activeRoomId}
          tabindex={room.id === activeRoomId ? 0 : -1}
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
      <article
        class="card message"
        class:message--system={message.variant === 'system'}
        data-mention={isMention(message.mentions)}
      >
        <header class="message-head">
          <div class="message-meta">
            <strong>{authorName(message.authorId)}</strong>
            <span class="muted">{formatTime(message.ts)}</span>
          </div>
          {#if message.mentions && message.mentions.length}
            <div class="message-recipients" aria-label={$t('chat.mentions')}>
              <span class="muted label">{$t('chat.to')}</span>
              {#each message.mentions as id (id)}
                <span class="tag tag--small">@{authorName(id)}</span>
              {/each}
            </div>
          {/if}
        </header>
        {#if message.variant === 'system' && message.event}
          <div class="system-event">
            <div class="system-headline">
              <strong>{message.event.orderTitle}</strong>
              <span class="muted">({message.event.orderId})</span>
            </div>
            <div class="system-tags">
              <span class="tag tag--small">{stationLabel(message.event.station)}</span>
              {#if message.event.type === 'stage_rework'}
                <span class="tag tag--small tone-warn">{reworkReasonLabel(message.event.reason)}</span>
              {:else if message.event.type === 'stage_completed'}
                <span class="tag tag--small tone-ok">{$t('chat.system.completed.badge')}</span>
              {/if}
            </div>
            <p class="system-body">
              {#if message.event.type === 'stage_rework'}
                {$t('chat.system.rework.summary')}
              {:else if message.event.type === 'stage_completed'}
                {$t('chat.system.completed.summary')}
              {/if}
            </p>
            {#if message.event.type === 'stage_rework' && message.event.note}
              <p class="system-note">
                <span class="muted">{$t('chat.system.note_label')}:</span>
                <span>{message.event.note}</span>
              </p>
            {/if}
          </div>
        {:else}
          <p class="message-body">{message.text}</p>
        {/if}
      </article>
    {/each}
    {#if roomMessages.length === 0}
      <div class="muted">{$t('chat.empty')}</div>
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
  padding:12px;
  display:flex;
  flex-direction:column;
  gap:6px;
}
.message--system{
  border-left:3px solid var(--accent-1);
  background:color-mix(in oklab, var(--bg-2) 80%, var(--accent-2) 20%);
}
.message-head{
  display:flex;
  flex-direction:column;
  gap:6px;
  font-size:.85rem;
}
.message-meta{
  display:flex;
  justify-content:space-between;
  gap:8px;
}
.message-recipients{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:6px;
}
.message-recipients .label{
  font-size:.75rem;
  text-transform:uppercase;
  letter-spacing:.03em;
}
.tag--small{
  padding:4px 8px;
  font-size:.75rem;
}
.message-body{
  margin:0;
  word-break:break-word;
}
.system-event{
  display:grid;
  gap:6px;
}
.system-headline{
  display:flex;
  gap:6px;
  align-items:baseline;
}
.system-tags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
}
.system-body{
  margin:0;
  font-size:.9rem;
}
.system-note{
  margin:0;
  display:flex;
  gap:6px;
  font-size:.85rem;
  background:color-mix(in oklab, var(--bg-2) 85%, var(--accent-1) 15%);
  padding:6px 8px;
  border-radius:8px;
}
.tone-warn{
  background:color-mix(in oklab, var(--accent-1) 30%, var(--bg-2));
  color:var(--text);
}
.tone-ok{
  background:color-mix(in oklab, var(--accent-2) 35%, var(--bg-2));
  color:var(--text);
}
.message[data-mention="true"]{
  outline:2px solid var(--accent-1);
}
</style>
