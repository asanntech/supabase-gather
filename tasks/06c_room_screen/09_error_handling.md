# [06c_room_screen] 09\_エラーハンドリング

## タスク概要

ルーム画面における各種エラー状態の処理とユーザーフィードバックを実装する。

## 実装内容

### 1. 接続エラー処理

#### 初回接続失敗

```typescript
// エラー状態表示
<ErrorBanner
  message="ルームに接続できません"
  action={<Button onClick={retryConnection}>再試行</Button>}
/>
```

#### 途中切断処理

- 自動再接続（3回まで）
- 再接続状態の表示
- 手動再接続ボタン

#### 認証エラー

- 認証状態の検証
- トップページへのリダイレクト
- エラーメッセージ表示

### 2. 操作エラー処理

#### メッセージ送信エラー

```typescript
const handleSendError = (error: Error) => {
  setError(`送信に失敗しました: ${error.message}`)
  // 再送オプションの提供
  setRetryMessage(draftMessage)
}
```

#### 位置更新エラー

- サイレントリトライ
- バックグラウンド同期
- 重大エラー時の通知

#### 設定変更エラー

- 「設定の保存に失敗しました」
- 前の状態への復元
- 再試行機能

### 3. ネットワーク状態管理

#### オンライン/オフライン検出

```typescript
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}
```

#### 復旧処理

- オンライン復帰の検出
- 自動再接続の実行
- 状態の復元

### 4. エラー UI コンポーネント

#### エラーバナー

```typescript
export function ErrorBanner({
  message,
  type = 'error',
  action,
  onDismiss
}: ErrorBannerProps) {
  return (
    <div className={`error-banner error-banner--${type}`}>
      <Icon name="alert-circle" />
      <span>{message}</span>
      {action}
      {onDismiss && (
        <Button variant="ghost" onClick={onDismiss}>
          <Icon name="x" />
        </Button>
      )}
    </div>
  )
}
```

#### 接続状態インジケーター

- オンライン: 緑色のドット
- 接続中: 黄色のドット + アニメーション
- オフライン: 赤色のドット

### 5. エラー分類と対応

#### 致命的エラー

- 認証失敗 → リダイレクト
- ルーム存在しない → 404ページ
- 権限不足 → アクセス拒否ページ

#### 一時的エラー

- ネットワーク切断 → 自動再試行
- API エラー → リトライ機能
- タイムアウト → 再接続

#### 操作エラー

- 入力検証エラー → フィールドエラー表示
- 送信失敗 → 再送オプション
- 設定保存失敗 → 復元 + 再試行

### 6. ログとモニタリング

#### エラーログ

```typescript
const logError = (error: Error, context: string) => {
  console.error(`[Room] ${context}:`, error)
  // 将来: 外部サービスへの送信
}
```

#### パフォーマンス監視

- 接続時間の測定
- エラー発生率の記録
- ユーザー体験の監視

## エラーメッセージ一覧

### 接続関連

- "ルームに接続できません"
- "接続が切断されました"
- "再接続しています..."
- "認証に失敗しました"

### 操作関連

- "メッセージの送信に失敗しました"
- "設定の保存に失敗しました"
- "ネットワークに接続できません"

## 成果物

- 包括的なエラーハンドリング機能
- エラー UI コンポーネント
- 自動復旧機能

## 次のタスク

10_performance_optimization.md - パフォーマンス最適化の実装
