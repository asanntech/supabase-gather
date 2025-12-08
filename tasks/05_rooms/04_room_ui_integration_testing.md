# [05_rooms] 04\_ルームUI統合・テスト実装

## 概要

ルーム機能の全要素（Presence、チャット、UI）を統合し、完全なバーチャルオフィス体験を提供するUIとエンドツーエンドテストを実装する。

## 前提条件

- ルームドメイン基盤が実装済み
- Presence・定員管理システムが実装済み
- リアルタイムチャット機能が実装済み

## 実装対象

### 1. 統合ルームUI

Presence、チャット、定員表示を統合したルーム画面

### 2. リアルタイム状態管理

全機能のリアルタイム同期とエラーハンドリング

### 3. エンドツーエンドテスト

実際のユーザーシナリオでの動作確認

## 詳細仕様

### 統合ルームコンテナ

```typescript
// src/features/rooms/presentation/components/RoomContainer.tsx
interface RoomContainerProps {
  roomId: string;
}

export function RoomContainer({ roomId }: RoomContainerProps) {
  const { user } = useAuth();
  const navigation = useNavigation();

  const {
    members,
    capacity,
    loading: presenceLoading,
    error: presenceError,
    joinRoom,
    leaveRoom,
    isConnected,
  } = useRoomPresence(roomId);

  const {
    messages,
    loading: chatLoading,
    error: chatError,
    sendMessage,
    loadMoreMessages,
  } = useRoomChat(roomId);

  const [roomState, setRoomState] = useState<'joining' | 'active' | 'leaving' | 'error'>('joining');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ルーム入室処理
  useEffect(() => {
    const handleRoomJoin = async () => {
      if (!user) {
        setRoomState('error');
        setErrorMessage('認証が必要です');
        return;
      }

      try {
        setRoomState('joining');
        const result = await joinRoom();

        if (result.success) {
          setRoomState('active');
          setErrorMessage(null);
        } else {
          setRoomState('error');
          setErrorMessage(result.error || 'ルームに入室できませんでした');
        }
      } catch (error) {
        setRoomState('error');
        setErrorMessage('入室処理でエラーが発生しました');
      }
    };

    handleRoomJoin();

    return () => {
      if (roomState === 'active') {
        leaveRoom();
      }
    };
  }, [user, joinRoom, leaveRoom]);

  // エラー統合処理
  const currentError = errorMessage || presenceError || chatError;

  // 退室処理
  const handleLeaveRoom = useCallback(async () => {
    setRoomState('leaving');
    await leaveRoom();
    navigation.goToHome();
  }, [leaveRoom, navigation]);

  // ローディング状態
  if (roomState === 'joining' || presenceLoading) {
    return <RoomLoadingScreen message="ルームに入室中..." />;
  }

  // エラー状態
  if (roomState === 'error' || currentError) {
    return (
      <RoomErrorScreen
        error={currentError || '不明なエラーが発生しました'}
        onRetry={() => window.location.reload()}
        onExit={handleLeaveRoom}
      />
    );
  }

  // メインルーム画面
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* ヘッダー */}
      <RoomHeader
        roomId={roomId}
        capacity={capacity}
        onLeaveRoom={handleLeaveRoom}
      />

      {/* メインコンテンツ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 2Dスペース */}
        <div className="flex-1 relative">
          <AvatarSpace
            roomId={roomId}
            members={members}
            currentUser={user}
          />
        </div>

        {/* チャットサイドバー */}
        <div className="w-80 border-l border-gray-200">
          <ChatSidebar
            messages={messages}
            loading={chatLoading}
            onSendMessage={sendMessage}
            onLoadMore={loadMoreMessages}
          />
        </div>
      </div>

      {/* フッター */}
      <RoomFooter
        user={user}
        members={members}
        isConnected={isConnected}
      />
    </div>
  );
}
```

### ルームヘッダー

```typescript
// src/features/rooms/presentation/components/RoomHeader.tsx
interface RoomHeaderProps {
  roomId: string;
  capacity: RoomCapacity;
  onLeaveRoom: () => void;
}

export function RoomHeader({ roomId, capacity, onLeaveRoom }: RoomHeaderProps) {
  const roomName = roomId === 'main-room' ? 'メインルーム' : `ルーム: ${roomId}`;

  const capacityStatus = useMemo(() => {
    if (capacity.isFull) return { color: 'red', label: '満員' };
    if (capacity.current >= capacity.max * 0.8) return { color: 'yellow', label: '混雑' };
    return { color: 'green', label: '空いている' };
  }, [capacity]);

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* ルーム情報 */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {roomName}
          </h1>

          {/* 定員表示 */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full bg-${capacityStatus.color}-500`}></div>
            <span className="text-sm text-gray-600">
              {capacity.current}/{capacity.max} 人
            </span>
            <span className={`text-xs px-2 py-1 rounded-full bg-${capacityStatus.color}-100 text-${capacityStatus.color}-800`}>
              {capacityStatus.label}
            </span>
          </div>
        </div>

        {/* アクション */}
        <div className="flex items-center space-x-3">
          {/* ルーム設定（将来拡張用） */}
          <button
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="ルーム設定"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          {/* 退室ボタン */}
          <button
            onClick={onLeaveRoom}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            退室する
          </button>
        </div>
      </div>
    </header>
  );
}
```

### アバタースペース（2Dエリア）

```typescript
// src/features/rooms/presentation/components/AvatarSpace.tsx
interface AvatarSpaceProps {
  roomId: string;
  members: PresenceState[];
  currentUser: User | null;
}

