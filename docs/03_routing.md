# 05. ルーティング仕様

## 概要

Supabase Gatherのルーティング設計とURL構造を定義する。

## 画面構成とルート

### 1. トップページ（`/`）

#### 用途
- アプリケーションのエントリーポイント
- ランディングページ・認証画面

#### 機能
- アプリケーション紹介
- 認証オプション提供（Google / ゲスト）
- 入室準備モーダル表示

#### レイアウト参考
https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-2&t=h312ToASd1B6kW07-0

### 2. ルーム画面（`/room/:room_id`）

#### 用途
- メインのバーチャルオフィス機能
- 2Dスペース・チャット機能

#### パラメーター
- `:room_id` - ルームの一意識別子
- 例: `/room/main-room`（MVP固定値）

#### 機能
- 2Dアバター移動
- リアルタイムチャット
- プレゼンス管理

#### レイアウト参考
https://www.figma.com/design/vES3VewH8Qo1MA0Au0oujK/Supabase-Gather?node-id=23-162&t=h312ToASd1B6kW07-0

## ナビゲーション フロー

### 初回アクセス

```
1. ユーザーが `/` にアクセス
2. 認証方式選択（Google / ゲスト）
3. 認証処理実行
4. 入室準備モーダル表示
5. `/room/main-room` への遷移
```

### ルーム直接アクセス

```
1. 未認証ユーザーが `/room/:room_id` にアクセス
2. 認証ガードが作動
3. `/` へリダイレクト
4. 認証完了後、元のルーム（`/room/:room_id`）へ遷移
```

### ルーム間移動（将来）

```
1. ルーム一覧画面（`/rooms`）で選択
2. 対象ルーム（`/room/:room_id`）へ遷移
3. 既存ルームから退室、新ルームへ入室
```

## MVP vs 将来対応

### 現在（MVP）

| ルート | 説明 | 状態 |
|--------|------|------|
| `/` | トップ・認証 | ✅ 実装 |
| `/room/main-room` | メインルーム | ✅ 実装 |

### 将来拡張

| ルート | 説明 | 状態 |
|--------|------|------|
| `/rooms` | ルーム一覧 | 🔄 将来実装 |
| `/rooms/create` | ルーム作成 | 🔄 将来実装 |
| `/room/:room_id` | 動的ルーム | 🔄 将来実装 |
| `/settings` | 設定画面 | 🔄 将来実装 |

## 認証とルーティング

### 認証ガード

- **保護対象**: `/room/*` 配下の全ルート
- **未認証時**: `/` へリダイレクト
- **認証後**: 元のルートへ復帰

### セッション管理

- **Googleユーザー**: Supabase Auth による永続セッション
- **ゲストユーザー**: メモリベース（一時的）
- **期限切れ**: 自動的にトップページへリダイレクト

## 技術仕様

### Next.js App Router

- App Routerを使用した file-based routing
- Server Component / Client Component の適切な使い分け

### 動的ルーティング

```typescript
// app/room/[room_id]/page.tsx
interface RoomPageProps {
  params: {
    room_id: string
  }
}
```

### プログラマティックナビゲーション

```typescript
// Next.js router
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/room/main-room')
router.replace('/')
```

## URL設計原則

1. **シンプルさ**: 直感的で覚えやすいURL構造
2. **拡張性**: 将来機能に対応可能な設計
3. **一貫性**: 命名規則の統一
4. **SEO対応**: 検索エンジンに優しい構造