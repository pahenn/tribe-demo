<script setup lang="ts">
const isOpen = useState('chat-open', () => false)
const isExpanded = useState('chat-expanded', () => false)
const route = useRoute()
const input = ref('')
const messages = ref<Array<{ id: string; role: string; content: string; thinking?: string }>>([])
const streamingContent = ref('')
const streamingThinking = ref('')
const isStreaming = ref(false)
const isThinking = ref(false)
const panelRef = ref<HTMLElement>()
const thinkingRef = ref<HTMLElement>()

let msgCounter = 0

async function send() {
  const text = input.value.trim()
  if (!text || isStreaming.value) return

  messages.value.push({ id: `msg-${++msgCounter}`, role: 'user', content: text })
  input.value = ''

  const assistantId = `msg-${++msgCounter}`
  streamingContent.value = ''
  streamingThinking.value = ''
  isStreaming.value = true
  isThinking.value = true

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.value.map(m => ({ role: m.role, content: m.content })),
        currentPage: route.path,
      }),
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6)
        if (data === '[DONE]') continue

        try {
          const parsed = JSON.parse(data)
          const choice = parsed.choices?.[0]?.delta

          if (choice?.reasoning_content) {
            streamingThinking.value += choice.reasoning_content
          }
          if (choice?.content) {
            // First content token means thinking is done
            if (isThinking.value) isThinking.value = false
            streamingContent.value += choice.content
          }
        } catch {}
      }
    }
  } catch (err: any) {
    streamingContent.value = `**Error:** ${err.message || 'Could not connect to LM Studio. Is it running?'}`
  } finally {
    messages.value.push({
      id: assistantId,
      role: 'assistant',
      content: streamingContent.value,
      thinking: streamingThinking.value || undefined,
    })
    streamingContent.value = ''
    streamingThinking.value = ''
    isStreaming.value = false
    isThinking.value = false
    await nextTick()
    scrollToBottom()
  }
}

function scrollToBottom() {
  const el = panelRef.value?.querySelector('.chat-messages')
  if (el) el.scrollTop = el.scrollHeight
}

