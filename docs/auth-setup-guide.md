# 認証システム セットアップガイド

## 1. データベースセットアップ

### SQL実行
Supabase Dashboard の SQL Editor で以下のファイルを実行：

```bash
docs/database-setup.sql
```

### 設定内容
- `profiles` テーブル作成
- RLS（Row Level Security）設定
- Google認証時の自動プロフィール作成
- インデックス設定

## 2. Google OAuth設定

### Supabase Dashboard設定

1. **Authentication → Settings → Auth Providers**
2. **Google** を有効化
3. **Client ID** と **Client Secret** を設定

### Google Cloud Console設定

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. **APIs & Services → Credentials**
3. **OAuth 2.0 Client IDs** を作成
4. **Authorized redirect URIs** に追加：
   ```
   https://hvfedtxnxvubdytkpunb.supabase.co/auth/v1/callback
   ```

## 3. 認証システムテスト

### ゲストログイン
- 即座に利用可能
- ローカルストレージに保存
- データベースに永続化されない

### Googleログイン
- Google OAuth設定完了後に利用可能
- `profiles`テーブルにプロフィール自動作成
- セッション永続化

## 4. 開発環境での確認

### フロントエンド起動
```bash
npm run dev
```

### ログイン機能テスト
1. `http://localhost:3000` でアプリ起動
2. ゲストログイン機能確認
3. Google OAuth設定後、Googleログイン確認

## 5. セキュリティ設定

### RLS（Row Level Security）
- ユーザーは自分のプロフィールのみ編集可能
- 全プロフィール読み取りは全ユーザーに許可（ゲスト対応）

### データ管理
- **Googleユーザー**: `profiles`テーブルで永続化
- **ゲストユーザー**: ローカルストレージのみ

## トラブルシューティング

### Google認証エラー
1. Client ID/Secretが正しく設定されているか確認
2. Redirect URIがSupabaseプロジェクトURLと一致するか確認
3. Google Cloud Console でOAuth同意画面が設定されているか確認

### データベースエラー
1. `profiles`テーブルが正しく作成されているか確認
2. RLSポリシーが適切に設定されているか確認
3. トリガー関数が動作しているか確認