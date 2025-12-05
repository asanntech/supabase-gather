# 04. アバターシステム（ドット絵 + 色）

## 概要

ユーザーの視覚的アイデンティティとして、色分けされたドット絵アバターシステムを提供する。

## アバター仕様

### ビジュアル

- **形式**：ドット絵キャラクター
- **サイズ**：32x32ピクセル推奨
- **バリエーション**：アバターの色で種類を分ける

### カラーバリエーション

利用可能な色：

- `blue` - 青
- `purple` - 紫
- `cyan` - シアン
- `indigo` - インディゴ
- `green` - 緑

## データ管理

### 内部表現

- アプリ内部では`avatar_type`を文字列で管理
- 例：`"blue"`, `"purple"`, `"cyan"`, `"indigo"`, `"green"`

### 保存場所

**Googleユーザーの場合**

- `profiles.avatar_type`に保存
- ユーザープロフィールとして永続化

**ゲストユーザーの場合**

- 各メッセージに`avatar_type`を直接保存
- Presenceデータにも含めて同期

## UI/UX設計

### アバター選択UI

- 5つの色違いドット絵を横並びで表示
- クリックで選択・プレビュー表示
- 現在の選択状態を明確に表示

### 表示箇所

1. **入室準備モーダル**：初期選択・変更
   - ルート：`/`（認証後にモーダル表示）
   - Figmaデザイン：https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-59&t=h312ToASd1B6kW07-0
2. **ルーム画面**：2Dスペース上でのアバター表示
   - ルート：`/room/:room_id`
   - リアルタイムアバター移動・表示
3. **チャット**：メッセージと紐づけて表示
   - ルーム画面内チャットエリア
4. **設定画面**：いつでも変更可能（将来）
   - 将来ルート：`/settings`

## 技術実装

### アセット管理

- 各色のドット絵ファイルを`public/avatars/`に配置
- ファイル命名：`{color}.svg`（例：`blue.svg`）

### レンダリング

```typescript
// avatar_typeに基づく画像パス生成
const getAvatarImagePath = (avatarType: string) => `/avatars/${avatarType}.svg`
```

### リアルタイム同期

- アバター変更時はPresenceを更新
- 他ユーザーにリアルタイムで反映
- `avatar_positions`テーブルにも記録
