# [07_presence] 04_チャットリアルタイム統合

## 目的

Supabase Realtime `postgres_changes`を使用してチャット機能をリアルタイムで同期し、Presenceシステムと統合する。

## 成果物

- `src/features/chat/infrastructure/chatRealtimeService.ts`
- `src/features/chat/application/useChatRealtime.ts`
- `src/features/chat/hooks/useChatIntegration.ts`

## 実装内容

### 1. チャットリアルタイムサービス

```typescript
// chatRealtimeService.ts
class ChatRealtimeService {
  private messageChannel: RealtimeChannel | null = null

  async subscribeToMessages(roomId: string): Promise<void> {
    this.messageChannel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        this.handleNewMessage
      )
      .subscribe()
  }

  async sendMessage(
    roomId: string,
    content: string,
    userInfo: PresenceData
  ): Promise<void> {
    const messageData = {
      room_id: roomId,
      content,
      user_type: userInfo.user_type,
      user_id: userInfo.user_id,
      display_name: userInfo.display_name,
      avatar_type: userInfo.avatar_type,
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('messages').insert(messageData)

    if (error) {
      throw new Error(`メッセージ送信エラー: ${error.message}`)
    }
  }

  private handleNewMessage = (payload: any) => {
    const newMessage = payload.new
    this.onMessageReceived?.(newMessage)
  }

  onMessageReceived?: (message: MessageData) => void

  async unsubscribe(): Promise<void> {
    if (this.messageChannel) {
      await this.messageChannel.unsubscribe()
      this.messageChannel = null
    }
  }
}
```

### 2. チャット統合フック

```typescript
// useChatIntegration.ts
export const useChatIntegration = (
  roomId: string,
  presenceData: PresenceData | null
) => {
  const [messages, setMessages] = useState<MessageData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const chatService = useRef<ChatRealtimeService>(new ChatRealtimeService())

  // 初期メッセージ読み込み
  useEffect(() => {
    const loadInitialMessages = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('room_id', roomId)
          .order('created_at', { ascending: true })

        if (error) throw error
        setMessages(data || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '初期メッセージ読み込みエラー'
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialMessages()
  }, [roomId])

  // リアルタイム購読開始
  useEffect(() => {
    const service = chatService.current

    service.onMessageReceived = (newMessage: MessageData) => {
      setMessages(prev => [...prev, newMessage])
    }

    service.subscribeToMessages(roomId)

    return () => {
      service.unsubscribe()
    }
  }, [roomId])

  // メッセージ送信
  const sendMessage = useCallback(
    async (content: string) => {
      if (!presenceData || !content.trim()) return

      try {
        await chatService.current.sendMessage(
          roomId,
          content.trim(),
          presenceData
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'メッセージ送信エラー')
      }
    },
    [roomId, presenceData]
  )

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearError: () => setError(null),
  }
}
```

### 3. Presence連携メッセージ表示

```typescript
// メッセージにPresence情報を統合
interface EnhancedMessageData extends MessageData {
  isCurrentUser: boolean
  isOnline: boolean
  currentPosition?: { x: number; y: number }
}

// Presence状態との統合
const enhanceMessagesWithPresence = (
  messages: MessageData[],
  presenceUsers: Record<string, PresenceData>,
  currentUserId: string
): EnhancedMessageData[] => {
  return messages.map(message => {
    const isCurrentUser = message.user_id === currentUserId
    const senderPresence = Object.values(presenceUsers).find(
      user => user.user_id === message.user_id
    )

    return {
      ...message,
      isCurrentUser,
      isOnline: !!senderPresence,
      currentPosition: senderPresence
        ? { x: senderPresence.x, y: senderPresence.y }
        : undefined,
    }
  })
}
```

### 4. チャットUI統合

```typescript
// ChatMessage component with presence integration
const ChatMessage: React.FC<{ message: EnhancedMessageData }> = ({ message }) => {
  return (
    <div className={`message ${message.isCurrentUser ? 'own' : 'other'}`}>
      <div className="message-header">
        <span className="display-name">{message.display_name}</span>
        {message.isOnline && (
          <span className="online-indicator" title="オンライン">●</span>
        )}
        <span className="timestamp">
          {new Date(message.created_at).toLocaleTimeString()}
        </span>
      </div>
      <div className="message-content">{message.content}</div>
    </div>
  )
}
```

### 5. 入退室通知との連携

```typescript
// Presence入退室をチャットに統合
const integratePresenceWithChat = (presenceEvents: PresenceEventPayload) => {
  if (presenceEvents.event === 'join' && presenceEvents.newPresences) {
    presenceEvents.newPresences.forEach(user => {
      addSystemMessage(`${user.display_name} さんが入室しました`)
    })
  }

  if (presenceEvents.event === 'leave' && presenceEvents.leftPresences) {
    presenceEvents.leftPresences.forEach(user => {
      addSystemMessage(`${user.display_name} さんが退室しました`)
    })
  }
}

// システムメッセージ追加
const addSystemMessage = (content: string) => {
  const systemMessage: MessageData = {
    id: `system_${Date.now()}`,
    room_id: roomId,
    content,
    user_type: 'system',
    display_name: 'システム',
    avatar_type: 'system',
    created_at: new Date().toISOString(),
  }

  setMessages(prev => [...prev, systemMessage])
}
```

## データベーススキーマ連携

### messagesテーブル参照

```sql
-- messages table (既存)
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES rooms(id) ON DELETE CASCADE,
  content text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('google', 'guest')),
  user_id text, -- Google users only
  display_name text NOT NULL,
  avatar_type text NOT NULL,
  created_at timestamp with time zone DEFAULT NOW()
);
```

## 実装手順

1. **チャットリアルタイムサービス**
   - postgres_changes購読
   - メッセージ送信機能

2. **Presence統合**
   - メッセージとPresence状態の統合
   - オンライン状態表示

3. **UI統合**
   - メッセージコンポーネント
   - システム通知表示

4. **エラーハンドリング**
   - 送信失敗時の再送
   - 接続切断時の状態管理

## 受け入れ条件

- [ ] メッセージがリアルタイムで全ユーザーに配信される
- [ ] Presence情報（オンライン状態）がメッセージに表示される
- [ ] 入退室通知がチャットに表示される
- [ ] メッセージ送信エラー時の適切な処理
- [ ] 初期メッセージ履歴の正常な読み込み
- [ ] メモリリークが発生しない（購読解除）

## テストケース

- [ ] 複数ユーザー同時チャット
- [ ] ネットワーク切断・再接続時のメッセージ同期
- [ ] 長文メッセージの送受信
- [ ] 特殊文字・絵文字の送受信
- [ ] 高頻度メッセージ送信

## 注意事項

- postgres_changes購読の適切な管理
- メッセージ履歴の無制限蓄積防止
- XSS対策（メッセージ内容のサニタイズ）
- 送信頻度制限（スパム防止）

## 関連ファイル

- `src/features/presence/application/usePresenceSync.ts`
- `src/features/room/hooks/useRoom.ts`
- `docs/02_database.md` (messagesテーブルスキーマ)
