# 06. ユーザーフロー（ログインから入室まで）

## 概要

ユーザーがアプリにアクセスしてからルームに入室するまでのUI・UXフローを定義する。
本ドキュメントは**タスク単位で分割**されており、各タスクを順番に実装することで段階的に機能を構築できる。

---

## タスク一覧

| タスク | 画面/機能                         | 優先度 | 依存関係 |
| ------ | --------------------------------- | ------ | -------- |
| Task 1 | トップページ（認証画面）          | 高     | なし     |
| Task 2 | 入室準備モーダル                  | 高     | Task 1   |
| Task 3 | ルーム画面 - レイアウト骨格       | 高     | Task 2   |
| Task 4 | ルーム画面 - 2Dスペース           | 中     | Task 3   |
| Task 5 | ルーム画面 - リアルタイムチャット | 中     | Task 3   |
| Task 6 | エラーハンドリング・満員処理      | 中     | Task 3-5 |

---

## Task 1: トップページ（認証画面）

### ルート

`/`

### 機能要件

- アプリ名「Supabase Gather」の表示
- 説明文（1〜2行）
- 認証オプション：
  - 「Googleでログインして入室する」ボタン
  - 「ゲストとして入室する」ボタン
- 認証完了後、入室準備モーダルを表示

### 実装内容

- `src/app/page.tsx` - トップページコンポーネント
- `src/features/auth/ui/login-form.tsx` - ログインフォーム（既存を活用）
- Google OAuth認証フロー
- ゲスト認証（匿名認証）フロー

### Figmaデザイン

https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-2&t=h312ToASd1B6kW07-0

### 完了条件

- [ ] Googleログインボタンが動作する
- [ ] ゲストログインボタンが動作する
- [ ] 認証成功後、入室準備モーダルが表示される
- [ ] `pnpm type-check` パス
- [ ] `pnpm lint` パス

---

## Task 2: 入室準備モーダル

### 表示タイミング

認証後に必須表示（毎回）

### 機能要件

- **表示名設定**:
  - Googleユーザー: `profiles.name` を初期値として編集可能
  - ゲストユーザー: 空または `"ゲスト1234"` のような初期値
- **アバター選択**: 5色のドット絵アバターから選択
- **アクション**:
  - 入室ボタン: `/room/:room_id` へ遷移
  - キャンセル: トップページ（`/`）に戻る

### 実装内容

- `src/features/rooms/ui/room-entry-modal.tsx` - 入室準備モーダル
- `src/features/auth/ui/avatar-selector.tsx` - アバター選択（既存を活用）
- 表示名入力フィールド
- 入室/キャンセルボタン

### 依存関係

- Task 1（認証機能）が完了していること
- `src/features/auth/` の認証状態を参照

### Figmaデザイン

https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-59&t=h312ToASd1B6kW07-0

### 完了条件

- [ ] モーダルが正しく表示される
- [ ] 表示名の入力・編集ができる
- [ ] アバター選択ができる
- [ ] 入室ボタンで `/room/:room_id` に遷移する
- [ ] キャンセルボタンでトップページに戻る
- [ ] Storybook でコンポーネント単体確認可能
- [ ] `pnpm type-check` パス
- [ ] `pnpm lint` パス

---

## Task 3: ルーム画面 - レイアウト骨格

### ルート

`/room/:room_id`

### 機能要件

- **上部バー**: ルーム名、接続人数表示（例：「3 / 5」）
- **左側エリア**: 2Dスペースのプレースホルダー
- **右側エリア**: チャットのプレースホルダー
- **下部**: 設定変更・退室ボタン

### 実装内容

- `src/app/room/[room_id]/page.tsx` - ルームページ
- `src/features/rooms/ui/room-layout.tsx` - レイアウトコンポーネント
- `src/features/rooms/ui/room-header.tsx` - 上部バー
- `src/features/rooms/ui/room-footer.tsx` - 下部バー

### 依存関係

- Task 2（入室準備モーダル）が完了していること
- ルーム参加時のユーザー情報（表示名、アバター）を受け取る

### Figmaデザイン

https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-162&t=h312ToASd1B6kW07-0

### 完了条件

- [ ] ルーム画面のレイアウトが正しく表示される
- [ ] 上部バーにルーム名と接続人数が表示される
- [ ] 左右分割レイアウトが機能する
- [ ] 設定変更ボタンで入室準備モーダルが再表示される
- [ ] 退室ボタンでトップページに戻る
- [ ] `pnpm type-check` パス
- [ ] `pnpm lint` パス

---

## Task 4: ルーム画面 - 2Dスペース

### 機能要件

- アバター移動可能エリア
- クリック・キーボード（WASD/矢印）で移動
- 他ユーザーのアバターをリアルタイム表示

### 実装内容

