# 04. 入室準備モーダル表示制御

## 目的

認証完了後に入室準備モーダルを適切なタイミングで表示する機能を実装する

## 実装内容

### 1. モーダル表示状態管理

```typescript
interface ModalState {
  showRoomEntryModal: boolean
  modalData: {
    authType: 'google' | 'guest'
    userId?: string
    userEmail?: string
  }
}
```

### 2. 認証完了後のモーダル表示トリガー

```typescript
useEffect(() => {
  if (authState.isAuthenticated && !authState.isLoading) {
    setShowRoomEntryModal(true)
  }
}, [authState.isAuthenticated, authState.isLoading])
```

### 3. 入室準備モーダルコンポーネント統合

- `src/features/room-entry/ui/components/RoomEntryModal.tsx` の利用
- モーダルの条件付き表示
- 適切なプロップス渡し

### 4. モーダル内容連携

**Google認証ユーザーの場合:**

- ユーザー情報の事前入力
- アバター選択
- 入室ボタン

**ゲストユーザーの場合:**

- 表示名入力フィールド
- アバター選択
- 入室ボタン

### 5. モーダルの状態制御

```typescript
const handleModalClose = () => {
  setShowRoomEntryModal(false)
  // 必要に応じて認証状態をリセット
}

const handleRoomEntry = (entryData: RoomEntryData) => {
  setShowRoomEntryModal(false)
  // ルーム画面への遷移
  router.push('/room/default')
}
```

### 6. URL状態との同期

- モーダル表示状態をクエリパラメータで管理
- ブラウザの戻る/進むボタン対応
- ディープリンク対応

### 7. モーダルアニメーション

- フェードイン/フェードアウト効果
- スムーズな表示/非表示遷移
- shadcn/ui Dialog コンポーネント活用

## 成果物

- 認証後の自動モーダル表示
- 適切なモーダル状態管理
- ユーザータイプ別の最適化
- スムーズなUX遷移

## 依存関係

- 03_auth_state_integration.md（認証状態管理）
- 入室準備モーダルコンポーネント
- shadcn/ui Dialog

## 次のタスク

- エラーハンドリング実装（05_error_handling_ux.md）
