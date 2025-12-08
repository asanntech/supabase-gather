# [02_auth] 03\_ゲスト認証システム実装

## 概要

Supabase Authを使用しないローカル専用の一時的な認証システムを実装する。

## 前提条件

- DDD/Clean Architecture基盤が構築済み
- Google認証システムが実装済み

## 実装対象

### 1. ゲスト認証ユースケース

一時的なユーザーID生成と管理ロジック

### 2. ゲストセッション管理

メモリベースの一時的な状態管理

### 3. ゲスト用Repository実装

データベースを使用しない一時的な情報管理

## 詳細仕様

### ゲスト認証ユースケース

```typescript
// src/features/auth/application/use-cases/GuestSignInUseCase.ts
export class GuestSignInUseCase {
  constructor(private guestRepository: GuestRepository) {}

  async execute(name: string, avatarType: string): Promise<GuestUser> {
    // UUID生成によるゲストID作成
    const guestId = crypto.randomUUID()
    const sessionId = crypto.randomUUID()

    const guestUser: GuestUser = {
      id: guestId,
      name,
      avatarType,
      sessionId,
    }

    // メモリのみに保存（永続化なし）
    await this.guestRepository.createSession(guestUser)

    return guestUser
  }
}
```

### ゲストセッション管理

```typescript
// src/features/auth/application/use-cases/GuestSessionUseCase.ts
export class GuestSessionUseCase {
  constructor(private guestRepository: GuestRepository) {}

  async getCurrentGuest(): Promise<GuestUser | null> {
    return await this.guestRepository.getCurrentSession()
  }

  async updateGuestInfo(data: {
    name?: string
    avatarType?: string
  }): Promise<GuestUser> {
    const currentGuest = await this.guestRepository.getCurrentSession()
    if (!currentGuest) {
      throw new Error('ゲストセッションが存在しません')
    }

    const updatedGuest = { ...currentGuest, ...data }
    await this.guestRepository.updateSession(updatedGuest)

    return updatedGuest
  }

  async clearSession(): Promise<void> {
    await this.guestRepository.clearSession()
  }
}
```

### ゲストRepository Interface

```typescript
// src/features/auth/domain/repositories/GuestRepository.ts
export interface GuestRepository {
  createSession(guestUser: GuestUser): Promise<void>
  getCurrentSession(): Promise<GuestUser | null>
  updateSession(guestUser: GuestUser): Promise<void>
  clearSession(): Promise<void>
}
```

### ゲストRepository実装（メモリベース）

```typescript
// src/features/auth/infrastructure/memory/MemoryGuestRepository.ts
export class MemoryGuestRepository implements GuestRepository {
  private currentGuest: GuestUser | null = null

  async createSession(guestUser: GuestUser): Promise<void> {
    this.currentGuest = guestUser
  }

  async getCurrentSession(): Promise<GuestUser | null> {
    return this.currentGuest
  }

  async updateSession(guestUser: GuestUser): Promise<void> {
    if (!this.currentGuest) {
      throw new Error('ゲストセッションが存在しません')
    }
    this.currentGuest = guestUser
  }

  async clearSession(): Promise<void> {
    this.currentGuest = null
  }
}
```

### 統合認証サービス

```typescript
// src/features/auth/application/services/AuthService.ts
export class AuthService {
  constructor(
    private googleSignInUseCase: GoogleSignInUseCase,
    private guestSignInUseCase: GuestSignInUseCase,
    private guestSessionUseCase: GuestSessionUseCase,
    private authRepository: AuthRepository
  ) {}

  async signInWithGoogle(): Promise<User> {
    const user = await this.googleSignInUseCase.execute()
    return { ...user, userType: 'google' }
  }

  async signInAsGuest(name: string, avatarType: string): Promise<User> {
    const guestUser = await this.guestSignInUseCase.execute(name, avatarType)
    return {
      id: guestUser.id,
      name: guestUser.name,
      avatarType: guestUser.avatarType,
      userType: 'guest',
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // Google認証を優先チェック
    const googleUser = await this.authRepository.getCurrentUser()
    if (googleUser) {
      return { ...googleUser, userType: 'google' }
    }

    // ゲストセッションをチェック
    const guestUser = await this.guestSessionUseCase.getCurrentGuest()
    if (guestUser) {
      return {
        id: guestUser.id,
        name: guestUser.name,
        avatarType: guestUser.avatarType,
        userType: 'guest',
      }
    }

    return null
  }

  async signOut(): Promise<void> {
    // Google認証の場合
    const currentUser = await this.getCurrentUser()
    if (currentUser?.userType === 'google') {
      await this.authRepository.signOut()
    }

    // ゲストセッションクリア
    await this.guestSessionUseCase.clearSession()
  }
}
```

## 設計思想

### データ永続化なし

- DBには恒久的なレコードを作成しない
- メッセージ投稿時に `display_name` と `avatar_type` を直接保存
- セッション終了で情報は消失

### セキュリティ制約

- RLSでのユーザー単位制限は不可能
- MVP段階では全ユーザー読み書き可能設計で対応

### 将来の移行性

- Supabase Auth匿名ログインへの移行を想定
- ユーザーID体系の互換性確保

## 成果物

- ゲスト認証ユースケース
- メモリベースRepository実装
- 統合認証サービス
- セッション管理機能

## 検証方法

- ゲストログインフローテスト
- セッション継続・終了確認
- Google/ゲスト切り替えテスト

## 制限事項

- ページリフレッシュでセッション消失
- localStorage永続化なし
- ユーザー履歴管理不可

## 次のタスクへの準備

- 認証システム基盤完了により認証フロー統合準備完了
