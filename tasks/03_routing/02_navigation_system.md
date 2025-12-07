# [03_routing] 02_ナビゲーションシステム実装

## 概要

アプリケーション全体で使用するナビゲーション機能とプログラマティックルーティングを実装する。

## 前提条件

- ミドルウェア・認証ガードが実装済み
- 認証システムが実装済み

## 実装対象

### 1. ナビゲーションコンポーネント

アプリケーション共通のナビゲーション要素

### 2. プログラマティックルーティング

コード内での動的なページ遷移機能

### 3. ブレッドクラムナビゲーション

現在位置の表示とナビゲーション支援

## 詳細仕様

### ナビゲーションユーティリティ

```typescript
// src/shared/utils/navigation.ts
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export const ROUTES = {
  HOME: '/',
  ROOM: (roomId: string) => `/room/${roomId}`,
  MAIN_ROOM: '/room/main-room',
  // 将来の拡張用
  ROOMS: '/rooms',
  ROOMS_CREATE: '/rooms/create',
  SETTINGS: '/settings',
} as const

export type RouteKey = keyof typeof ROUTES
export type RouteValue = (typeof ROUTES)[RouteKey]

export class NavigationService {
  constructor(private router: AppRouterInstance) {}

  // 基本ナビゲーション
  goToHome() {
    this.router.push(ROUTES.HOME)
  }

  goToMainRoom() {
    this.router.push(ROUTES.MAIN_ROOM)
  }

  goToRoom(roomId: string, options?: { replace?: boolean }) {
    const route = ROUTES.ROOM(roomId)

    if (options?.replace) {
      this.router.replace(route)
    } else {
      this.router.push(route)
    }
  }

  // 認証関連ナビゲーション
  redirectToAuthWithReturn(returnPath?: string) {
    const url = new URL(ROUTES.HOME, window.location.origin)

    if (returnPath) {
      url.searchParams.set('returnTo', returnPath)
    } else {
      url.searchParams.set(
        'returnTo',
        window.location.pathname + window.location.search
      )
    }

    this.router.push(url.toString())
  }

  // 戻る・進む
  goBack() {
    if (window.history.length > 1) {
      this.router.back()
    } else {
      this.goToHome()
    }
  }

  // 外部リンク
  openExternal(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

// カスタムフック
export function useNavigation() {
  const router = useRouter()
  return useMemo(() => new NavigationService(router), [router])
}
```

### ナビゲーションコンテキスト

```typescript
// src/shared/components/navigation/NavigationProvider.tsx
'use client';

interface NavigationContextType {
  currentRoute: string;
  previousRoute: string | null;
  navigationHistory: string[];
  navigate: NavigationService;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [currentRoute, setCurrentRoute] = useState(pathname);
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([pathname]);

  const navigate = useMemo(() => new NavigationService(router), [router]);

  // ルート変更の監視
  useEffect(() => {
    const fullPath = pathname + (searchParams.toString() ? `?${searchParams}` : '');

    if (fullPath !== currentRoute) {
      setPreviousRoute(currentRoute);
      setCurrentRoute(fullPath);

      setNavigationHistory(prev => {
        const newHistory = [...prev, fullPath];
        // 履歴を最大10件に制限
        return newHistory.slice(-10);
      });
    }
  }, [pathname, searchParams, currentRoute]);

  return (
    <NavigationContext.Provider
      value={{
        currentRoute,
        previousRoute,
        navigationHistory,
        navigate,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigationContext() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigationContext must be used within NavigationProvider');
  }
  return context;
}
```

### ブレッドクラムコンポーネント

