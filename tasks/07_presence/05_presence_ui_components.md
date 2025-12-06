# 05. Presence UI コンポーネント

## 目的

Presence機能のUIコンポーネント（人数表示、オンライン状態、入退室通知）をshadcn/ui + Tailwind CSSで実装する。

## 成果物

- `src/features/presence/components/UserCountDisplay.tsx`
- `src/features/presence/components/OnlineIndicator.tsx`
- `src/features/presence/components/JoinLeaveNotification.tsx`
- `src/features/presence/components/RoomCapacityStatus.tsx`

## 実装内容

### 1. 人数表示コンポーネント

```typescript
// UserCountDisplay.tsx
interface UserCountDisplayProps {
  currentUsers: number
  maxCapacity: number
  className?: string
}

export const UserCountDisplay: React.FC<UserCountDisplayProps> = ({
  currentUsers,
  maxCapacity,
  className
}) => {
  const isFull = currentUsers >= maxCapacity
  const isAlmostFull = currentUsers >= maxCapacity - 1

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-lg border",
      isFull && "border-red-300 bg-red-50",
      isAlmostFull && !isFull && "border-yellow-300 bg-yellow-50",
      !isAlmostFull && "border-green-300 bg-green-50",
      className
    )}>
      <Users className="w-4 h-4" />
      <span className="text-sm font-medium">
        {currentUsers} / {maxCapacity}
      </span>
      {isFull && (
        <Badge variant="destructive" className="text-xs">
          満員
        </Badge>
      )}
    </div>
  )
}
```

### 2. オンライン状態インジケーター

```typescript
// OnlineIndicator.tsx
interface OnlineIndicatorProps {
  isOnline: boolean
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
  isOnline,
  size = 'md',
  showLabel = false,
  className
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div
        className={cn(
          "rounded-full",
          sizeClasses[size],
          isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
        )}
      />
      {showLabel && (
        <span className="text-xs text-gray-600">
          {isOnline ? 'オンライン' : 'オフライン'}
        </span>
      )}
    </div>
  )
}
```

### 3. 入退室通知コンポーネント

```typescript
// JoinLeaveNotification.tsx
interface NotificationProps {
  notifications: Array<{
    id: string
    type: 'join' | 'leave'
    displayName: string
    timestamp: Date
  }>
  onDismiss: (id: string) => void
}

export const JoinLeaveNotification: React.FC<NotificationProps> = ({
  notifications,
  onDismiss
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map(notification => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border",
              notification.type === 'join'
                ? "bg-green-50 border-green-200"
                : "bg-orange-50 border-orange-200"
            )}
          >
            {notification.type === 'join' ? (
              <UserPlus className="w-4 h-4 text-green-600" />
            ) : (
              <UserMinus className="w-4 h-4 text-orange-600" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {notification.displayName}
              </p>
              <p className="text-xs text-gray-500">
                {notification.type === 'join' ? '入室しました' : '退室しました'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDismiss(notification.id)}
              className="w-6 h-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
```

### 4. ルーム容量ステータス

```typescript
// RoomCapacityStatus.tsx
interface RoomCapacityStatusProps {
  capacityResult: RoomCapacityResult
  isChecking?: boolean
}

export const RoomCapacityStatus: React.FC<RoomCapacityStatusProps> = ({
  capacityResult,
  isChecking = false
}) => {
  if (isChecking) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">ルーム状況確認中...</span>
        </div>
      </Card>
    )
  }

  if (!capacityResult.canEnter) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>入室できません</AlertTitle>
        <AlertDescription>
          {capacityResult.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="font-medium">入室可能</span>
        </div>
        <UserCountDisplay
          currentUsers={capacityResult.currentUsers}
          maxCapacity={capacityResult.maxCapacity}
        />
      </div>
    </Card>
  )
}
```

### 5. ユーザーリスト表示

```typescript
// OnlineUsersList.tsx
interface OnlineUsersListProps {
  users: Record<string, PresenceData>
  currentUserId?: string
  className?: string
}

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({
  users,
  currentUserId,
  className
}) => {
  const userList = Object.values(users)

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4" />
        <h3 className="font-semibold text-sm">オンラインユーザー</h3>
        <Badge variant="secondary" className="text-xs">
          {userList.length}
        </Badge>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {userList.map(user => (
          <div
            key={user.user_id || `guest_${user.display_name}`}
            className={cn(
              "flex items-center gap-3 p-2 rounded",
              user.user_id === currentUserId && "bg-blue-50 border border-blue-200"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              {/* アバター画像またはアイコン */}
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.display_name}
                {user.user_id === currentUserId && (
                  <span className="text-xs text-blue-600 ml-1">(あなた)</span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {user.user_type === 'google' ? 'Google' : 'ゲスト'}
              </p>
            </div>
            <OnlineIndicator isOnline={true} size="sm" />
          </div>
        ))}
      </div>
    </Card>
  )
}
```

### 6. 通知管理フック

```typescript
// useNotifications.ts
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string
      type: 'join' | 'leave'
      displayName: string
      timestamp: Date
    }>
  >([])

  const addNotification = useCallback(
    (type: 'join' | 'leave', displayName: string) => {
      const notification = {
        id: `${type}_${Date.now()}_${Math.random()}`,
        type,
        displayName,
        timestamp: new Date(),
      }

      setNotifications(prev => [...prev, notification])

      // 5秒後に自動削除
      setTimeout(() => {
        dismissNotification(notification.id)
      }, 5000)
    },
    []
  )

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return {
    notifications,
    addNotification,
    dismissNotification,
  }
}
```

## アニメーション・UX

### 1. Framer Motion統合

```typescript
// スムーズなアニメーション
const presenceAnimations = {
  fadeIn: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  slideIn: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },
}
```

### 2. レスポンシブデザイン

```typescript
// モバイル対応
const responsiveClasses = {
  userCount: 'text-sm md:text-base',
  notification: 'mx-2 md:mx-0 w-full md:w-auto',
  usersList: 'hidden md:block lg:w-64',
}
```

## 実装手順

1. **基本コンポーネント**
   - UserCountDisplay
   - OnlineIndicator

2. **通知システム**
   - JoinLeaveNotification
   - 通知管理フック

3. **ステータス表示**
   - RoomCapacityStatus
   - OnlineUsersList

4. **アニメーション**
   - Framer Motion統合
   - レスポンシブ対応

## 受け入れ条件

- [ ] 人数表示が状況に応じて色分けされる
- [ ] 入退室通知がスムーズにアニメーション表示される
- [ ] オンライン状態が視覚的に分かりやすい
- [ ] 満員時の警告表示が適切
- [ ] モバイルデバイスで正常に表示される
- [ ] アクセシビリティ要件を満たす

## テストケース

- [ ] 人数変動時のUI更新
- [ ] 通知の自動削除
- [ ] 長い表示名の表示
- [ ] 画面サイズ変更時の対応

## 注意事項

- アクセシビリティ（aria-label等）
- 色覚障害への配慮
- 高解像度ディスプレイ対応
- 通知の重複防止

## 関連ファイル

- `src/features/presence/hooks/useAvatarMovement.ts`
- `src/features/presence/hooks/useNotifications.ts`
- `src/components/ui/` (shadcn/uiコンポーネント)
