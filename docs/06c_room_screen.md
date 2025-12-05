# 06c. ルーム画面実装

## 概要

メインのバーチャルオフィス体験を提供するルーム画面（`/room/:room_id`）の実装。
2Dスペースでのアバター移動とリアルタイムチャットを中心とした機能を提供する。

## 画面仕様

### ルート

- **パス**: `/room/:room_id`
- **MVP版**: `/room/main-room`（固定）
- **コンポーネント**: `src/app/room/[room_id]/page.tsx`

### レイアウト構成

#### 全体レイアウト（3分割）

1. **上部バー**: ルーム情報・接続状況表示
2. **左側エリア**: 2Dスペース（アバター移動）
3. **右側エリア**: リアルタイムチャット
4. **下部バー**: 設定・退室コントロール

## 機能要件

### 1. 上部バー

#### ルーム情報表示

- **ルーム名**: 「メインルーム」等の表示
- **接続人数**: 「3 / 5」形式で現在の接続状況
- **満員時表示**: 「5 / 5」を赤色でハイライト
- **接続状態**: オンライン・オフラインインジケーター

#### リアルタイム更新

- Presence チャンネルで接続数を監視
- 入退室をリアルタイムで反映
- ネットワーク状態の表示

### 2. 左側：2Dスペース

#### アバター表示

- **自分のアバター**: 選択した色のSVGアバターを表示
- **他ユーザーのアバター**: リアルタイムで他の参加者を表示
- **表示名**: 各アバターの下に表示名を表示
- **位置同期**: 全ユーザーの位置をリアルタイム同期

#### 移動操作

**マウス操作**
- クリックした位置にアバターが移動
- スムーズなアニメーション付き移動
- 境界判定（スペース外に出ない）

**キーボード操作**
- WASD キーでの移動
- 矢印キーでの移動
- 連続移動対応

#### スペース設計

- **サイズ**: 800x600px 推奨
- **背景**: シンプルなグリッド表示
- **境界**: 見えない壁で移動範囲を制限
- **レスポンシブ**: モバイルでは縦長レイアウトに変更

### 3. 右側：リアルタイムチャット

#### メッセージ表示

- **メッセージ一覧**: 時系列順でメッセージを表示
- **スクロール**: 新しいメッセージで自動スクロール
- **アバターアイコン**: 各メッセージに送信者のアバター表示
- **送信者名**: メッセージごとに送信者の表示名
- **タイムスタンプ**: 「14:30」形式で時刻表示

#### メッセージ送信

- **入力フィールド**: 下部に固定配置
- **送信ボタン**: Enterキー または 送信ボタンクリック
- **最大文字数**: 500文字制限
- **送信中状態**: 送信処理中は入力を無効化

#### メッセージフォーマット

```typescript
type ChatMessage = {
  id: string
  room_id: string
  user_type: 'google' | 'guest'
  user_id: string | null  // ゲストはnull
  display_name: string
  avatar_type: AvatarType
  content: string
  created_at: string
}
```

### 4. 下部バー

#### 設定変更

- **「設定を変更」ボタン**: 入室準備モーダルを再表示
- **現在設定表示**: 現在の表示名・アバターを小さく表示
- **リアルタイム反映**: 設定変更は即座に他ユーザーに反映

#### 退室機能

- **「退室する」ボタン**: 確認ダイアログ付き
- **退室処理**: Presenceチャンネルから離脱
- **ルート移動**: トップページ（`/`）に戻る
- **状態クリア**: 認証状態は維持、ルーム状態をクリア

## デザイン仕様

### Figmaデザイン準拠

以下のデザインを完全に再現する：
https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-162&t=h312ToASd1B6kW07-0

### レスポンシブ対応

**デスクトップ（1200px以上）**
- 左右分割レイアウト
- 2Dスペース: 800x600px
- チャット: 400px幅

**タブレット（768px-1199px）**
- 左右分割維持
- 2Dスペース縮小
- チャット幅調整

**モバイル（767px以下）**
- 上下分割レイアウト
- 2Dスペース上部配置
- チャット下部配置
- タブ切り替え可能

### カラーテーマ

- **背景色**: Tailwind gray-50
- **アクセント**: Tailwind blue-600
- **テキスト**: Tailwind gray-900
- **ボーダー**: Tailwind gray-200

## 技術実装

### 必要なコンポーネント

#### 1. メインルーム画面

```typescript
// src/app/room/[room_id]/page.tsx
export default function RoomPage({ params }: { params: { room_id: string } }) {
  // ルーム接続管理
  // 認証状態確認
  // レイアウト構成
}
```

