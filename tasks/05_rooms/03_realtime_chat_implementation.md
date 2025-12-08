# [05_rooms] 03\_リアルタイムチャット機能実装

## 概要

Supabase Realtimeを利用したリアルタイムチャット機能を実装し、Google・ゲストユーザー両対応のメッセージ送受信システムを構築する。

## 前提条件

- ルームドメイン基盤が実装済み
- Presence・定員管理システムが実装済み
- データベースのmessagesテーブルが作成済み

## 実装対象

### 1. リアルタイムメッセージング

Supabase Realtimeによるメッセージ送受信

### 2. メッセージ永続化

Google・ゲストユーザー両対応のメッセージ保存

### 3. チャットUI統合

リアルタイム更新されるチャットインターフェース

## 詳細仕様

### メッセージドメインモデル

```typescript
// src/features/rooms/domain/entities/Message.ts
export interface Message {
  id: string
  roomId: string
  userType: 'google' | 'guest'
  userId: string | null // ゲストの場合はnull
  displayName: string
  avatarType: string
  content: string
  createdAt: Date
}

export interface MessageInput {
  content: string
  displayName: string
  avatarType: string
  userType: 'google' | 'guest'
  userId?: string
}

// src/features/rooms/domain/value-objects/MessageContent.ts
export class MessageContent {
  private static readonly MAX_LENGTH = 1000
  private static readonly MIN_LENGTH = 1

  constructor(private readonly value: string) {
    this.validate(value)
  }

  static create(value: string): MessageContent {
    return new MessageContent(value.trim())
  }

  getValue(): string {
    return this.value
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new Error('メッセージ内容が空です')
    }

    if (value.length > MessageContent.MAX_LENGTH) {
      throw new Error(
        `メッセージは${MessageContent.MAX_LENGTH}文字以内で入力してください`
      )
    }

    if (value.length < MessageContent.MIN_LENGTH) {
      throw new Error('メッセージが短すぎます')
    }

    // 不適切なコンテンツのチェック（基本的なもの）
    if (this.containsInappropriateContent(value)) {
      throw new Error('不適切な内容が含まれています')
    }
  }

  private containsInappropriateContent(value: string): boolean {
    // 基本的なフィルタリング
    const inappropriatePatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/gi, // XSS対策
      /<[^>]*>/g, // HTML タグ
    ]

    return inappropriatePatterns.some(pattern => pattern.test(value))
  }
}
```

### メッセージRepository

```typescript
// src/features/rooms/domain/repositories/MessageRepository.ts
export interface MessageRepository {
  findByRoomId(
    roomId: string,
    limit?: number,
    offset?: number
  ): Promise<Message[]>
  create(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message>
  findRecent(roomId: string, limit: number): Promise<Message[]>
  countByRoomId(roomId: string): Promise<number>
  deleteOldMessages(roomId: string, keepCount: number): Promise<void>
}

// src/features/rooms/infrastructure/supabase/SupabaseMessageRepository.ts
export class SupabaseMessageRepository implements MessageRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByRoomId(
    roomId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`メッセージ取得エラー: ${error.message}`)
    }

    return data?.map(this.mapToMessage) || []
  }

  async create(message: Omit<Message, 'id' | 'createdAt'>): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert([
        {
          room_id: message.roomId,
          user_type: message.userType,
          user_id: message.userId,
          display_name: message.displayName,
          avatar_type: message.avatarType,
          content: message.content,
        },
      ])
      .select()
      .single()

    if (error) {
      throw new Error(`メッセージ投稿エラー: ${error.message}`)
    }

    return this.mapToMessage(data)
  }

  async findRecent(roomId: string, limit: number): Promise<Message[]> {
    return this.findByRoomId(roomId, limit, 0)
  }

  async countByRoomId(roomId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)

    if (error) {
      throw new Error(`メッセージ数取得エラー: ${error.message}`)
    }

    return count || 0
  }

  async deleteOldMessages(roomId: string, keepCount: number): Promise<void> {
    // 古いメッセージを削除（keepCount件を残す）
    const { data: messagesToKeep } = await this.supabase
      .from('messages')
      .select('id')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false })
      .limit(keepCount)

    if (messagesToKeep && messagesToKeep.length > 0) {
      const idsToKeep = messagesToKeep.map(m => m.id)

      const { error } = await this.supabase
        .from('messages')
        .delete()
        .eq('room_id', roomId)
        .not('id', 'in', `(${idsToKeep.join(',')})`)

      if (error) {
        throw new Error(`古いメッセージ削除エラー: ${error.message}`)
      }
    }
  }

  private mapToMessage(data: any): Message {
    return {
      id: data.id,
      roomId: data.room_id,
      userType: data.user_type,
      userId: data.user_id,
      displayName: data.display_name,
      avatarType: data.avatar_type,
      content: data.content,
      createdAt: new Date(data.created_at),
    }
  }
}
```

