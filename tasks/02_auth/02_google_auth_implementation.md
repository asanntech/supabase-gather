# タスク: Google認証システム実装

## 概要
Supabase AuthのGoogle Providerを利用したOAuth2.0認証システムを実装する。

## 前提条件
- DDD/Clean Architecture基盤が構築済み
- データベースのprofilesテーブルが作成済み

## 実装対象
### 1. Supabase Auth設定
Google OAuth2.0プロバイダーの設定

### 2.認証ユースケース実装
Google認証のビジネスロジック

### 3. インフラ層実装
Supabase Authとの連携

## 詳細仕様

### 認証ユースケース
```typescript
// src/features/auth/application/use-cases/GoogleSignInUseCase.ts
export class GoogleSignInUseCase {
  constructor(
    private authRepository: AuthRepository,
    private profileRepository: ProfileRepository
  ) {}

  async execute(): Promise<User> {
    // 1. Google OAuth2.0認証実行
    const user = await this.authRepository.signInWithGoogle();
    
    // 2. 初回ログイン時のプロフィール作成
    const existingProfile = await this.profileRepository.findById(user.id);
    
    if (!existingProfile) {
      await this.profileRepository.create({
        name: user.name, // Googleの表示名を初期値
        avatarType: 'blue' // デフォルトアバター
      });
    }
    
    return user;
  }
}
```

### プロフィール管理ユースケース
```typescript
// src/features/auth/application/use-cases/UpdateProfileUseCase.ts
export class UpdateProfileUseCase {
  constructor(private profileRepository: ProfileRepository) {}

  async execute(userId: string, data: { name?: string; avatarType?: string }): Promise<Profile> {
    return await this.profileRepository.update(userId, data);
  }
}
```

### Supabase Auth実装
```typescript
// src/features/auth/infrastructure/supabase/SupabaseAuthRepository.ts
export class SupabaseAuthRepository implements AuthRepository {
  constructor(private supabase: SupabaseClient) {}

  async signInWithGoogle(): Promise<User> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw new Error(`Google認証エラー: ${error.message}`);
    
    // Supabase UserをドメインUserに変換
    return this.mapToUser(data.user);
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user ? this.mapToUser(user) : null;
  }

  private mapToUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
      avatarType: 'blue', // デフォルト
      userType: 'google'
    };
  }
}
```

### プロフィールRepository実装
```typescript
// src/features/auth/infrastructure/supabase/SupabaseProfileRepository.ts
export class SupabaseProfileRepository implements ProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();

    if (error) throw new Error(`プロフィール作成エラー: ${error.message}`);
    
    return data;
  }

  async findById(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`プロフィール取得エラー: ${error.message}`);
    }

    return data || null;
  }

  async update(id: string, data: Partial<Profile>): Promise<Profile> {
    const { data: updatedProfile, error } = await this.supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`プロフィール更新エラー: ${error.message}`);
    
    return updatedProfile;
  }
}
```

## 成果物
- Google認証ユースケース
- Supabase Auth Repository実装
- プロフィール管理システム
- 認証エラーハンドリング

## 検証方法
- Google OAuth2.0ログインテスト
- プロフィール自動作成確認
- 認証状態の永続化確認

## Supabase設定要件
- Google OAuth2.0 プロバイダー有効化
- リダイレクトURL設定
- 環境変数設定（GOOGLE_CLIENT_ID等）

## 次のタスクへの準備
- Google認証基盤完了によりゲスト認証実装準備完了