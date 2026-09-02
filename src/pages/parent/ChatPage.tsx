import { useEffect, useRef, useState } from 'react'
import { api } from '../../api'
import ChatBubble from '../../components/ChatBubble'
import { ChatMessage } from '../../types'
import { useWebSocket } from '../../hooks/useWebSocket'
import { notifyChatUnreadChanged } from '../../utils/chatUnread'

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadMessages = () => {
    api.getFamilyChatMessages().then(msgs => {
      setMessages(msgs)
      api.markFamilyChatRead().then(() => {
        notifyChatUnreadChanged()
        api.getChatUnreadCount().then(r => setUnreadCount(r.count)).catch(() => setUnreadCount(0))
      })
    })
  }

  useEffect(() => {
    api.getChatUnreadCount().then(r => setUnreadCount(r.count)).catch(() => undefined)
    loadMessages()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useWebSocket((event) => {
    if (event === 'chat_message' || event === 'chat_unread') {
      loadMessages()
      notifyChatUnreadChanged()
    }
  })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await api.sendFamilyChatMessage(text.trim())
      setText('')
      loadMessages()
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">💬 Chat Keluarga</h2>
        {unreadCount > 0 && (
          <span className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded-full">
            {unreadCount} belum dibaca
          </span>
        )}
      </div>

      <div className="card flex flex-col h-[65vh] p-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/80">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Belum ada pesan. Mulai obrolan keluarga!</p>
          )}
          {messages.map(m => (
            <ChatBubble key={m.id} message={m} viewerRole="parent" />
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2 p-3 border-t bg-white">
          <input
            className="input flex-1"
            placeholder="Pesan untuk keluarga..."
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={1000}
          />
          <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-4">
            Kirim
          </button>
        </form>
      </div>
    </div>
  )
}
