# タスク: ミドルウェア・認証ガード実装

## 概要

Next.js App Routerのミドルウェア機能を使用して、ルート保護と認証ガード機能を実装する。

## 前提条件

- 認証システム（Google・ゲスト）が実装済み
- Next.js App Router環境が構築済み

## 実装対象

### 1. Next.js ミドルウェア

保護されたルートへのアクセス制御

### 2. 認証ガードロジック

未認証ユーザーのリダイレクト処理

### 3. セッション状態管理

認証状態の効率的な確認

## 詳細仕様

### ミドルウェア実装

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

    // 未認証の場合の処理
    if (!session) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/'

      // 元のパスをクエリパラメータに保存
      redirectUrl.searchParams.set(
        'returnTo',
        req.nextUrl.pathname + req.nextUrl.search
      )

      return NextResponse.redirect(redirectUrl)
    }

    // セッション有効性の追加確認
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error || !user) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/'
      redirectUrl.searchParams.set(
        'returnTo',
        req.nextUrl.pathname + req.nextUrl.search
      )
      redirectUrl.searchParams.set('error', 'session-expired')

      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### クライアントサイド認証ガード

```typescript
// src/shared/components/AuthGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/presentation/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, fallback, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && requireAuth) {
      if (!user) {
        // 現在のパスを保存してリダイレクト
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = new URL('/', window.location.origin);
        redirectUrl.searchParams.set('returnTo', currentPath);

        router.push(redirectUrl.toString());
      }
    }
  }, [user, loading, requireAuth, router]);

  // ローディング中の表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">認証状態を確認中...</span>
      </div>
    );
  }

  // 認証が必要だが未認証の場合
  if (requireAuth && !user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">認証が必要です</h2>
          <p className="text-gray-600">このページにアクセスするには認証が必要です。</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// src/shared/components/GuestOnlyGuard.tsx
export function GuestOnlyGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // 認証済みユーザーはメインルームにリダイレクト
      router.push('/room/main-room');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (user) {
    return null; // リダイレクト中
  }

  return <>{children}</>;
}
```

### 認証状態Hook拡張

```typescript
// src/features/auth/presentation/hooks/useAuthGuard.ts
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'

export function useAuthGuard(options?: {
  requireAuth?: boolean
  redirectTo?: string
  onUnauthorized?: () => void
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  const { requireAuth = true, redirectTo = '/', onUnauthorized } = options || {}

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        if (onUnauthorized) {
          onUnauthorized()
        } else {
          const currentPath = window.location.pathname + window.location.search
          const redirectUrl = new URL(redirectTo, window.location.origin)
          redirectUrl.searchParams.set('returnTo', currentPath)

          router.push(redirectUrl.toString())
        }
      }
    }
  }, [user, loading, requireAuth, redirectTo, router, onUnauthorized])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAuthorized: !requireAuth || !!user,
  }
}

// src/features/auth/presentation/hooks/useReturnToRedirect.ts
export function useReturnToRedirect() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && user) {
      const returnTo = searchParams.get('returnTo')
      if (returnTo) {
        // returnToパラメータを削除して遷移
        const url = new URL(returnTo, window.location.origin)
        router.replace(url.pathname + url.search)
      }
    }
  }, [user, loading, router, searchParams])

  return { user, loading }
}
```

### エラーハンドリング

```typescript
// src/shared/components/AuthError.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AuthError() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorCode = searchParams.get('error');

    switch (errorCode) {
      case 'session-expired':
        setError('セッションの有効期限が切れました。再度ログインしてください。');
        break;
      case 'access-denied':
        setError('このページにアクセスする権限がありません。');
        break;
      case 'auth-required':
        setError('このページにアクセスするには認証が必要です。');
        break;
      default:
        setError(null);
    }
  }, [searchParams]);

  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    </div>
  );
}
```

## 成果物

- Next.js ミドルウェア実装
- クライアントサイド認証ガード
- リダイレクト処理機能
- エラーハンドリング

## 検証方法

### テストケース

1. **未認証ユーザーのアクセス**
   - `/room/main-room` に直接アクセス
   - `/` へのリダイレクト確認
   - `returnTo` パラメータの保存確認

2. **認証済みユーザーのアクセス**
   - 保護されたページへの正常アクセス
   - セッション有効性の確認

3. **セッション期限切れ**
   - 期限切れセッションでのアクセス
   - 適切なエラー表示とリダイレクト

## セキュリティ考慮事項

- **リダイレクト先の検証**: Open Redirectの防止
- **セッション状態の確認**: 定期的な有効性チェック
- **ゲスト認証の制限**: クライアントサイドでの制限

## パフォーマンス最適化

- ミドルウェアでの効率的な認証確認
- 不要な認証チェックの回避
- キャッシュ戦略の実装

## 次のタスクへの準備

保護ルートとリダイレクト基盤完了により、ナビゲーション機能実装準備完了
