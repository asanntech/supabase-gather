# [06c_room_screen] 10_パフォーマンス最適化

## タスク概要

ルーム画面のパフォーマンス最適化とUX改善を実装する。

## 実装内容

### 1. メッセージ管理最適化

#### 仮想スクロール実装

```typescript
// react-window を使用した仮想スクロール
import { FixedSizeList as List } from 'react-window'

const VirtualizedMessageList = ({ messages }: { messages: ChatMessage[] }) => {
  const Row = ({ index, style }: { index: number, style: CSSProperties }) => (
    <div style={style}>
      <MessageItem message={messages[index]} />
    </div>
  )

  return (
    <List
      height={400}
      itemCount={messages.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </List>
  )
}
```

#### メッセージページネーション

- 初回読み込み: 最新50件
- スクロール上部到達: 追加50件読み込み
- 古いメッセージの自動削除（メモリ管理）

#### メモリ管理

```typescript
const useMessageMemoryManager = (messages: ChatMessage[]) => {
  const maxMessages = 200

  return useMemo(() => {
    if (messages.length > maxMessages) {
      return messages.slice(-maxMessages)
    }
    return messages
  }, [messages])
}
```

### 2. リアルタイム更新最適化

#### デバウンス処理

```typescript
const useDebouncePosition = (position: Position, delay: number) => {
  const [debouncedPosition, setDebouncedPosition] = useState(position)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPosition(position)
    }, delay)

    return () => clearTimeout(handler)
  }, [position, delay])

  return debouncedPosition
}
```

#### バッチ処理

```typescript
const usePresenceBatch = () => {
  const [pendingUpdates, setPendingUpdates] = useState<PresenceUpdate[]>([])

  useEffect(() => {
    if (pendingUpdates.length === 0) return

    const timer = setTimeout(() => {
      // バッチでPresence更新を送信
      sendPresenceUpdate(mergePendingUpdates(pendingUpdates))
      setPendingUpdates([])
    }, 100)

    return () => clearTimeout(timer)
  }, [pendingUpdates])

  return {
    addUpdate: (update: PresenceUpdate) =>
      setPendingUpdates(prev => [...prev, update]),
  }
}
```

### 3. コンポーネント最適化

#### React.memo 最適化

```typescript
// アバターコンポーネントの最適化
export const Avatar = React.memo(
  ({ position, avatarType, displayName }: AvatarProps) => {
    // レンダリング処理
  },
  (prevProps, nextProps) => {
    // 位置の差が5px以下なら再レンダリングしない
    const positionDiff =
      Math.abs(prevProps.position.x - nextProps.position.x) +
      Math.abs(prevProps.position.y - nextProps.position.y)

    return (
      positionDiff < 5 &&
      prevProps.avatarType === nextProps.avatarType &&
      prevProps.displayName === nextProps.displayName
    )
  }
)
```

#### useMemo / useCallback 活用

```typescript
const MessageList = ({ messages, onSend }: MessageListProps) => {
  const sortedMessages = useMemo(() =>
    messages.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ), [messages]
  )

  const handleSend = useCallback((content: string) => {
    onSend(content)
  }, [onSend])

  return <MessageListComponent
    messages={sortedMessages}
    onSend={handleSend}
  />
}
```

### 4. アニメーション最適化

#### CSS Transform 活用

```css
.avatar {
  transition: transform 0.3s ease-out;
  will-change: transform;
}

.avatar--moving {
  transform: translate3d(var(--x), var(--y), 0);
}
```

#### requestAnimationFrame 使用

```typescript
const useAnimatedPosition = (targetPosition: Position) => {
  const [currentPosition, setCurrentPosition] = useState(targetPosition)

  useEffect(() => {
    let animationId: number

    const animate = () => {
      setCurrentPosition(current => {
        const dx = targetPosition.x - current.x
        const dy = targetPosition.y - current.y

        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
          return targetPosition
        }

        return {
          x: current.x + dx * 0.1,
          y: current.y + dy * 0.1,
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [targetPosition])

  return currentPosition
}
```

### 5. ネットワーク最適化

#### 差分更新のみ送信

```typescript
const useEfficientPresence = () => {
  const [lastSentData, setLastSentData] = useState<PresenceData | null>(null)

  const sendPresenceUpdate = useCallback(
    (newData: PresenceData) => {
      if (!lastSentData) {
        // 初回送信
        channel.track(newData)
        setLastSentData(newData)
        return
      }

      // 差分のみ送信
      const diff = createDiff(lastSentData, newData)
      if (Object.keys(diff).length > 0) {
        channel.track({ ...lastSentData, ...diff })
        setLastSentData(newData)
      }
    },
    [lastSentData, channel]
  )

  return sendPresenceUpdate
}
```

#### 接続プールing

- Supabase接続の再利用
- チャンネルの効率的管理
- 不要な接続の自動切断

### 6. バンドルサイズ最適化

#### 動的インポート

```typescript
const AdvancedSettings = lazy(() =>
  import('./advanced-settings').then(module => ({
    default: module.AdvancedSettings
  }))
)

// 必要時のみ読み込み
{showAdvanced && (
  <Suspense fallback={<SettingsLoading />}>
    <AdvancedSettings />
  </Suspense>
)}
```

#### Tree Shaking 対応

- 使用するライブラリ機能のみインポート
- 未使用コードの削除
- バンドル分析とサイズ監視

### 7. 監視とメトリクス

#### パフォーマンス測定

```typescript
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    messageCount: 0,
    connectionLatency: 0,
  })

  useEffect(() => {
    const observer = new PerformanceObserver(list => {
      const entries = list.getEntries()
      // メトリクス収集
    })

    observer.observe({ entryTypes: ['measure'] })
    return () => observer.disconnect()
  }, [])

  return metrics
}
```

#### Core Web Vitals 監視

- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

## 成果物

- 仮想スクロールによるメッセージ最適化
- デバウンス・バッチ処理による通信効率化
- React最適化によるレンダリング改善
- パフォーマンス監視機能

## 実装完了

全10タスクでルーム画面の完全な実装が完了します。