### リアルタイムメッセージング

```typescript
// src/features/rooms/infrastructure/supabase/SupabaseRealtimeMessageService.ts
export class SupabaseRealtimeMessageService {
  private channel: RealtimeChannel | null = null
  private messageHandlers: ((message: Message) => void)[] = []

  constructor(private supabase: SupabaseClient) {}

  async subscribeToRoom(roomId: string): Promise<void> {
    // 既存の購読を解除
    await this.unsubscribeFromRoom()

    this.channel = this.supabase.channel(`messages:${roomId}`)

    this.channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        payload => {
          this.handleNewMessage(payload.new as any)
        }
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          console.log('リアルタイムメッセージング接続完了:', roomId)
        }
      })
  }

  async unsubscribeFromRoom(): Promise<void> {
    if (this.channel) {
      await this.channel.unsubscribe()
      this.channel = null
    }
  }

  onNewMessage(handler: (message: Message) => void): void {
    this.messageHandlers.push(handler)
  }

  removeMessageHandler(handler: (message: Message) => void): void {
    const index = this.messageHandlers.indexOf(handler)
    if (index > -1) {
      this.messageHandlers.splice(index, 1)
    }
  }

  private handleNewMessage(data: any): void {
    const message: Message = {
      id: data.id,
      roomId: data.room_id,
      userType: data.user_type,
      userId: data.user_id,
      displayName: data.display_name,
      avatarType: data.avatar_type,
      content: data.content,
      createdAt: new Date(data.created_at),
    }

    // 全ハンドラーに通知
    this.messageHandlers.forEach(handler => {
      try {
        handler(message)
      } catch (error) {
        console.error('メッセージハンドラーエラー:', error)
      }
    })
  }
}
```

### メッセージユースケース

```typescript
// src/features/rooms/application/use-cases/SendMessageUseCase.ts
export class SendMessageUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private roomValidationService: RoomValidationService
  ) {}

  async execute(
    roomId: string,
    messageInput: MessageInput,
    user: User
  ): Promise<Message> {
    // 1. ルーム存在確認
    const roomIdObj = RoomId.create(roomId)
    const roomValidation = await this.roomValidationService.validateRoomAccess(
      roomIdObj,
      user.userType === 'google' ? user.id : undefined
    )

    if (!roomValidation.isValid) {
      throw new Error(roomValidation.error || 'ルームにアクセスできません')
    }

    // 2. メッセージ内容検証
    const messageContent = MessageContent.create(messageInput.content)

    // 3. メッセージオブジェクト作成
    const message: Omit<Message, 'id' | 'createdAt'> = {
      roomId,
      userType: user.userType,
      userId: user.userType === 'google' ? user.id : null,
      displayName: messageInput.displayName || user.name,
      avatarType: messageInput.avatarType || user.avatarType,
      content: messageContent.getValue(),
    }

    // 4. メッセージ保存
    return await this.messageRepository.create(message)
  }
}

// src/features/rooms/application/use-cases/GetRoomMessagesUseCase.ts
export class GetRoomMessagesUseCase {
  constructor(
    private messageRepository: MessageRepository,
    private roomValidationService: RoomValidationService
  ) {}

  async execute(
    roomId: string,
    options: {
      limit?: number
      offset?: number
      userId?: string
    } = {}
  ): Promise<Message[]> {
    const { limit = 50, offset = 0, userId } = options

    // ルーム存在確認
    const roomIdObj = RoomId.create(roomId)
    const roomValidation = await this.roomValidationService.validateRoomAccess(
      roomIdObj,
      userId
    )

    if (!roomValidation.isValid) {
      throw new Error(roomValidation.error || 'ルームにアクセスできません')
    }

    // メッセージ取得（新しい順）
    const messages = await this.messageRepository.findByRoomId(
      roomId,
      limit,
      offset
    )

    // 表示用に古い順に並べ替え
    return messages.reverse()
  }
}
```

