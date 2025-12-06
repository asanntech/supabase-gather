# CLAUDE.md

このファイルは、Claude / Claude Code（claude.ai/code）がこのリポジトリで作業する際のガイドラインです。

---

## 1. このリポジトリの役割

- Next.js（App Router）＋ TypeScript を用いた Web フロントエンド
- バックエンドは Supabase（認証・DB・リアルタイム）を想定
- 主なドメインは「バーチャルオフィス（Gather風アプリ）」系機能

---

## 2. 使用するエージェント

フロントエンドの設計・実装・リファクタリング・テストを行うときは、**必ず次のサブエージェントを利用**してください。

- `.claude/agents/next-ddd-clean-frontend.md`
  - 役割: Next.js App Router ＋ TypeScript ＋ DDD/Clean/FDD 構成のフロントエンド設計・実装・リファクタリング
  - この CLAUDE.md の内容は、`next-ddd-clean-frontend` の「プロジェクト側の設定」として上書きされます。

- `.claude/agents/vitest-testing-strategy.md`
  - 役割: Vitestを使用したテスト戦略の策定・テストコードの実装
  - DDD/クリーンアーキテクチャに適したテスト設計を提供

- `.claude/agents/storybook-ui-catalog.md`
  - 役割: StorybookによるUIコンポーネントカタログの構築
  - 基本的なUIカタログとアクセシビリティチェックに集中

Claude / Claude Code は、**フロントエンド関連の作業をする際に、以下を順番に確認してください：**

1. リポジトリ直下の `CLAUDE.md`（このファイル）
2. 既存のコード
   - `src/app/`
   - `src/features/`
   - `src/infrastructure/`
   - `src/shared/`
3. 必要に応じて README やドキュメント

---

## 3. 技術スタック（確定）

このプロジェクトで使用する技術スタックは次のとおりです。

- フレームワーク: **Next.js App Router**
- 言語: **TypeScript**
- パッケージマネージャー: **pnpm**
- UI / CSS:
  - **shadcn/ui**
  - Tailwind CSS
- データフェッチ / 状態管理:
  - **TanStack Query（@tanstack/react-query）**
- テストフレームワーク:
  - **Vitest**
  - @testing-library/react
  - @testing-library/jest-dom
- バックエンド:
  - Supabase（サーバー側・API 経由で利用）

---

## 4. アーキテクチャ方針

このプロジェクトは、**DDD（軽量版）＋ FDD（Feature-Driven）＋ クリーンアーキテクチャ（簡易版）** を採用します。  
詳細な思想・レイヤー分離は `next-ddd-clean-frontend` の定義に従います。
