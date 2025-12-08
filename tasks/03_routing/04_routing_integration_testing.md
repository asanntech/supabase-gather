# [03_routing] 04\_ルーティングシステム統合・テスト

## 概要

ルーティングシステム全体の統合とエンドツーエンドテストを実施し、ナビゲーション機能の完全性を確認する。

## 前提条件

- ミドルウェア・認証ガードが実装済み
- ナビゲーションシステムが実装済み
- 動的ルーティングが実装済み

## 実装対象

### 1. ルーティングシステム統合

全ルーティング機能の結合と動作確認

### 2. エンドツーエンドテスト

実際のユーザーフローでのナビゲーションテスト

### 3. SEO・アクセシビリティ対応

検索エンジンとアクセシビリティへの配慮

## 詳細仕様

### App Layout統合

```typescript
// app/layout.tsx
import { Metadata } from 'next';
import { AuthProvider } from '@/features/auth/presentation/hooks/AuthContext';
import { NavigationProvider } from '@/shared/components/navigation/NavigationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const metadata: Metadata = {
  title: 'Supabase Gather',
  description: 'バーチャルオフィスでリアルタイムコミュニケーション',
  keywords: ['バーチャルオフィス', 'リモートワーク', 'チームコミュニケーション'],
  authors: [{ name: 'Supabase Gather Team' }],
  openGraph: {
    title: 'Supabase Gather',
    description: 'バーチャルオフィスでリアルタイムコミュニケーション',
    type: 'website',
    locale: 'ja_JP',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50">
        <AuthProvider>
          <NavigationProvider>
            <QueryClientProvider client={queryClient}>
              <main className="min-h-screen">
                {children}
              </main>
            </QueryClientProvider>
          </NavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

### グローバルナビゲーション

```typescript
// src/shared/components/layout/GlobalNavigation.tsx
'use client';

import { useAuth } from '@/features/auth/presentation/hooks/useAuth';
import { useNavigationContext, useNavigationState } from '@/shared/hooks/useNavigationState';
import { Breadcrumb, generateBreadcrumbs } from '@/shared/components/navigation/Breadcrumb';

