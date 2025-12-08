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

### 基本型定義

```typescript
// src/features/auth/domain/User.ts
export interface User {
  id: string
  name: string
  avatarType: string
  userType: 'google' | 'guest'
  createdAt?: Date
  updatedAt?: Date
}

// src/features/auth/domain/Profile.ts
export interface Profile {
  id: string
  name: string
  avatarType: string
  createdAt: Date
  updatedAt: Date
}

// src/features/auth/domain/GuestUser.ts
export interface GuestUser {
  id: string
  name: string
  avatarType: string
  sessionId: string
}
```

### Repository interfaces

```typescript
// src/features/auth/domain/ProfileRepository.ts
export interface ProfileRepository {
  create(
    profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Profile>
  findById(id: string): Promise<Profile | null>
  update(id: string, data: Partial<Profile>): Promise<Profile>
}

// src/features/auth/domain/AuthRepository.ts
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
