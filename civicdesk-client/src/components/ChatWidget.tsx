import { useState, useEffect, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { chat } from '../services/api'
import type { ChatMessage, PreFill } from '../types'

interface Props {
  onPreFill: (preFill: PreFill) => void
}

export default function ChatWidget({ onPreFill }: Props) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m CivicAssist. I can help you report issues, find the right service, or answer questions about council services. How can I help you today?'
    }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const sessionId = useRef(uuidv4())
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || typing) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const res = await chat.send(sessionId.current, text)
      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }])
      if (res.preFill) {
        onPreFill(res.preFill)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.'
      }])
    } finally {
      setTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: 56, height: 56, borderRadius: '50%',
          background: '#1d4ed8', color: '#fff', border: 'none',
          fontSize: 24, cursor: 'pointer', zIndex: 900,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5rem', right: '1.5rem',
          width: 360, maxHeight: 520,
          background: '#fff', borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          zIndex: 901, overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            background: '#1d4ed8', color: '#fff',
            padding: '0.875rem 1rem',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#4ade80'
            }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>CivicAssist</div>
              <div style={{ fontSize: 12, opacity: 0.85 }}>Cardiff Council Virtual Assistant</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '1rem', display: 'flex',
            flexDirection: 'column', gap: '0.75rem'
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%', padding: '0.6rem 0.875rem',
                  borderRadius: msg.role === 'user'
                    ? '12px 12px 2px 12px'
                    : '12px 12px 12px 2px',
                  background: msg.role === 'user' ? '#1d4ed8' : '#f3f4f6',
                  color: msg.role === 'user' ? '#fff' : '#111827',
                  fontSize: 14, lineHeight: 1.5
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background: '#f3f4f6', borderRadius: '12px 12px 12px 2px',
                  padding: '0.6rem 0.875rem', fontSize: 14, color: '#6b7280'
                }}>
                  CivicAssist is typing...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem', borderTop: '1px solid #e5e7eb',
            display: 'flex', gap: 8
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              style={{
                flex: 1, padding: '0.5rem 0.75rem',
                borderRadius: 8, border: '1px solid #d1d5db',
                fontSize: 14, outline: 'none'
              }}
            />
            <button
              onClick={send}
              disabled={typing || !input.trim()}
              style={{
                background: '#1d4ed8', color: '#fff',
                border: 'none', borderRadius: 8,
                padding: '0.5rem 0.875rem', cursor: 'pointer',
                fontSize: 14, opacity: typing || !input.trim() ? 0.5 : 1
              }}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}