```typescript
// src/shared/components/navigation/Breadcrumb.tsx
interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export function Breadcrumb({ items, separator = '/' }: BreadcrumbProps) {
  const { navigate } = useNavigationContext();

  return (
    <nav aria-label="Breadcrumb" className="flex">
      <ol role="list" className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index}>
            <div className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400 select-none">
                  {separator}
                </span>
              )}

              {item.href && !item.current ? (
                <button
                  onClick={() => navigate.router.push(item.href!)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span
                  className={`${
                    item.current
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-500'
                  }`}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

// ブレッドクラム生成ユーティリティ
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // ホーム
  items.push({
    label: 'ホーム',
    href: ROUTES.HOME,
    current: pathname === ROUTES.HOME,
  });

  // パスに基づいた階層構築
  let currentPath = '';

  for (let i = 0; i < paths.length; i++) {
    const segment = paths[i];
    currentPath += `/${segment}`;
    const isLast = i === paths.length - 1;

    switch (segment) {
      case 'room':
        if (paths[i + 1]) {
          const roomId = paths[i + 1];
          items.push({
            label: roomId === 'main-room' ? 'メインルーム' : `ルーム: ${roomId}`,
            href: isLast ? undefined : currentPath + `/${roomId}`,
            current: isLast || (i === paths.length - 2),
          });
          i++; // roomIdをスキップ
          currentPath += `/${roomId}`;
        }
        break;

      case 'rooms':
        items.push({
          label: 'ルーム一覧',
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
        break;

      case 'settings':
        items.push({
          label: '設定',
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
        break;

      default:
        items.push({
          label: segment,
          href: isLast ? undefined : currentPath,
          current: isLast,
        });
    }
  }

  return items;
}
```

### ナビゲーション状態Hook

```typescript
// src/shared/hooks/useNavigationState.ts
export function useNavigationState() {
  const { currentRoute, previousRoute, navigationHistory } =
    useNavigationContext()
  const pathname = usePathname()

  // ページタイプの判定
  const pageType = useMemo(() => {
    if (pathname === ROUTES.HOME) return 'home'
    if (pathname.startsWith('/room/')) return 'room'
    if (pathname.startsWith('/rooms')) return 'rooms'
    if (pathname.startsWith('/settings')) return 'settings'
    return 'unknown'
  }, [pathname])

  // ルーム関連の状態
  const roomState = useMemo(() => {
    if (pageType === 'room') {
      const roomId = pathname.split('/')[2]
      return {
        isInRoom: true,
        roomId,
        isMainRoom: roomId === 'main-room',
      }
    }
    return {
      isInRoom: false,
      roomId: null,
      isMainRoom: false,
    }
  }, [pathname, pageType])

  // 戻るボタンの状態
  const canGoBack = useMemo(() => {
    return navigationHistory.length > 1
  }, [navigationHistory])

  return {
    currentRoute,
    previousRoute,
    navigationHistory,
    pageType,
    roomState,
    canGoBack,
  }
}

// ルーム遷移専用Hook
export function useRoomNavigation() {
  const { navigate } = useNavigationContext()
  const { user } = useAuth()

  const enterRoom = useCallback(
    async (roomId: string) => {
      if (!user) {
        navigate.redirectToAuthWithReturn(ROUTES.ROOM(roomId))
        return
      }

      // ルーム入室前の検証（将来の拡張用）
      // - ルームの存在確認
      // - アクセス権限確認
      // - 定員確認など

      navigate.goToRoom(roomId)
    },
    [navigate, user]
  )

  const exitRoom = useCallback(() => {
    navigate.goToHome()
  }, [navigate])

  const switchRoom = useCallback(
    (newRoomId: string) => {
      navigate.goToRoom(newRoomId, { replace: true })
    },
    [navigate]
  )

  return {
    enterRoom,
    exitRoom,
    switchRoom,
  }
}
```

## 成果物

- ナビゲーションサービス・ユーティリティ
- ナビゲーションコンテキスト
- ブレッドクラムコンポーネント
- ナビゲーション状態管理Hook

## 検証方法

### テストケース

1. **基本ナビゲーション**
   - ホーム ⇄ ルーム間の遷移
   - 戻るボタンの動作
   - URLの正確性

2. **認証連携**
   - 未認証時の適切なリダイレクト
   - 認証後の元ページ復帰

3. **ブレッドクラム**
   - パスに応じた正しい階層表示
   - クリックによる遷移

## 設計のポイント

- **型安全性**: ルート定数による型安全なナビゲーション
- **拡張性**: 将来の新ページ追加に対応可能
- **ユーザビリティ**: 直感的なナビゲーション体験

## 次のタスクへの準備

ナビゲーション基盤完了により、動的ルーティング実装準備完了
