# 03. 認証状態管理統合

## 目的

認証システムとランディングページの状態管理を統合し、認証フローを実装する

## 実装内容

### 1. 認証フック統合

- `src/features/auth/application/hooks/use-auth.ts` の活用
- ページレベルでの認証状態管理
- 認証メソッド（Google/ゲスト）の呼び出し

### 2. 認証ストア連携

- `src/features/auth/application/stores/auth-store.ts` との統合
- Zustand ストアからの状態取得
- 認証状態の変更監視

### 3. ページ状態管理

```typescript
interface LandingPageState {
  isAuthenticating: boolean
  authError: string | null
  authType: 'google' | 'guest' | null
}
```

### 4. 認証フロー実装

**Google認証フロー:**

```typescript
const handleGoogleAuth = async () => {
  setIsAuthenticating(true)
  try {
    await signInWithGoogle()
    // 成功時の処理
  } catch (error) {
    setAuthError(error.message)
  } finally {
    setIsAuthenticating(false)
  }
}
```

**ゲスト認証フロー:**

```typescript
const handleGuestAuth = async () => {
  try {
    await signInAsGuest()
    // 即座にモーダル表示
  } catch (error) {
    setAuthError(error.message)
  }
}
```

### 5. 認証ボタンとの連携

- ボタンコンポーネントへの状態とハンドラー渡し
- ローディング状態の適切な反映
- エラー状態の表示

### 6. TanStack Query統合

- 認証状態のキャッシュ管理
- 認証フローの最適化
- エラー状態の自動リトライ

## 成果物

- 完全な認証フロー実装
- 状態管理の統一
- エラーハンドリング機能
- ローディング状態の管理

## 依存関係

- 02_auth_buttons.md（ボタンコンポーネント）
- 認証システム（use-auth フック、auth-store）
- TanStack Query

## 次のタスク

- 入室準備モーダル表示制御（04_room_entry_modal_trigger.md）
