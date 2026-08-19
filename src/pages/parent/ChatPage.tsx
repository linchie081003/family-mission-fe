import { useEffect, useRef, useState } from 'react'
import { api } from '../../api'
import ChatBubble from '../../components/ChatBubble'
import { ChatMessage, ChatThread } from '../../types'
import { useWebSocket } from '../../hooks/useWebSocket'
import { notifyChatUnreadChanged } from '../../utils/chatUnread'

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [selectedId, setSelectedId] = useState<number | 'all' | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const loadThreads = () => {
    api.getChatThreads().then(data => {
      setThreads(data)
      if (data.length > 0 && selectedId == null) setSelectedId(data[0].child_id)
    })
  }

  const markReadAndRefresh = (childId: number) =>
    api.markChatRead(childId).then(() => {
      loadThreads()
      notifyChatUnreadChanged()
    })

  const loadMessages = (childId: number) => {
    api.getChatMessages(childId).then(msgs => {
      setMessages(msgs)
      markReadAndRefresh(childId)
    })
  }

  useEffect(() => { loadThreads() }, [])

  useEffect(() => {
    if (typeof selectedId === 'number') loadMessages(selectedId)
    else setMessages([])
  }, [selectedId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useWebSocket((event, data) => {
    if (event === 'chat_message' || event === 'chat_unread') {
      loadThreads()
      notifyChatUnreadChanged()
      if (typeof selectedId === 'number' && event === 'chat_message' && data && typeof data === 'object' && 'child_id' in data) {
        const childId = (data as { child_id: number }).child_id
        if (childId === selectedId) loadMessages(childId)
      }
    }
  })

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      if (selectedId === 'all') {
        await api.broadcastChatMessage(text.trim())
        setText('')
        loadThreads()
      } else if (typeof selectedId === 'number') {
        await api.sendChatMessage(selectedId, text.trim())
        setText('')
        loadMessages(selectedId)
        loadThreads()
      }
    } finally {
      setSending(false)
    }
  }

  const selected = typeof selectedId === 'number' ? threads.find(t => t.child_id === selectedId) : null
  const totalUnread = threads.reduce((sum, t) => sum + t.unread_count, 0)

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">💬 Chat Anak</h2>
        {totalUnread > 0 && (
          <span className="text-xs font-bold bg-red-500 text-white px-2 py-1 rounded-full">
            {totalUnread} belum dibaca
          </span>
        )}
      </div>

      {threads.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Belum ada anak terdaftar</p>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedId('all')}
              className={`shrink-0 px-3 py-2 rounded-xl border text-sm font-semibold ${
                selectedId === 'all' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200'
              }`}
            >
              📢 Semua Anak
            </button>
            {threads.map(t => (
              <button
                key={t.child_id}
                type="button"
                onClick={() => setSelectedId(t.child_id)}
                className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold ${
                  selectedId === t.child_id ? 'bg-primary-50 border-primary-300 text-primary-700' : 'bg-white border-gray-200'
                }`}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: t.child_color }}
                >
                  {t.child_name[0]}
                </span>
                {t.child_name}
                {t.unread_count > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 rounded-full">{t.unread_count}</span>
                )}
              </button>
            ))}
          </div>

          {selectedId === 'all' ? (
            <div className="card space-y-3">
              <p className="text-sm text-gray-500">Kirim pesan yang sama ke semua anak aktif.</p>
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="Pesan untuk semua anak..."
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={1000}
                />
                <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-4">
                  Kirim Semua
                </button>
              </form>
            </div>
          ) : selected && (
            <div className="card flex flex-col h-[55vh] p-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50/80">
                {messages.map(m => (
                  <ChatBubble key={m.id} message={m} viewerRole="parent" />
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={handleSend} className="flex gap-2 p-3 border-t bg-white">
                <input
                  className="input flex-1"
                  placeholder={`Pesan ke ${selected.child_name}...`}
                  value={text}
                  onChange={e => setText(e.target.value)}
                  maxLength={1000}
                />
                <button type="submit" disabled={sending || !text.trim()} className="btn-primary px-4">
                  Kirim
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  )
}
