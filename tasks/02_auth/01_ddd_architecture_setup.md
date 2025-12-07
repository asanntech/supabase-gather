# [02_auth] 01_DDD/Clean Architecture基盤構築

## 概要

認証システム実装のためのDDD（Domain Driven Design）/Clean Architecture構造を構築する。

## 前提条件

- データベーススキーマが作成済み（profilesテーブル等）

## 実装対象

### 1. プロジェクト構造の構築

DDD/Clean Architectureに基づくディレクトリ構造の作成

### 2. 認証ドメインの基盤

認証に関するドメインモデル・ユースケース・インフラの土台

## 詳細仕様

### ディレクトリ構造

```
src/
├── app/                 # Next.js App Router のルート・レイアウト
├── features/            # Feature-Driven Design
│   └── auth/           # 認証フィーチャー
│       ├── domain/     # ドメイン層
│       │   ├── entities/
│       │   ├── repositories/
│       │   └── services/
│       ├── application/    # アプリケーション層
│       │   ├── use-cases/
│       │   └── hooks/      # Query/Mutation hooks
│       └── ui/             # プレゼンテーション層
│           ├── login-form/
│           │   ├── login-form.tsx
│           │   ├── login-form.stories.tsx
│           │   └── index.ts
│           └── user-avatar/
│               ├── user-avatar.tsx
│               ├── user-avatar.stories.tsx
│               └── index.ts
├── infrastructure/      # 全体インフラ
│   ├── api/            # 汎用API クライアント
│   ├── supabase/       # Supabase Repository実装
│   └── config/         # 設定
└── shared/             # 共通機能
    ├── ui/             # 共通UIコンポーネント（コンポーネント単位でフォルダ分割）
    │   ├── button/
    │   │   ├── button.tsx
    │   │   ├── button.stories.tsx
    │   │   └── index.ts
    │   └── card/
    │       ├── card.tsx
    │       ├── card.stories.tsx
    │       └── index.ts
    ├── lib/            # 汎用ユーティリティ
    │   ├── utils/
    │   └── constants/
    └── config/         # 共通設定
```

### 基本型定義

```typescript
// src/features/auth/domain/entities/User.ts
export interface User {
  id: string
  name: string
  avatarType: string
  userType: 'google' | 'guest'
  createdAt?: Date
  updatedAt?: Date
}

// src/features/auth/domain/entities/Profile.ts
export interface Profile {
  id: string
  name: string
  avatarType: string
  createdAt: Date
  updatedAt: Date
}

// src/features/auth/domain/entities/GuestUser.ts
export interface GuestUser {
  id: string
  name: string
  avatarType: string
  sessionId: string
}
```

### Repository interfaces

```typescript
// src/features/auth/domain/repositories/ProfileRepository.ts
export interface ProfileRepository {
  create(
    profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Profile>
  findById(id: string): Promise<Profile | null>
  update(id: string, data: Partial<Profile>): Promise<Profile>
}

// src/features/auth/domain/repositories/AuthRepository.ts
export interface AuthRepository {
  signInWithGoogle(): Promise<User>
  signOut(): Promise<void>
  getCurrentUser(): Promise<User | null>
  onAuthStateChange(callback: (user: User | null) => void): () => void
}
```

## 成果物

- DDD/Clean Architecture ディレクトリ構造（next-ddd-clean-frontend.md準拠）
- 基本エンティティ定義
- Repository インターフェース
- TypeScript設定の最適化

## 検証方法

- ディレクトリ構造の確認
- TypeScript コンパイルエラーなし
- import/export の動作確認
- コンポーネント単位のディレクトリ構造（ui配下）の確認

## 次のタスクへの準備

- Google認証実装の土台完了
- 型安全性確保による実装効率向上
