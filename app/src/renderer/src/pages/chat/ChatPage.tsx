/**
 * TODO: OpenRouter integration
 * - Base URL: https://openrouter.ai/api/v1 (or env)
 * - API key: secure storage (Electron safeStorage / keychain), never commit
 * - Model id from settings
 * - Optional streaming via fetch + ReadableStream
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { newId } from '@/lib/id'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatPage(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = useCallback((): void => {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: 'user', content: text },
      {
        id: newId(),
        role: 'assistant',
        content: 'OpenRouter integration coming — wire API key, model, and streaming here.'
      }
    ])
  }, [draft])

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-background">
      <div
        ref={listRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Messages will appear here. Connect OpenRouter to enable AI replies.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === 'user'
                  ? 'ml-auto max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm text-foreground'
                  : 'mr-auto max-w-[85%] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground'
              }
            >
              {m.content}
            </div>
          ))
        )}
      </div>
      <div className="border-t border-[var(--border-scroll)] bg-muted/30 p-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          <textarea
            className="min-h-[2.75rem] flex-1 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Type a message…"
            value={draft}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends; Shift+Enter inserts newline
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
          />
          <button
            type="button"
            className="h-fit shrink-0 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            onClick={send}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
