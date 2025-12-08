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
- UIカタログ:
  - **Storybook** (Vite版)
- バックエンド:
  - Supabase（サーバー側・API 経由で利用）

### TanStack Query 実装例

```ts
// features/user/use-cases/hooks/useCreateUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateUserUseCase } from '../logic/CreateUserUseCase'
import { userSupabaseClient } from '../../../infrastructure/supabase/UserSupabaseClient'
import { type CreateUserInput } from '../../domain/User'

export const useCreateUser = () => {
  const queryClient = useQueryClient()
  const createUserUseCase = new CreateUserUseCase(userSupabaseClient)

  return useMutation({
    mutationFn: (input: CreateUserInput) => createUserUseCase.execute(input),
    onSuccess: user => {
      // キャッシュ更新
      queryClient.setQueryData(['user', user.id], user)
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: error => {
      console.error('Failed to create user:', error)
    },
  })
}
```

```ts
// features/user/use-cases/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query'
import { GetUserUseCase } from '../logic/GetUserUseCase'
import { userSupabaseClient } from '../../../infrastructure/supabase/UserSupabaseClient'

export const useUser = (id: string | null) => {
  const getUserUseCase = new GetUserUseCase(userSupabaseClient)

  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserUseCase.execute(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5分
  })
}
```

### Supabase 実装例

```ts
// infrastructure/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

```ts
// infrastructure/supabase/UserSupabaseClient.ts
import { supabase } from './client'
import { type User } from '../../features/user/domain/User'
import { type UserRepository } from '../../features/user/domain/UserRepository'

export class UserSupabaseClient implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return this.toDomain(data)
  }

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        name: user.name,
        email: user.email,
        avatar_type: user.avatarType,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create user: ${error.message}`)
    return this.toDomain(data)
  }

  // DTO → Domain 変換
  private toDomain(dto: any): User {
    return {
      id: dto.id,
      name: dto.name,
      email: dto.email,
      avatarType: dto.avatar_type,
      createdAt: new Date(dto.created_at),
    }
  }
}

// シングルトンエクスポート
export const userSupabaseClient = new UserSupabaseClient()
```

---

## 4. ローカル開発環境

### Supabase ローカル環境

このプロジェクトでは、開発時は**ローカルのSupabase環境を使用**します。以下の手順で環境を構築してください：

1. **Supabase CLIのインストール**

   ```bash
   pnpm add supabase --save-dev --allow-build=supabase
   ```

2. **ローカルSupabaseの初期化**

   ```bash
   npx supabase init
   ```

3. **ローカルSupabaseの起動**

   ```bash
   npx supabase start
   ```

4. **データベースマイグレーション**
   - テーブル作成やスキーマ変更は `supabase/migrations/` ディレクトリにマイグレーションファイルを作成
   - マイグレーションの実行:
     ```bash
     npx supabase migration up
     ```

5. **環境変数の設定**
   - `.env.local` に以下を設定:

     ```
     # クライアントサイド用（ブラウザから利用）
     NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
     NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase start実行時に表示されるanon key>

     # サーバーサイド用（Route Handlers, Server Actions, Server Components）
     SUPABASE_SERVICE_ROLE_KEY=<supabase start実行時に表示されるservice_role key>
     ```

### 開発ルール

- **テーブル作成・スキーマ変更は必ずマイグレーションファイルで管理**
- Supabase Studio (http://localhost:54323) でのGUI操作による変更は避ける
- 本番環境へのデプロイ時はマイグレーションファイルを使用

---

## 5. アーキテクチャ方針

このプロジェクトは、**DDD（軽量版）＋ FDD（Feature-Driven）＋ クリーンアーキテクチャ（簡易版）** を採用します。  
詳細な思想・レイヤー分離は `next-ddd-clean-frontend` の定義に従います。
