# [02_auth] 04_認証コンテキスト・Hooks実装

## 概要

React Context APIとカスタムHooksを使用した認証状態管理システムを実装する。

## 前提条件

- DDD/Clean Architecture基盤が構築済み
- Google・ゲスト認証システムが実装済み

## 実装対象

### 1. 認証コンテキストプロバイダー

アプリケーション全体の認証状態管理

### 2. カスタムHooks

認証機能へのアクセスインターフェース

### 3. 認証ガード機能

保護されたルートでの認証チェック

## 詳細仕様

### 認証コンテキスト

```typescript
// src/features/auth/presentation/hooks/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (name: string, avatarType: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string; avatarType?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 依存性注入（DI）
  const authService = useMemo(() => {
    const supabase = createClient(/* Supabase設定 */);
    const authRepository = new SupabaseAuthRepository(supabase);
    const profileRepository = new SupabaseProfileRepository(supabase);
    const guestRepository = new MemoryGuestRepository();

    const googleSignInUseCase = new GoogleSignInUseCase(authRepository, profileRepository);
    const guestSignInUseCase = new GuestSignInUseCase(guestRepository);
    const guestSessionUseCase = new GuestSessionUseCase(guestRepository);

    return new AuthService(
      googleSignInUseCase,
      guestSignInUseCase,
      guestSessionUseCase,
      authRepository
    );
  }, []);

  // 認証状態監視
  useEffect(() => {
    let mounted = true;

    const checkAuthState = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        console.error('認証状態確認エラー:', error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    checkAuthState();

    // Supabase Auth状態変更監視
    const authRepository = new SupabaseAuthRepository(createClient());
    const unsubscribe = authRepository.onAuthStateChange(() => {
      checkAuthState();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [authService]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const user = await authService.signInWithGoogle();
      setUser(user);
    } catch (error) {
      console.error('Google認証エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAsGuest = async (name: string, avatarType: string) => {
    try {
      setLoading(true);
      const user = await authService.signInAsGuest(name, avatarType);
      setUser(user);
    } catch (error) {
      console.error('ゲスト認証エラー:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      console.error('サインアウトエラー:', error);
      throw error;
    }
  };

  const updateProfile = async (data: { name?: string; avatarType?: string }) => {
    if (!user) throw new Error('ユーザーが認証されていません');

    try {
      if (user.userType === 'google') {
        const updateUseCase = new UpdateProfileUseCase(new SupabaseProfileRepository(createClient()));
        await updateUseCase.execute(user.id, data);
      } else {
        const guestSessionUseCase = new GuestSessionUseCase(new MemoryGuestRepository());
        await guestSessionUseCase.updateGuestInfo(data);
      }

      // ローカル状態更新
      setUser({ ...user, ...data });
    } catch (error) {
      console.error('プロフィール更新エラー:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInAsGuest,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

### カスタムHooks

```typescript
// src/features/auth/presentation/hooks/useAuth.ts
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// src/features/auth/presentation/hooks/useRequireAuth.ts
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading, router])

  return { user, loading }
}

// src/features/auth/presentation/hooks/useAuthRedirect.ts
export function useAuthRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // 認証済みユーザーのリダイレクト処理
      const returnTo = sessionStorage.getItem('returnTo')
      if (returnTo) {
        sessionStorage.removeItem('returnTo')
        router.push(returnTo)
      }
    }
  }, [user, loading, router])

  return { user, loading }
}
```

### 認証ガードコンポーネント

```typescript
// src/features/auth/presentation/components/AuthGuard.tsx
interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // 現在のパスを保存してリダイレクト
      sessionStorage.setItem('returnTo', router.asPath);
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>認証状態を確認中...</div>;
  }

  if (!user) {
    return fallback || null;
  }

  return <>{children}</>;
}

// src/features/auth/presentation/components/GuestOnlyGuard.tsx
export function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/room/main-room');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (user) {
    return null;
  }

  return <>{children}</>;
}
```

### TanStack Query統合

```typescript
// src/features/auth/presentation/hooks/useAuthQuery.ts
export function useAuthQuery() {
  return useQuery({
    queryKey: ['auth', 'current-user'],
    queryFn: async () => {
      const authService = new AuthService(/* 依存注入 */)
      return await authService.getCurrentUser()
    },
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
  })
}

export function useSignInMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (
      type: 'google' | { type: 'guest'; name: string; avatarType: string }
    ) => {
      const authService = new AuthService(/* 依存注入 */)

      if (type === 'google') {
        return await authService.signInWithGoogle()
      } else {
        return await authService.signInAsGuest(type.name, type.avatarType)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] })
    },
  })
}
```

## 成果物

- React認証コンテキスト
- 認証関連カスタムHooks
- 認証ガードコンポーネント
- TanStack Query統合

## 検証方法

- 認証状態の永続化確認
- ページリロード時の状態保持
- 認証ガードの動作確認

## 設計のポイント

- **型安全性**: TypeScriptによる厳密な型定義
- **DI原則**: 依存性注入による疎結合設計
- **リアクティブ**: React Contextによるリアルタイム状態更新

## 次のタスクへの準備

- 認証システム完了により認証フロー統合準備完了
