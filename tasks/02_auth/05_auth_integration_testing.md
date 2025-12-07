# [02_auth] 05_認証システム統合・テスト

## 概要

認証システム全体の統合とエンドツーエンドテストを実施し、認証フローの完全性を確認する。

## 前提条件

- DDD/Clean Architecture基盤が構築済み
- Google・ゲスト認証システムが実装済み
- 認証コンテキスト・Hooksが実装済み

## 実装対象

### 1. 認証システム統合

全認証コンポーネントの結合と動作確認

### 2. エンドツーエンドテスト

実際のユーザーフローでのテスト

### 3. エラーハンドリング

認証エラーの適切な処理とユーザーフィードバック

## 詳細仕様

### App Router統合

```typescript
// src/app/layout.tsx
import { AuthProvider } from '@/features/auth/presentation/hooks/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 認証ミドルウェア

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // 保護されたルートの定義
  const protectedRoutes = ['/room']
  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )

  if (isProtectedRoute) {
    // Supabase Auth状態確認（Googleユーザー用）
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // ゲスト認証はクライアントサイドでチェック（サーバーサイドでは確認不可）
    if (!session) {
      // 未認証の場合、認証ページにリダイレクト
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/'
      redirectUrl.searchParams.set('returnTo', req.nextUrl.pathname)

      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: ['/room/:path*'],
}
```

### エラーバウンダリー

```typescript
// src/features/auth/presentation/components/AuthErrorBoundary.tsx
interface AuthErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class AuthErrorBoundary extends Component<
  PropsWithChildren<{}>,
  AuthErrorBoundaryState
> {
  constructor(props: PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('認証エラー:', error, errorInfo);

    // エラー監視サービスに送信（例：Sentry）
    // sendToErrorMonitoring(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">認証エラーが発生しました</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || '予期しないエラーが発生しました'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 認証フロー テストスイート

```typescript
// __tests__/auth/auth-flow.test.tsx
describe('認証フロー統合テスト', () => {
  beforeEach(() => {
    // テスト環境のセットアップ
    render(
      <AuthErrorBoundary>
        <AuthProvider>
          <QueryClientProvider client={testQueryClient}>
            <TestComponent />
          </QueryClientProvider>
        </AuthProvider>
      </AuthErrorBoundary>
    );
  });

  describe('Google認証フロー', () => {
    it('Google認証が正常に完了する', async () => {
      // Google認証ボタンクリック
      const googleButton = screen.getByRole('button', { name: /google.*ログイン/i });
      fireEvent.click(googleButton);

      // 認証完了を待機
      await waitFor(() => {
        expect(screen.getByText(/認証完了/i)).toBeInTheDocument();
      });

      // プロフィール作成確認
      expect(screen.getByDisplayValue(/test.*user/i)).toBeInTheDocument();
    });

    it('Google認証エラーが適切に処理される', async () => {
      // エラー状態をモック
      mockSupabaseAuth.mockRejectedValueOnce(new Error('認証エラー'));

      const googleButton = screen.getByRole('button', { name: /google.*ログイン/i });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText(/認証エラーが発生しました/i)).toBeInTheDocument();
      });
    });
  });

  describe('ゲスト認証フロー', () => {
    it('ゲスト認証が正常に完了する', async () => {
      // ゲスト情報入力
      const nameInput = screen.getByLabelText(/表示名/i);
      const avatarSelect = screen.getByLabelText(/アバター/i);

      fireEvent.change(nameInput, { target: { value: 'テストゲスト' } });
      fireEvent.change(avatarSelect, { target: { value: 'blue' } });

      // ゲストログインボタンクリック
      const guestButton = screen.getByRole('button', { name: /ゲスト.*ログイン/i });
      fireEvent.click(guestButton);

      await waitFor(() => {
        expect(screen.getByText(/ゲストとしてログインしました/i)).toBeInTheDocument();
      });
    });

    it('ゲスト情報が一時的に保存される', async () => {
      // ゲスト認証実行
      await performGuestSignIn('テストゲスト', 'blue');

      // ページ内遷移で情報が保持されること
      const { user } = renderHook(() => useAuth()).result.current;
      expect(user?.name).toBe('テストゲスト');
      expect(user?.userType).toBe('guest');
    });
  });

  describe('認証ガード', () => {
    it('未認証時に保護されたページにアクセスするとリダイレクトされる', async () => {
      const mockPush = jest.fn();
      mockUseRouter.mockReturnValue({ push: mockPush, asPath: '/room/main' });

      render(<AuthGuard><div>保護されたコンテンツ</div></AuthGuard>);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/');
      });
    });

    it('認証済みユーザーは保護されたコンテンツにアクセスできる', async () => {
      // 認証済み状態をモック
      mockUseAuth.mockReturnValue({
        user: { id: '1', name: 'Test User', userType: 'google' },
        loading: false
      });

      render(<AuthGuard><div>保護されたコンテンツ</div></AuthGuard>);

      expect(screen.getByText('保護されたコンテンツ')).toBeInTheDocument();
    });
  });

  describe('状態管理', () => {
    it('認証状態がページリロード後も保持される', async () => {
      // 初回認証
      await performGoogleSignIn();

      // ページリロードをシミュレート
      const { rerender } = render(<AuthProvider><TestComponent /></AuthProvider>);
      rerender(<AuthProvider><TestComponent /></AuthProvider>);

      await waitFor(() => {
        const { user } = renderHook(() => useAuth()).result.current;
        expect(user).toBeTruthy();
      });
    });
  });
});
```

### パフォーマンステスト

```typescript
// __tests__/auth/auth-performance.test.tsx
describe('認証システム パフォーマンステスト', () => {
  it('認証状態の初期化が高速である（< 1秒）', async () => {
    const startTime = performance.now();

    render(<AuthProvider><TestComponent /></AuthProvider>);

    await waitFor(() => {
      const { loading } = renderHook(() => useAuth()).result.current;
      expect(loading).toBe(false);
    });

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(1000);
  });

  it('大量の認証状態変更に耐えられる', async () => {
    const authService = new AuthService(/* 依存注入 */);

    const promises = Array.from({ length: 100 }, async (_, i) => {
      await authService.signInAsGuest(`ゲスト${i}`, 'blue');
      await authService.signOut();
    });

    await expect(Promise.all(promises)).resolves.not.toThrow();
  });
});
```

## 成果物

- 認証システム統合確認
- エンドツーエンドテスト
- エラーハンドリング機能
- パフォーマンステスト

## 検証項目

### 機能テスト

- [ ] Google認証ログイン・ログアウト
- [ ] ゲスト認証ログイン・セッション管理
- [ ] プロフィール更新（Google用）
- [ ] 認証ガードによるリダイレクト
- [ ] エラー状態の適切な表示

### 非機能テスト

- [ ] 認証状態初期化のパフォーマンス
- [ ] メモリリークの確認
- [ ] セキュリティ（XSS、CSRF対策）

### ユーザビリティテスト

- [ ] 認証フローの直感性
- [ ] エラーメッセージの分かりやすさ
- [ ] ローディング状態の適切な表示

## 本番環境準備

- Supabase本番環境設定
- Google OAuth2.0本番クライアント設定
- 環境変数の適切な設定
- エラー監視（Sentry等）の設定

## 次のフェーズへの準備

認証システム完了により、ルーティング基盤実装の準備が整いました。