function clear() {
  messages.value = []
  streamingContent.value = ''
  streamingThinking.value = ''
  isStreaming.value = false
  isThinking.value = false
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

function scrollThinking() {
  if (thinkingRef.value) {
    thinkingRef.value.scrollTop = thinkingRef.value.scrollHeight
  }
}

watch([messages, streamingContent], () => nextTick(scrollToBottom), { deep: true })
watch(streamingThinking, () => nextTick(scrollThinking))
</script>

<template>
  <div ref="panelRef">
    <aside
      class="fixed top-0 right-0 z-50 h-dvh overflow-hidden border-l border-default bg-default transition-all duration-200 ease-in-out"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
      :style="{ width: isExpanded ? '50vw' : '380px' }"
    >
      <div class="flex h-full flex-col">
        <!-- Header -->
        <div class="flex h-14 shrink-0 items-center justify-between border-b border-default px-4">
          <span class="font-medium text-sm text-highlighted">Ask about the Bible</span>
          <div class="flex items-center gap-1">
            <button
              class="p-1.5 rounded hover:bg-accented text-muted hover:text-highlighted transition-colors"
              :title="isExpanded ? 'Collapse' : 'Expand'"
              @click="isExpanded = !isExpanded"
            >
              <UIcon :name="isExpanded ? 'i-lucide-minimize-2' : 'i-lucide-maximize-2'" class="size-4" />
            </button>
            <button
              v-if="messages.length > 0 || isStreaming"
              class="p-1.5 rounded hover:bg-accented text-muted hover:text-highlighted transition-colors"
              title="Clear chat"
              @click="clear"
            >
              <UIcon name="i-lucide-trash-2" class="size-4" />
            </button>
            <button
              class="p-1.5 rounded hover:bg-accented text-muted hover:text-highlighted transition-colors"
              title="Close"
              @click="isOpen = false"
            >
              <UIcon name="i-lucide-x" class="size-4" />
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Empty state -->
          <template v-if="messages.length === 0 && !isStreaming">
            <div class="flex flex-col items-center justify-center h-full text-center gap-3">
              <UIcon name="i-lucide-book-open" class="size-8 text-primary" />
              <p class="text-sm text-muted max-w-xs">
                Ask anything about the King James Bible — people, places, themes, or verses.
              </p>
              <div class="flex flex-col gap-1.5 w-full mt-2">
                <button
                  v-for="q in [
                    'What is the Sermon on the Mount?',
                    'Who was King David?',
                    'What does Psalm 23 mean?',
                    'Compare Genesis 1 and John 1',
                  ]"
                  :key="q"
                  class="text-left text-xs text-muted hover:text-highlighted px-3 py-2 rounded border border-default hover:bg-accented transition-colors"
                  @click="input = q; send()"
                >
                  {{ q }}
                </button>
              </div>
            </div>
          </template>

          <!-- Completed messages -->
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="flex"
            :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              v-if="msg.role === 'user'"
              class="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-primary text-white"
            >
              <span class="whitespace-pre-wrap">{{ msg.content }}</span>
            </div>
            <div v-else class="max-w-full w-full text-sm space-y-2">
              <!-- Thinking collapsible -->
              <details v-if="msg.thinking" class="group">
                <summary class="flex items-center gap-1.5 cursor-pointer text-xs text-muted hover:text-highlighted select-none">
                  <UIcon name="i-lucide-brain" class="size-3.5" />
                  <span>Thinking</span>
                  <UIcon name="i-lucide-chevron-right" class="size-3 transition-transform group-open:rotate-90" />
                </summary>
                <div class="mt-1.5 ml-5 pl-2 border-l-2 border-default text-xs text-muted whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {{ msg.thinking }}
                </div>
              </details>
              <!-- Response -->
              <div class="prose prose-sm dark:prose-invert max-w-none
                [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                [&_blockquote]:border-l-primary [&_blockquote]:bg-accented [&_blockquote]:rounded-r [&_blockquote]:py-2 [&_blockquote]:px-3 [&_blockquote]:my-2 [&_blockquote]:text-sm [&_blockquote]:not-italic
                [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/30 [&_a:hover]:decoration-primary
                [&_ul]:my-1 [&_li]:my-0.5
                [&_p]:my-1.5"
              >
                <Comark>{{ msg.content }}</Comark>
              </div>
            </div>
          </div>

          <!-- Currently streaming -->
          <div v-if="isStreaming" class="flex justify-start">
            <div class="max-w-full w-full text-sm space-y-2">
              <!-- Thinking while streaming -->
              <div v-if="streamingThinking" class="space-y-1">
                <div class="flex items-center gap-1.5 text-xs text-muted">
                  <UIcon name="i-lucide-brain" class="size-3.5" :class="{ 'animate-pulse': isThinking }" />
                  <span>{{ isThinking ? 'Thinking...' : 'Thinking' }}</span>
                </div>
                <div ref="thinkingRef" class="ml-5 pl-2 border-l-2 border-default text-xs text-muted/60 whitespace-pre-wrap max-h-24 overflow-y-auto scroll-smooth">
                  {{ streamingThinking }}
                </div>
              </div>
              <!-- Response while streaming -->
              <div
                v-if="streamingContent"
                class="prose prose-sm dark:prose-invert max-w-none
                  [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
                  [&_blockquote]:border-l-primary [&_blockquote]:bg-accented [&_blockquote]:rounded-r [&_blockquote]:py-2 [&_blockquote]:px-3 [&_blockquote]:my-2 [&_blockquote]:text-sm [&_blockquote]:not-italic
                  [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/30 [&_a:hover]:decoration-primary
                  [&_ul]:my-1 [&_li]:my-0.5
                  [&_p]:my-1.5"
              >
                <Comark :streaming="true" caret>{{ streamingContent }}</Comark>
              </div>
              <!-- Initial spinner before any tokens -->
              <div v-else-if="!streamingThinking" class="flex items-center gap-2 text-muted py-1">
                <UIcon name="i-lucide-loader" class="size-3.5 animate-spin" />
                <span class="text-xs">Connecting...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="shrink-0 border-t border-default p-3">
          <div class="flex gap-2">
            <textarea
              v-model="input"
              placeholder="Ask a question..."
              rows="1"
              class="flex-1 resize-none rounded-lg border border-default bg-default px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              @keydown="handleKeydown"
            />
            <button
              class="shrink-0 rounded-lg bg-primary px-3 py-2 text-white text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
              :disabled="!input.trim() || isStreaming"
              @click="send"
            >
              <UIcon name="i-lucide-arrow-up" class="size-4" />
            </button>
          </div>
          <div class="mt-1.5 text-[10px] text-dimmed text-center">
            Powered by LM Studio
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