- `src/features/rooms/ui/space-canvas.tsx` - 2Dスペースキャンバス
- `src/features/rooms/ui/avatar-sprite.tsx` - アバタースプライト
- `src/features/rooms/application/hooks/use-avatar-movement.ts` - 移動ロジック
- `src/features/rooms/application/hooks/use-presence-sync.ts` - Presence同期

### サブタスク

1. **アバター表示**: 自分のアバターをキャンバス上に表示
2. **移動ロジック**: キーボード/クリックによる移動処理
3. **Presence同期**: Supabase Realtimeで他ユーザーの位置を同期

### 依存関係

- Task 3（レイアウト骨格）が完了していること
- Supabase Presence機能の設定

### 完了条件

- [ ] アバターが2Dスペース上に表示される
- [ ] キーボード（WASD/矢印）で移動できる
- [ ] クリックで移動できる
- [ ] 他ユーザーのアバターがリアルタイムで表示される
- [ ] 他ユーザーの移動がリアルタイムで反映される
- [ ] `pnpm type-check` パス
- [ ] `pnpm lint` パス

---

## Task 5: ルーム画面 - リアルタイムチャット

### 機能要件

- メッセージ一覧（スクロール可能）
- メッセージ入力フィールド
- 送信ボタン
- リアルタイムでメッセージ同期

### 実装内容

- `src/features/chat/ui/chat-panel.tsx` - チャットパネル
- `src/features/chat/ui/message-list.tsx` - メッセージ一覧
- `src/features/chat/ui/message-input.tsx` - 入力フィールド
- `src/features/chat/application/hooks/use-chat-messages.ts` - メッセージ取得/送信
- `src/features/chat/domain/types/index.ts` - メッセージ型定義

### サブタスク

1. **メッセージ一覧**: 過去メッセージの表示・スクロール
2. **メッセージ送信**: 入力・送信処理
3. **リアルタイム同期**: Supabase Realtimeでメッセージを同期

### 依存関係

- Task 3（レイアウト骨格）が完了していること
- Supabase Realtime機能の設定

### 完了条件

- [ ] メッセージ一覧が表示される
- [ ] メッセージを入力・送信できる
- [ ] 送信したメッセージがリアルタイムで表示される
- [ ] 他ユーザーのメッセージがリアルタイムで表示される
- [ ] スクロールが正しく機能する
- [ ] `pnpm type-check` パス
- [ ] `pnpm lint` パス

---

## Task 6: エラーハンドリング・満員処理

### 機能要件

#### 満員時の処理

- 入室準備モーダルで「入室」ボタンを無効化
- 「ルームが満員です（5/5）」メッセージ表示
- 自動的に人数チェックを継続し、空きが出たら有効化

#### 接続エラー時の処理

- 再接続を自動試行
- 長時間接続できない場合はトップページに戻す
- エラーメッセージを適切に表示

### 実装内容

- `src/features/rooms/ui/room-full-message.tsx` - 満員メッセージ
- `src/features/rooms/application/hooks/use-room-capacity.ts` - 人数監視
- `src/shared/ui/error-boundary/` - エラーバウンダリ
- 再接続ロジックの実装

### 依存関係

- Task 3-5 が完了していること

### 完了条件

- [ ] 満員時に入室ボタンが無効化される
- [ ] 満員メッセージが表示される
- [ ] 空きが出たら自動で入室可能になる
- [ ] 接続エラー時に再接続を試行する
- [ ] 長時間接続できない場合にトップページに戻る
- [ ] エラーメッセージが適切に表示される
- [ ] `pnpm type-check` パス
- [ ] `pnpm lint` パス

---

## ユーザーフロー詳細

### Google認証フロー

```
1. 「Googleでログイン」ボタンクリック
2. Google OAuth画面表示
3. 認証成功後、入室準備モーダル表示
4. 設定完了後、ルーム画面表示
```

### ゲスト認証フロー

```
1. 「ゲストとして入室」ボタンクリック
2. 即座に入室準備モーダル表示
3. 設定完了後、ルーム画面表示
```

### 設定変更フロー

```
1. ルーム画面の「設定を変更」ボタンクリック
2. 入室準備モーダル再表示（現在設定が初期値）
3. 変更完了後、ルーム画面に戻る
```

---

## 実装時の注意事項

### 各タスク共通

- 実装完了後は必ず `pnpm type-check && pnpm lint:fix && pnpm format` を実行
- UIコンポーネントは可能な限りStorybookで単体確認できるようにする
- 既存の `src/shared/ui/` コンポーネントを積極的に活用する

### Task 4-5（リアルタイム機能）

- Supabase Realtimeの接続管理に注意（cleanup処理を忘れない）
- 楽観的更新（Optimistic Update）を検討する
- デバウンス/スロットリングでパフォーマンスを最適化する