export function AvatarSpace({ roomId, members, currentUser }: AvatarSpaceProps) {
  const spaceRef = useRef<HTMLDivElement>(null);
  const [spaceSize, setSpaceSize] = useState({ width: 0, height: 0 });

  // スペースサイズの監視
  useEffect(() => {
    const updateSize = () => {
      if (spaceRef.current) {
        const { clientWidth, clientHeight } = spaceRef.current;
        setSpaceSize({ width: clientWidth, height: clientHeight });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div
      ref={spaceRef}
      className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden"
    >
      {/* グリッド背景 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #d1d5db 1px, transparent 1px),
            linear-gradient(180deg, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* メンバーアバター */}
      {members.map((member) => (
        <AvatarMarker
          key={member.clientId}
          member={member}
          isCurrentUser={currentUser?.id === member.userId || currentUser?.id === member.clientId}
          spaceSize={spaceSize}
        />
      ))}

      {/* 空の状態 */}
      {members.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-lg">誰もいません</p>
            <p className="text-sm">あなたが最初のメンバーです！</p>
          </div>
        </div>
      )}
    </div>
  );
}

// src/features/rooms/presentation/components/AvatarMarker.tsx
interface AvatarMarkerProps {
  member: PresenceState;
  isCurrentUser: boolean;
  spaceSize: { width: number; height: number };
}

function AvatarMarker({ member, isCurrentUser, spaceSize }: AvatarMarkerProps) {
  // ランダム位置生成（将来は実際の座標を保存）
  const position = useMemo(() => {
    const seed = member.clientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const x = (seed * 7919) % Math.max(spaceSize.width - 80, 100);
    const y = (seed * 7907) % Math.max(spaceSize.height - 80, 100);

    return {
      x: Math.max(40, Math.min(x, spaceSize.width - 40)),
      y: Math.max(40, Math.min(y, spaceSize.height - 40)),
    };
  }, [member.clientId, spaceSize]);

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
        isCurrentUser ? 'z-20' : 'z-10'
      }`}
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {/* アバター */}
      <div className={`relative ${isCurrentUser ? 'ring-4 ring-blue-500' : ''} rounded-full`}>
        <div
          className={`w-12 h-12 rounded-full bg-${member.avatarType}-500 flex items-center justify-center text-white font-bold shadow-lg`}
        >
          {member.displayName.charAt(0).toUpperCase()}
        </div>

        {/* オンライン状態 */}
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
      </div>

      {/* 名前表示 */}
      <div className="absolute top-14 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
        <div className={`px-2 py-1 rounded text-xs font-medium ${
          isCurrentUser
            ? 'bg-blue-500 text-white'
            : 'bg-white text-gray-700 border border-gray-200'
        }`}>
          {member.displayName}
          {isCurrentUser && ' (あなた)'}
        </div>
      </div>
    </div>
  );
}
```

### チャットサイドバー

```typescript
// src/features/rooms/presentation/components/ChatSidebar.tsx
interface ChatSidebarProps {
  messages: Message[];
  loading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  onLoadMore: () => Promise<void>;
}

export function ChatSidebar({ messages, loading, onSendMessage, onLoadMore }: ChatSidebarProps) {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが来たら下にスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await onSendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('メッセージ送信エラー:', error);
      // エラートーストを表示（実装に応じて）
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">チャット</h3>
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* 過去のメッセージを読み込むボタン */}
        {messages.length >= 20 && (
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
          >
            {loading ? '読み込み中...' : '過去のメッセージを読み込む'}
          </button>
        )}

        {/* メッセージ */}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {/* 空の状態 */}
        {messages.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-8">
            <p>まだメッセージがありません</p>
            <p className="text-sm">最初のメッセージを送ってみましょう！</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* メッセージ入力 */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={1000}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '送信中...' : '送信'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

### エンドツーエンドテスト

```typescript
// __tests__/rooms/room-integration.test.tsx
describe('ルーム機能 統合テスト', () => {
  beforeEach(() => {
    // テスト環境のセットアップ
    setupTestEnvironment();
  });

  describe('ルーム入退室フロー', () => {
    it('認証済みユーザーがルームに入室できる', async () => {
      const { user } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <TestWrapper initialAuth={{ user: mockGoogleUser }}>
            {children}
          </TestWrapper>
        ),
      });

      render(
        <TestWrapper>
          <RoomContainer roomId="main-room" />
        </TestWrapper>
      );

      // ローディング状態
      expect(screen.getByText(/入室中/i)).toBeInTheDocument();

      // 入室完了を待機
      await waitFor(() => {
        expect(screen.getByText(/メインルーム/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /退室/i })).toBeInTheDocument();
      });
    });

    it('定員超過時に適切なエラーが表示される', async () => {
      // 5人のユーザーがすでに入室している状態をモック
      mockPresenceService.mockImplementation(() => ({
        getCurrentCount: () => 5,
        joinRoom: () => Promise.resolve({ success: false, error: 'ルームが満員です' }),
      }));

      render(
        <TestWrapper>
          <RoomContainer roomId="main-room" />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/満員/i)).toBeInTheDocument();
      });
    });
  });

  describe('リアルタイムチャット', () => {
    it('メッセージの送受信が正常に動作する', async () => {
      const { result } = renderHook(() => useRoomChat('main-room'), {
        wrapper: TestWrapper,
      });

      // メッセージ送信
      await act(async () => {
        await result.current.sendMessage('テストメッセージ');
      });

      // リアルタイム受信を待機
      await waitFor(() => {
        expect(result.current.messages).toContainEqual(
          expect.objectContaining({
            content: 'テストメッセージ',
          })
        );
      });
    });

    it('複数ユーザーでのメッセージ送受信', async () => {
      // 2つのクライアントをシミュレート
      const client1 = renderHook(() => useRoomChat('main-room'), { wrapper: TestWrapper });
      const client2 = renderHook(() => useRoomChat('main-room'), { wrapper: TestWrapper });

      // Client1がメッセージ送信
      await act(async () => {
        await client1.result.current.sendMessage('Client1からのメッセージ');
      });

      // 両クライアントでメッセージ受信確認
      await waitFor(() => {
        expect(client1.result.current.messages).toHaveLength(1);
        expect(client2.result.current.messages).toHaveLength(1);
      });
    });
  });

  describe('Presence機能', () => {
    it('メンバーリストがリアルタイムで更新される', async () => {
      const { result } = renderHook(() => useRoomPresence('main-room'), {
        wrapper: ({ children }) => (
          <TestWrapper initialAuth={{ user: mockGoogleUser }}>
            {children}
          </TestWrapper>
        ),
      });

      // 入室
      await act(async () => {
        await result.current.joinRoom();
      });

      // メンバーリストに自分が表示される
      await waitFor(() => {
        expect(result.current.members).toHaveLength(1);
        expect(result.current.capacity.current).toBe(1);
      });

      // 他のユーザーが入室（シミュレート）
      act(() => {
        mockPresenceService.simulateUserJoin(mockGuestUser);
      });

      await waitFor(() => {
        expect(result.current.members).toHaveLength(2);
        expect(result.current.capacity.current).toBe(2);
      });
    });
  });
});

