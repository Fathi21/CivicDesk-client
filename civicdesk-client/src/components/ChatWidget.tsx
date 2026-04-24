import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { chat } from '../services/api'
import type { ChatMessage, PreFill } from '../types'

interface Props {
  onPreFill: (preFill: PreFill) => void
}

export default function ChatWidget({ onPreFill }: Props) {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    content: "Hi! I'm CivicAssist. I can help you report issues, find the right service, or answer questions about council services. How can I help you today?"
  }])
  const [input, setInput]     = useState('')
  const [typing, setTyping]   = useState(false)
  const sessionId             = useRef(uuidv4())
  const bottomRef             = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || typing) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setTyping(true)
    try {
      const res = await chat.send(sessionId.current, text)
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
      if (res.preFill) onPreFill(res.preFill)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again."
      }])
    } finally {
      setTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(o => !o)} aria-label={open ? 'Close chat' : 'Open chat'}>
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-dot" />
            <div className="chat-header-info">
              <div className="chat-header-name">CivicAssist</div>
              <div className="chat-header-sub">Cardiff Council Virtual Assistant</div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-row${msg.role === 'user' ? ' user' : ''}`}>
                <div className={`chat-bubble ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {typing && (
              <div className="chat-row">
                <div className="chat-bubble bot typing">CivicAssist is typing…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-bar">
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message…"
            />
            <button
              className="chat-send"
              onClick={send}
              disabled={typing || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}
