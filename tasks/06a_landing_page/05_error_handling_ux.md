# 05. エラーハンドリングとUX改善

## 目的

認証エラー、ネットワークエラーなどの適切な処理とユーザーエクスペリエンス向上を実装する

## 実装内容

### 1. エラー状態管理

```typescript
interface ErrorState {
  authError: string | null
  networkError: string | null
  showErrorToast: boolean
}

type AuthErrorType =
  | 'google_auth_failed'
  | 'network_error'
  | 'permission_denied'
  | 'popup_blocked'
  | 'unknown_error'
```

### 2. Google認証エラーハンドリング

- **認証失敗**: 「Googleログインに失敗しました。再度お試しください。」
- **ポップアップブロック**: 「ポップアップがブロックされました。ブラウザ設定を確認してください。」
- **権限エラー**: 「認証の権限が拒否されました。」
- **ネットワークエラー**: 「ネットワーク接続を確認してください。」

### 3. エラー表示コンポーネント

- `src/shared/ui/components/ErrorToast.tsx` を作成
- shadcn/ui Toast コンポーネント活用
- 自動消失タイマー設定
- エラータイプ別のアイコンとスタイル

### 4. 再試行機能

```typescript
const handleRetry = async (action: () => Promise<void>) => {
  setRetryCount(prev => prev + 1)
  if (retryCount < MAX_RETRY_COUNT) {
    await action()
  } else {
    showPersistentError()
  }
}
```

### 5. ローディング状態の改善

- **ボタン無効化**: ダブルクリック防止
- **ローディングスピナー**: 視覚的フィードバック
- **プログレスインジケーター**: 長時間処理の場合

### 6. ユーザーフレンドリーなメッセージ

- 技術的なエラーメッセージの翻訳
- 解決策の提示
- 問い合わせ先の案内

### 7. オフライン対応

```typescript
const { isOnline } = useNetworkStatus()

useEffect(() => {
  if (!isOnline) {
    showOfflineMessage()
  }
}, [isOnline])
```

### 8. ログ記録機能

- エラー発生時の詳細ログ
- ユーザーアクション追跡
- デバッグ情報の収集

## 成果物

- 包括的なエラーハンドリング機能
- ユーザーフレンドリーなエラーメッセージ
- 再試行とフォールバック機能
- 堅牢なオフライン対応

## 依存関係

- 03_auth_state_integration.md（認証機能）
- shadcn/ui Toast コンポーネント
- ネットワーク状態管理

## 次のタスク

- Figmaデザイン実装（06_figma_design_implementation.md）