// パフォーマンステスト
describe('ルーム機能 パフォーマンステスト', () => {
  it('大量のメッセージ表示でのパフォーマンス', async () => {
    const largeMessageList = Array.from({ length: 1000 }, (_, i) => ({
      id: `msg-${i}`,
      content: `メッセージ ${i}`,
      displayName: `ユーザー${i % 10}`,
      avatarType: 'blue',
      createdAt: new Date(),
    }));

    const startTime = performance.now();

    render(
      <TestWrapper>
        <ChatSidebar
          messages={largeMessageList}
          loading={false}
          onSendMessage={jest.fn()}
          onLoadMore={jest.fn()}
        />
      </TestWrapper>
    );

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000); // 1秒以内
  });
});
```

## 成果物

- 統合ルームUI（ヘッダー、2Dスペース、チャット）
- リアルタイム状態管理
- エンドツーエンドテスト
- パフォーマンステスト

## 検証項目

### 機能テスト

- [ ] ルーム入退室の動作
- [ ] リアルタイムチャット
- [ ] Presence表示・更新
- [ ] 定員制限の動作
- [ ] エラーハンドリング

### ユーザビリティテスト

- [ ] 直感的な操作性
- [ ] リアルタイム更新の体感
- [ ] レスポンシブデザイン

### パフォーマンステスト

- [ ] 大量メッセージでの動作
- [ ] メモリ使用量
- [ ] リアルタイム更新の遅延

## 本番環境準備

- Supabase Realtime最適化
- エラー監視・ログ設定
- パフォーマンス監視

## 次のフェーズへの準備

ルーム機能完了により、アバターシステム実装の準備が整いました。

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"id": "1", "content": "Analyze 05_rooms.md structure and dependencies", "status": "completed", "priority": "high"}, {"id": "2", "content": "Create task directory structure for rooms", "status": "completed", "priority": "high"}, {"id": "3", "content": "Create room management tasks", "status": "completed", "priority": "high"}, {"id": "4", "content": "Create presence and capacity tasks", "status": "completed", "priority": "high"}, {"id": "5", "content": "Create realtime integration tasks", "status": "completed", "priority": "high"}, {"id": "6", "content": "Create room UI and testing tasks", "status": "completed", "priority": "high"}]