### React統合Hook

```typescript
// src/features/rooms/presentation/hooks/useRoomChat.ts
export function useRoomChat(roomId?: string) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messageRepository = useMemo(() => {
    const supabase = createClient(/* config */)
    return new SupabaseMessageRepository(supabase)
  }, [])

  const realtimeService = useMemo(() => {
    const supabase = createClient(/* config */)
    return new SupabaseRealtimeMessageService(supabase)
  }, [])

  const sendMessageUseCase = useMemo(() => {
    const validationService = new RoomValidationService(/* 依存注入 */)
    return new SendMessageUseCase(messageRepository, validationService)
  }, [messageRepository])

  const getMessagesUseCase = useMemo(() => {
    const validationService = new RoomValidationService(/* 依存注入 */)
    return new GetRoomMessagesUseCase(messageRepository, validationService)
  }, [messageRepository])

  // 初期メッセージ読み込み
  useEffect(() => {
    if (!roomId) return

    const loadMessages = async () => {
      setLoading(true)
      setError(null)

      try {
        const initialMessages = await getMessagesUseCase.execute(roomId, {
          limit: 50,
          userId: user?.userType === 'google' ? user.id : undefined,
        })

        setMessages(initialMessages)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'メッセージの読み込みに失敗しました'
        )
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [roomId, getMessagesUseCase, user])

  // リアルタイム購読
  useEffect(() => {
    if (!roomId) return

    const handleNewMessage = (newMessage: Message) => {
      setMessages(prev => {
        // 重複チェック
        if (prev.some(msg => msg.id === newMessage.id)) {
          return prev
        }
        return [...prev, newMessage]
      })
    }

    realtimeService.subscribeToRoom(roomId)
    realtimeService.onNewMessage(handleNewMessage)

    return () => {
      realtimeService.removeMessageHandler(handleNewMessage)
      realtimeService.unsubscribeFromRoom()
    }
  }, [roomId, realtimeService])

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !roomId) {
        throw new Error('ユーザー情報またはルーム情報が不足しています')
      }

      if (!content.trim()) {
        throw new Error('メッセージ内容を入力してください')
      }

      try {
        const messageInput: MessageInput = {
          content,
          displayName: user.name,
          avatarType: user.avatarType,
          userType: user.userType,
          userId: user.userType === 'google' ? user.id : undefined,
        }

        await sendMessageUseCase.execute(roomId, messageInput, user)
        // リアルタイムで追加されるため、ここでは state 更新不要
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'メッセージの送信に失敗しました'
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    },
    [user, roomId, sendMessageUseCase]
  )

  const loadMoreMessages = useCallback(async () => {
    if (!roomId || loading) return

    setLoading(true)

    try {
      const olderMessages = await getMessagesUseCase.execute(roomId, {
        limit: 20,
        offset: messages.length,
        userId: user?.userType === 'google' ? user.id : undefined,
      })

      setMessages(prev => [...olderMessages, ...prev])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '過去のメッセージ読み込みに失敗しました'
      )
    } finally {
      setLoading(false)
    }
  }, [roomId, loading, messages.length, getMessagesUseCase, user])

  return {
    messages,
    loading,
    error,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages: messages.length >= 50, // 簡易判定
  }
}
```

## 成果物

- リアルタイムメッセージング機能
- メッセージ永続化システム
- メッセージ送受信ユースケース
- React統合チャットHook

## 検証方法

### テストケース

1. **メッセージ送受信**
   - Google・ゲストユーザーの送信
   - リアルタイム受信確認
   - メッセージの永続化

2. **バリデーション**
   - 不正な内容のフィルタリング
   - 文字数制限の確認
   - XSS対策の動作

3. **パフォーマンス**
   - 大量メッセージでの動作
   - リアルタイム更新の遅延

## セキュリティ考慮事項

- **コンテンツフィルタリング**: 不適切な内容の検出・除去
- **XSS対策**: HTMLタグのエスケープ
- **レート制限**: スパム防止（将来実装）

## パフォーマンス最適化

- **メッセージ制限**: 古いメッセージの自動削除
- **仮想スクロール**: 大量メッセージでのUI最適化
- **キャッシュ戦略**: 過去メッセージのローカル保存

## 次のタスクへの準備

リアルタイムチャット完了により、ルーム統合UI実装準備完了
