# 06. チャット基本機能

## タスク概要

リアルタイムチャット機能の基本的な送受信機能を実装する。

## 実装内容

### 1. チャットパネルコンポーネント

`src/features/chat/ui/chat-panel.tsx`
- メッセージ一覧表示
- メッセージ入力フィールド
- 送信ボタン

### 2. チャット状態管理

`src/features/chat/application/hooks/use-chat.ts`
```typescript
type ChatState = {
  messages: ChatMessage[]
  isLoading: boolean
  isSending: boolean
  draft: string
  error: string | null
}
```

### 3. メッセージデータ構造

```typescript
type ChatMessage = {
  id: string
  room_id: string
  user_type: 'google' | 'guest'
  user_id: string | null
  display_name: string
  avatar_type: AvatarType
  content: string
  created_at: string
}
```

### 4. メッセージ表示

#### メッセージアイテム
- 送信者のアバターアイコン
- 表示名
- メッセージ内容
- タイムスタンプ（HH:mm形式）

#### スクロール機能
- 新着メッセージでの自動スクロール
- 手動スクロールの検出
- メッセージ履歴の表示

### 5. メッセージ送信

#### 入力制御
- 最大文字数: 500文字
- Enterキーでの送信
- Shift+Enterでの改行
- 送信中の入力無効化

#### 送信処理
- バリデーション
- データベース保存
- エラーハンドリング

### 6. 初期メッセージ取得

- ルーム参加時の過去メッセージ読み込み
- ページネーション対応準備
- 時系列順ソート

## UI仕様

### レイアウト
- 右側エリア（400px幅）
- メッセージ一覧: 上部
- 入力エリア: 下部固定

### スタイリング
- shadcn/ui コンポーネント使用
- Tailwind CSS でのカスタマイズ
- モバイル対応レイアウト

## 成果物

- `src/features/chat/ui/chat-panel.tsx`
- `src/features/chat/application/hooks/use-chat.ts`
- 基本的なチャット送受信機能

## 次のタスク

07_chat_realtime.md - チャットリアルタイム機能の実装