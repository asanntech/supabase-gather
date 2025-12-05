# Supabase Gather - 要件定義書

## 1. 認証まわり（Google + ゲスト）

### ✅ 方針

**Googleログイン**

- Supabase Auth の Google Provider を使用
- ログインしたユーザーは `auth.users` + `profiles` で管理

**ゲストログイン（ローカル専用）**

- Supabase Auth は使わない
- フロント側でランダムIDを発行（例：UUID文字列）
- 名前・アバターは**毎回入力/選択**
- DBには「ゲストユーザーとしての恒久的なレコードは作らない」
  - メッセージには `display_name` と `avatar_type` を直接保存する

### ⚠️ 注意点（設計コメント）

- ゲストは Supabase Auth を使わないので、**RLS（行レベルセキュリティ）で「ユーザーごとに制限」は基本できません**
- 今回のMVPでは「1つの公開ルームで、全投稿が誰でも読める」という設計なので、**全ユーザー（Anonも含む）読み書きOKのRLS** にすれば問題なし
- 将来「ユーザーごとに履歴分けたい」「DMをやりたい」などが出てきたら、ゲストも Supabase Auth の匿名ログイン（A案）に移行するのが良さそうです

---

## 2. ルーム仕様（1ルームのみ、将来拡張可）

- 現時点：**ルームは1つだけ**（例：`"main-room"`）
- 同時接続数：**最大5人**
  - Supabase Realtime Presence で「現在接続中のクライアント数」をカウント
  - 6人目が入ろうとしたらフロント側で「満員です（5/5）」と表示して入室させない
- 将来：
  - `rooms` テーブルをすでに用意しておき、現在は **固定の1レコードのみ利用**
  - 後から「ルーム作成画面」「ルーム一覧画面」を追加できるようにしておく

---

## 3. アバター仕様（ドット絵 + 帽子の色）

- ドット絵キャラ（例：32x32）をいくつか用意
- **アバターの色**で種類を分ける
  - 例: `blue`, `purple`, `cyan`, `indigo`, `green`
- アプリ内部では `avatar_type` を文字列で管理：
  - 例: `"blue"`, `"purple"`, … のようにする
- この `avatar_type` 情報を
  - Googleユーザーの場合：`profiles.avatar_type` に保存
  - ゲストユーザーの場合：各メッセージや presence に直接載せる

---

## 4. ログイン → 入室までのフロー

### 画面構成（ルーム一覧は省略）

**1. トップページ**

- アプリ名「Supabase Gather」
- 説明文（1〜2行）
- ボタン：
  - 「Googleでログインして入室する」
  - 「ゲストとして入室する」

**2. 入室準備モーダル（毎回表示）**

- 入室前に必ず表示される
- 項目：
  - 「表示名」入力欄
    - Googleログインユーザーの場合：`profiles.name` を初期値として表示・編集可能
    - ゲストの場合：空 or ランダム名（例：`"ゲスト1234"`）を初期値にして変更OK
  - 「アバター選択」
    - 帽子色違いのドット絵を並べて選択できるUI
- 「入室」ボタン押下で、ルーム画面へ遷移

**3. ルーム画面（メイン）**

- 左：2Dスペース + アバター表示
- 右：テキストチャット
- 上部：ルーム名、接続人数（例：`3 / 5`）
- 下部：現在の表示名と、アバター変更ボタン（モーダル再表示でも可）

---

## 5. テーブル設計（修正版）

### 5-1. profiles（Googleログインユーザーのみ）

```sql
profiles
- id           uuid (PK)  -- auth.users.id と一致
- name         text       -- ユーザーが任意設定（Google名は使わない）
- avatar_type  text       -- "hat-red" など
- created_at   timestamp
```

- 初回Googleログイン時：
  - `profiles` レコードがなければ作成
  - name は「初回は Google の表示名を初期値にして、ユーザーに編集させる」
- 2回目以降：
  - `profiles.name` / `profiles.avatar_type` を初期値として入室準備モーダルに表示

---

### 5-2. rooms（将来のマルチルーム用）

```sql
rooms
- id          uuid (PK)
- name        text
- description text
- created_at  timestamp
```

- MVPでは、最初から 1 レコードだけ投入（例：`main-room`）
- アプリ側はこの `main-room` の id を固定で使う
- 将来、ユーザーがルーム作成できるようになったら
  - このテーブルにレコードを追加
  - ルーム一覧画面を実装して切り替え

---

### 5-3. messages（チャット）

```sql
messages
- id            uuid (PK)
- room_id       uuid       -- FK -> rooms.id
- user_type     text       -- 'google' | 'guest'
- user_id       uuid NULL  -- Googleユーザーなら profiles.id, ゲストなら NULL
- display_name  text       -- 投稿時の表示名（ゲスト・Google共通）
- avatar_type   text       -- 投稿時のアバター（'hat-red' など）
- content       text
- created_at    timestamp
```

**設計意図**

- ゲストは `user_id = NULL` で保存
- 将来ゲスト機能を削除しても、メッセージは `display_name` ベースでそのまま残る
- Googleユーザーは `user_id` が入るので、プロフィール変更による過去メッセージの紐付けも一応可能

---

### 5-4. avatar_positions（アバター位置）

```sql
avatar_positions
- room_id    uuid
- client_id  text        -- Google/ゲスト問わず、フロントが持つ一意ID
- x          integer
- y          integer
- avatar_type text       -- 見た目が変わったときの同期用
- updated_at timestamp
PRIMARY KEY (room_id, client_id)
```

- `client_id` は
  - Googleユーザー：`auth.user().id` を使うか、
  - Google/ゲスト共通の「セッション単位ID」をフロント側で持つ形でもOK
- プレゼンス自体は Supabase Realtime Presence を使う予定なので、
  - このテーブルは「現座標の永続化 & Realtime 伝播用」と考えてください

---

## 6. 同時接続数制限（5人まで）

- **Presence チャンネル**（例：`room:{room_id}`）で管理
- クライアント流れ：
  1. ルーム入室前に Presence チャンネルに接続
  2. 現在の `presenceState` から人数をカウント
  3. 5人未満なら「入室OK」、5人以上なら「満員」アラート & ボタン無効化
- 将来的に厳密にしたくなったら:
  - ルームに入室するイベントをDB（例: `room_members`）に記録し、
  - `COUNT(*)` ベースで制御するという発展も可能ですが、MVPとしては Presence ベースで十分です

---

## 7. 仕様的な違和感・リスクのまとめ

**✅ ゲストログイン（ローカルのみ）にしたこと**

- 仕様的にはOK。RLSでユーザー単位制御はしづらいが、今回のMVP前提なら問題なし
- 「いつでも機能ごと削除できる」＋「DB構造には大きく影響しない」形になっています

**✅ ルーム1つだけだが、将来マルチルームに拡張可能か**

- `rooms` テーブルを用意し、`messages.room_id` / `avatar_positions.room_id` で参照しているので、画面側で「ルーム選択UI」を足すだけで、自然にマルチルーム化できます

**✅ 名前・アバターを毎回選べるか**

- 「入室準備モーダル」を毎回出す設計で対応可能
- Googleユーザーは `profiles` から初期値を入れて、編集して保存する流れにしておくとUX良さそうです
