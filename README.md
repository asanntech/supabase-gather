# Supabase Gather

Next.js と Supabase で構築されたバーチャルオフィスアプリケーション

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **データ取得**: TanStack Query
- **バックエンド**: Supabase (認証・DB・リアルタイム)

## アーキテクチャ

DDD + FDD + クリーンアーキテクチャによる機能駆動型ディレクトリ構成:

```
src/
  app/          # Next.js ルート
  features/     # ビジネス機能
    <feature>/
      domain/     # 型・ビジネスルール
      application/ # ユースケース・フック
      ui/         # コンポーネント・ページ
  infrastructure/ # API クライアント
  shared/       # 共通ユーティリティ
```

## 開発

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build
```

## 開始方法

1. リポジトリをクローン
2. `.env.example` を `.env.local` にコピーし、Supabase の認証情報を設定
3. `pnpm install` を実行
4. `pnpm dev` で開発開始
