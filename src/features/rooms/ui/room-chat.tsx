'use client'

import React, { useState, useRef, useEffect } from 'react'
import { AppUser } from '@/features/auth/domain/types'
import { AvatarType } from '@/features/avatar/domain/types'
import { UserAvatar } from '@/features/auth/ui/user-avatar'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Send } from 'lucide-react'

interface ChatMessage {
  id: string
  userId: string
  userName: string
  userAvatar: {
    type: 'url' | 'avatar_type' | 'none'
    value: string | null
  }
  message: string
  timestamp: Date
}

interface RoomChatProps {
  currentUser: AppUser
}

/**
 * ルームチャットコンポーネント
 */
export function RoomChat({ currentUser }: RoomChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // メッセージ送信
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    const trimmedMessage = inputMessage.trim()
    if (!trimmedMessage || isSending) return

    setIsSending(true)

    // TODO: 実際のアプリではSupabaseにメッセージを送信
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name || 'Unknown',
      userAvatar: {
        type: currentUser.avatarType ? 'avatar_type' : 'none',
        value: currentUser.avatarType || null,
      },
      message: trimmedMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')
    setIsSending(false)
  }

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // デモ用の初期メッセージ
  useEffect(() => {
    setMessages([
      {
        id: '1',
        userId: 'system',
        userName: 'System',
        userAvatar: { type: 'none', value: null },
        message: `${currentUser.name}さんがルームに参加しました`,
        timestamp: new Date(),
      },
    ])
  }, [currentUser.name])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* ヘッダー */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">チャット</h2>
      </div>

      {/* メッセージリスト */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map(message => {
            const isCurrentUser = message.userId === currentUser.id
            const isSystem = message.userId === 'system'

            if (isSystem) {
              return (
                <div
                  key={message.id}
                  className="text-center text-sm text-muted-foreground py-1"
                >
                  {message.message}
                </div>
              )
            }

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <UserAvatar
                  user={{
                    id: message.userId,
                    name: message.userName,
                    avatarType:
                      message.userAvatar.type === 'avatar_type'
                        ? (message.userAvatar.value as AvatarType)
                        : 'blue',
                    provider: 'guest',
                  }}
                  size="sm"
                />
                <div className={`flex-1 ${isCurrentUser ? 'text-right' : ''}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {message.userName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`inline-block px-3 py-2 rounded-lg text-sm ${
                      isCurrentUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* 入力エリア */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="メッセージを入力..."
            disabled={isSending}
            className="flex-1"
            maxLength={500}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputMessage.trim() || isSending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
