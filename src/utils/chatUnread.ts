export const CHAT_UNREAD_CHANGED = 'fm:chat-unread-changed'

export function notifyChatUnreadChanged() {
  window.dispatchEvent(new Event(CHAT_UNREAD_CHANGED))
}