#### 2. 2Dスペースコンポーネント

```typescript
// src/features/room/ui/avatar-space.tsx
export function AvatarSpace() {
  // アバター描画
  // 移動処理
  // マウス・キーボードイベント
  // リアルタイム位置同期
}
```

#### 3. チャットコンポーネント

```typescript
// src/features/chat/ui/chat-panel.tsx
export function ChatPanel() {
  // メッセージ一覧
  // メッセージ送信
  // リアルタイム受信
}
```

#### 4. ルーム状態表示

```typescript
// src/features/room/ui/room-header.tsx
export function RoomHeader() {
  // ルーム名表示
  // 接続人数表示
  // 接続状態表示
}
```

### 状態管理設計

#### ルーム状態

```typescript
type RoomState = {
  roomId: string
  roomName: string
  participants: Participant[]
  currentUser: {
    clientId: string
    position: { x: number, y: number }
    displayName: string
    avatarType: AvatarType
  }
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  error: string | null
}
```

#### チャット状態

```typescript
type ChatState = {
  messages: ChatMessage[]
  isLoading: boolean
  isSending: boolean
  draft: string
  error: string | null
}
```

### リアルタイム通信

#### Presence チャンネル

```typescript
// アバター位置同期
const presenceChannel = supabase
  .channel(`room:${roomId}`)
  .on('presence', { event: 'sync' }, () => {
    // 参加者情報更新
  })
  .on('presence', { event: 'join' }, () => {
    // 新規参加者
  })
  .on('presence', { event: 'leave' }, () => {
    // 参加者退室
  })
```

#### メッセージチャンネル

```typescript
// チャットメッセージ同期
const messageChannel = supabase
  .channel(`messages:${roomId}`)
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      // 新規メッセージ受信
    }
  )
```

### アニメーション・UX

#### アバター移動アニメーション

- **CSS Transitions**: `transform` プロパティでスムーズ移動
- **イージング**: `ease-out` で自然な動き
- **移動時間**: 300ms 程度
- **衝突判定**: 他ユーザーとの重複回避

#### UI反応性

- **送信ボタン**: クリック時の視覚フィードバック
- **メッセージ**: 送信中・送信完了の状態表示
- **接続状態**: リアルタイムでの状態変化表示
- **エラー表示**: 適切なタイミングでのエラー通知

## エラーハンドリング

### 接続エラー

- **初回接続失敗**: 「ルームに接続できません」+ 再試行ボタン
- **途中切断**: 「接続が切断されました」+ 自動再接続試行
- **認証エラー**: トップページへリダイレクト

### 操作エラー

- **メッセージ送信失敗**: 「送信に失敗しました」+ 再送オプション
- **位置更新失敗**: 自動的に再同期
- **設定変更失敗**: 「設定の保存に失敗しました」

### ネットワーク復旧

- **自動再接続**: 3回まで自動試行
- **手動再接続**: 「再接続」ボタン提供
- **状態復元**: 再接続時の位置・設定復元

## パフォーマンス最適化

### メッセージ管理

- **仮想スクロール**: 大量メッセージ時の軽量化
- **ページネーション**: 過去メッセージの段階的読み込み
- **メモリ管理**: 古いメッセージの自動削除

### リアルタイム更新

- **デバウンス**: 位置更新の送信頻度制限
- **バッチ処理**: 複数の状態変更をまとめて送信
- **差分更新**: 変更分のみの送信

## 実装順序

1. **基本レイアウト作成**: 3分割レイアウトの構築
2. **ルーム接続機能**: Presence チャンネルでの接続管理
3. **アバター表示**: 静的なアバター描画
4. **移動機能実装**: マウス・キーボードでの移動
5. **リアルタイム同期**: 位置情報のリアルタイム共有
6. **チャット基本機能**: メッセージ送受信
7. **チャットリアルタイム**: メッセージのリアルタイム表示
8. **設定変更機能**: モーダル再表示での設定変更
9. **エラーハンドリング**: 各種エラー状態の処理
10. **パフォーマンス調整**: 最適化・UX改善

## 関連ファイル

- `src/app/room/[room_id]/page.tsx` - メインルーム画面
- `src/features/room/ui/avatar-space.tsx` - 2Dスペース
- `src/features/chat/ui/chat-panel.tsx` - チャット機能
- `src/features/room/ui/room-header.tsx` - 上部バー
- `src/features/room/application/hooks/use-room.ts` - ルーム状態管理
- `src/features/chat/application/hooks/use-chat.ts` - チャット状態管理