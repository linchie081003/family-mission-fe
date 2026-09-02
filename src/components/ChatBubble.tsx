import { ChatMessage } from '../types'

interface ChatBubbleProps {
  message: ChatMessage
  viewerRole: 'parent' | 'child'
}

export default function ChatBubble({ message, viewerRole }: ChatBubbleProps) {
  const isParentMsg = message.sender_role === 'parent'
  const isOwn = viewerRole === 'parent' ? isParentMsg : !isParentMsg
  const senderLabel = message.sender_name || (isParentMsg ? 'Orang Tua' : 'Anak')

  return (
    <div className={`flex flex-col max-w-[85%] ${isOwn ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
      {!isOwn && (
        <span className="text-[10px] font-semibold text-gray-500 mb-0.5 px-1">{senderLabel}</span>
      )}
      {isOwn && message.sender_name && (
        <span className="text-[10px] font-semibold text-gray-500 mb-0.5 px-1">{message.sender_name}</span>
      )}
      <div
        className={`rounded-2xl px-3 py-2 text-sm shadow-sm ${
          isOwn
            ? 'bg-indigo-600 text-white rounded-br-md'
            : isParentMsg
              ? 'bg-white border-2 border-indigo-100 text-slate-800 rounded-bl-md'
              : 'bg-emerald-50 border-2 border-emerald-200 text-emerald-950 rounded-bl-md'
        }`}
        style={!isOwn && message.child_color ? { borderColor: message.child_color } : undefined}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p className={`text-[10px] mt-1 flex items-center gap-2 ${isOwn ? 'text-indigo-100' : 'text-gray-400'}`}>
          <span>
            {new Date(message.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {viewerRole === 'parent' && isParentMsg && (
            <span>{message.read_at ? '✓ Dibaca' : 'Terkirim'}</span>
          )}
          {viewerRole === 'parent' && !isParentMsg && !message.read_at && (
            <span className="text-amber-600 font-semibold">Baru</span>
          )}
          {viewerRole === 'child' && isParentMsg && !message.read_at && (
            <span className="text-amber-600 font-semibold">Baru</span>
          )}
          {viewerRole === 'child' && isParentMsg && message.read_at && (
            <span>✓ Dibaca</span>
          )}
        </p>
      </div>
    </div>
  )
}