export function GlobalNavigation() {
  const { user, signOut } = useAuth();
  const { navigate } = useNavigationContext();
  const { currentRoute, pageType, roomState, canGoBack } = useNavigationState();

  const breadcrumbs = generateBreadcrumbs(currentRoute);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate.goToHome();
    } catch (error) {
      console.error('サインアウトエラー:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・ブランド */}
          <div className="flex items-center">
            <button
              onClick={() => navigate.goToHome()}
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              Supabase Gather
            </button>
          </div>

          {/* ブレッドクラム */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <Breadcrumb items={breadcrumbs} />
          </div>

          {/* ユーザー情報・ナビゲーション */}
          <div className="flex items-center space-x-4">
            {/* 戻るボタン */}
            {canGoBack && pageType !== 'home' && (
              <button
                onClick={() => navigate.goBack()}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="戻る"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* ルーム情報 */}
            {roomState.isInRoom && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  {roomState.isMainRoom ? 'メインルーム' : `ルーム: ${roomState.roomId}`}
                </span>
              </div>
            )}

            {/* ユーザーメニュー */}
            {user && (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                  aria-label="ユーザーメニュー"
                >
                  <div className={`w-8 h-8 rounded-full bg-${user.avatarType}-500 flex items-center justify-center text-white font-medium`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                  <span className="text-xs text-gray-500">
                    ({user.userType === 'google' ? 'Google' : 'ゲスト'})
                  </span>
                </button>

                {/* ドロップダウンメニュー（将来拡張用） */}
              </div>
            )}

            {/* サインアウトボタン */}
            {user && (
              <button
                onClick={handleSignOut}
                className="px-3 py-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
              >
                サインアウト
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

### ルーティングテストスイート

```typescript
// __tests__/routing/routing-integration.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { TestWrapper } from '@/test-utils/TestWrapper';

// モック
jest.mock('next/navigation');

describe('ルーティング統合テスト', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();
  const mockBack = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      back: mockBack,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('認証フロー', () => {
    it('未認証ユーザーがルームにアクセスするとトップページにリダイレクトされる', async () => {
      // 未認証状態でルームページをレンダー
      render(
        <TestWrapper>
          <RoomPage params={{ room_id: 'main-room' }} searchParams={{}} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('/?returnTo=%2Froom%2Fmain-room')
        );
      });
    });

    it('認証後にリターンURL通りにリダイレクトされる', async () => {
      const returnTo = '/room/main-room';

      render(
        <TestWrapper initialAuth={{ user: mockUser }}>
          <HomePage searchParams={{ returnTo }} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(returnTo);
      });
    });
  });

  describe('動的ルーティング', () => {
    it('有効なルームIDで正常にページが表示される', async () => {
      render(
        <TestWrapper initialAuth={{ user: mockUser }}>
          <RoomPage params={{ room_id: 'main-room' }} searchParams={{}} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/メインルーム/i)).toBeInTheDocument();
      });
    });

    it('無効なルームIDで404ページが表示される', async () => {
      render(
        <TestWrapper initialAuth={{ user: mockUser }}>
          <RoomPage params={{ room_id: 'invalid-room' }} searchParams={{}} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/404/i)).toBeInTheDocument();
        expect(screen.getByText(/ルームが見つかりません/i)).toBeInTheDocument();
      });
    });
  });

  describe('ナビゲーション', () => {
    it('ブレッドクラムが正しく表示される', () => {
      render(
        <TestWrapper>
          <Breadcrumb items={[
            { label: 'ホーム', href: '/' },
            { label: 'メインルーム', current: true },
          ]} />
        </TestWrapper>
      );

      expect(screen.getByText('ホーム')).toBeInTheDocument();
      expect(screen.getByText('メインルーム')).toBeInTheDocument();
    });

    it('戻るボタンが正常に動作する', () => {
      const { result } = renderHook(() => useNavigation(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.goBack();
      });

      expect(mockBack).toHaveBeenCalled();
    });
  });

  describe('ルーム入退室', () => {
    it('ルーム入室が正常に動作する', async () => {
      const { result } = renderHook(() => useRoomNavigation(), {
        wrapper: ({ children }) => (
          <TestWrapper initialAuth={{ user: mockUser }}>
            {children}
          </TestWrapper>
        ),
      });

      await act(async () => {
        await result.current.enterRoom('main-room');
      });

      expect(mockPush).toHaveBeenCalledWith('/room/main-room');
    });

    it('ルーム退室が正常に動作する', () => {
      const { result } = renderHook(() => useRoomNavigation(), {
        wrapper: TestWrapper,
      });

      act(() => {
        result.current.exitRoom();
      });

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});
```

### SEO・メタデータテスト

```typescript
// __tests__/routing/seo-metadata.test.tsx
describe('SEO・メタデータテスト', () => {
  describe('メタデータ生成', () => {
    it('ルームページで正しいメタデータが生成される', async () => {
      const metadata = await generateMetadata({
        params: { room_id: 'main-room' },
        searchParams: {},
      })

      expect(metadata.title).toBe('メインルーム | Supabase Gather')
      expect(metadata.description).toContain('メインルーム')
      expect(metadata.openGraph?.title).toBe('メインルーム | Supabase Gather')
    })

    it('カスタムルームで動的メタデータが生成される', async () => {
      const customRoomId = 'custom-room-123'
      const metadata = await generateMetadata({
        params: { room_id: customRoomId },
        searchParams: {},
      })

      expect(metadata.title).toBe(`ルーム: ${customRoomId} | Supabase Gather`)
    })
  })

  describe('構造化データ', () => {
    it('適切な構造化データが含まれる', () => {
      // JSON-LD構造化データの確認
      // パンくずリスト、組織情報など
    })
  })
})
```

### パフォーマンステスト

```typescript
// __tests__/routing/performance.test.tsx
describe('ルーティング パフォーマンステスト', () => {
  it('ページ遷移が高速である（< 500ms）', async () => {
    const startTime = performance.now()

    const { result } = renderHook(() => useNavigation(), {
      wrapper: TestWrapper,
    })

    await act(async () => {
      result.current.goToMainRoom()
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled()
      })
    })

    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(500)
  })

  it('ナビゲーション履歴が効率的に管理される', () => {
    // 履歴の上限確認、メモリ使用量など
  })
})
```

### アクセシビリティテスト

```typescript
// __tests__/routing/accessibility.test.tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('ルーティング アクセシビリティテスト', () => {
  it('ナビゲーションコンポーネントがアクセシブルである', async () => {
    const { container } = render(
      <TestWrapper>
        <GlobalNavigation />
      </TestWrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('ブレッドクラムが適切なARIAラベルを持つ', () => {
    render(
      <TestWrapper>
        <Breadcrumb items={mockBreadcrumbItems} />
      </TestWrapper>
    );

    expect(screen.getByLabelText('Breadcrumb')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('キーボードナビゲーションが適切に動作する', async () => {
    // Tab、Enter、矢印キーでのナビゲーション確認
  });
});
```

## 成果物

- ルーティングシステム統合確認
- エンドツーエンドテスト
- SEO・メタデータ対応
- アクセシビリティ準拠

## 検証項目

### 機能テスト

- [ ] 認証フローでのリダイレクト
- [ ] 動的ルートでのパラメータ処理
- [ ] 404エラーページの表示
- [ ] ナビゲーション機能の動作
- [ ] ブレッドクラムの正確性

### 非機能テスト

- [ ] ページ遷移のパフォーマンス
- [ ] SEOメタデータの適切性
- [ ] アクセシビリティ準拠
- [ ] モバイル対応

### セキュリティテスト

- [ ] 認証ガードの動作
- [ ] 不正なリダイレクトの防止
- [ ] XSS対策の確認

## 本番環境準備

- Next.js本番ビルドの最適化
- CDN・キャッシュ戦略
- 監視・ログ設定
- エラートラッキング

## 次のフェーズへの準備

ルーティング基盤完了により、アバターシステム実装の準備が整いました。
