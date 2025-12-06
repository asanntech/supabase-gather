# タスク: 動的ルーティング実装

## 概要
Next.js App Routerの動的ルーティング機能を使用して、ルーム機能の柔軟なURL構造を実装する。

## 前提条件
- ミドルウェア・認証ガードが実装済み
- ナビゲーションシステムが実装済み

## 実装対象
### 1. 動的ルートページ
ルームIDに基づく動的ページ生成

### 2. パラメータ検証
URLパラメータの妥当性確認

### 3. エラーハンドリング
無効なルートでの適切な処理

## 詳細仕様

### 動的ルートページ実装
```typescript
// app/room/[room_id]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import RoomPageClient from './RoomPageClient';

interface RoomPageProps {
  params: {
    room_id: string;
  };
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

// ルームIDの妥当性検証
function validateRoomId(roomId: string): boolean {
  // MVP段階: main-roomのみ許可
  const allowedRooms = ['main-room'];
  
  // 将来の拡張: UUID形式 or 英数字+ハイフン
  const roomIdPattern = /^[a-zA-Z0-9-_]+$/;
  
  return allowedRooms.includes(roomId) || roomIdPattern.test(roomId);
}

// ルームの存在確認（将来拡張用）
async function checkRoomExists(roomId: string): Promise<boolean> {
  // MVP段階: main-roomのみ存在
  if (roomId === 'main-room') return true;
  
  // 将来: データベースでルーム存在確認
  // const room = await getRoomById(roomId);
  // return !!room;
  
  return false;
}

export async function generateMetadata(
  { params }: RoomPageProps
): Promise<Metadata> {
  const { room_id } = params;
  
  // ルーム名の取得（将来拡張用）
  const getRoomName = (roomId: string) => {
    if (roomId === 'main-room') return 'メインルーム';
    return `ルーム: ${roomId}`;
  };

  const roomName = getRoomName(room_id);

  return {
    title: `${roomName} | Supabase Gather`,
    description: `${roomName}でチームメンバーとリアルタイムでコミュニケーションしましょう。`,
    openGraph: {
      title: `${roomName} | Supabase Gather`,
      description: `${roomName}に参加してバーチャルオフィス体験を始めましょう。`,
      type: 'website',
    },
  };
}

export default async function RoomPage({ params, searchParams }: RoomPageProps) {
  const { room_id } = params;

  // ルームIDの基本検証
  if (!validateRoomId(room_id)) {
    notFound();
  }

  // ルームの存在確認
  const roomExists = await checkRoomExists(room_id);
  if (!roomExists) {
    notFound();
  }

  // クライアントコンポーネントに渡すProps
  const roomProps = {
    roomId: room_id,
    initialQuery: searchParams,
  };

  return <RoomPageClient {...roomProps} />;
}

// 静的パラメータ生成（MVP段階）
export function generateStaticParams() {
  // MVP段階: main-roomのみ
  return [
    { room_id: 'main-room' },
  ];
}
```

### クライアントサイドルーム検証
```typescript
// app/room/[room_id]/RoomPageClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/shared/components/AuthGuard';
import { useAuth } from '@/features/auth/presentation/hooks/useAuth';

interface RoomPageClientProps {
  roomId: string;
  initialQuery?: Record<string, string | string[] | undefined>;
}

interface RoomState {
  loading: boolean;
  exists: boolean;
  accessible: boolean;
  error?: string;
}

export default function RoomPageClient({ roomId, initialQuery }: RoomPageClientProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [roomState, setRoomState] = useState<RoomState>({
    loading: true,
    exists: false,
    accessible: false,
  });

  // ルーム状態の検証
  useEffect(() => {
    const validateRoom = async () => {
      try {
        // 1. ルームの存在確認
        const roomExists = await checkRoomExistence(roomId);
        if (!roomExists) {
          setRoomState({
            loading: false,
            exists: false,
            accessible: false,
            error: 'ルームが見つかりません',
          });
          return;
        }

        // 2. アクセス権限の確認（将来拡張用）
        const hasAccess = await checkRoomAccess(roomId, user);
        if (!hasAccess) {
          setRoomState({
            loading: false,
            exists: true,
            accessible: false,
            error: 'このルームにアクセスする権限がありません',
          });
          return;
        }

        // 3. ルーム定員の確認
        const roomCapacity = await checkRoomCapacity(roomId);
        if (!roomCapacity.available) {
          setRoomState({
            loading: false,
            exists: true,
            accessible: false,
            error: `ルームが満員です (${roomCapacity.current}/${roomCapacity.max})`,
          });
          return;
        }

        setRoomState({
          loading: false,
          exists: true,
          accessible: true,
        });

      } catch (error) {
        console.error('ルーム検証エラー:', error);
        setRoomState({
          loading: false,
          exists: false,
          accessible: false,
          error: 'ルーム情報の取得に失敗しました',
        });
      }
    };

    if (user) {
      validateRoom();
    }
  }, [roomId, user]);

  // ローディング状態
  if (roomState.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">ルーム情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (!roomState.exists || !roomState.accessible) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            ルームにアクセスできません
          </h1>
          <p className="text-gray-600 mb-6">
            {roomState.error || '予期しないエラーが発生しました'}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              ホームに戻る
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 正常状態: ルームコンポーネントを表示
  return (
    <AuthGuard>
      <RoomContainer roomId={roomId} />
    </AuthGuard>
  );
}

// ルーム検証ユーティリティ
async function checkRoomExistence(roomId: string): Promise<boolean> {
  // MVP: main-roomのみ存在
  if (roomId === 'main-room') return true;
  
  // 将来: API呼び出し
  // const response = await fetch(`/api/rooms/${roomId}`);
  // return response.ok;
  
  return false;
}

async function checkRoomAccess(roomId: string, user: User | null): Promise<boolean> {
  // MVP: 認証済みユーザーは全アクセス可能
  return !!user;
}

interface RoomCapacityInfo {
  available: boolean;
  current: number;
  max: number;
}

async function checkRoomCapacity(roomId: string): Promise<RoomCapacityInfo> {
  // MVP: 5人制限
  const maxCapacity = 5;
  
  // TODO: Presence APIでの現在の接続数確認
  // const currentCount = await getCurrentRoomCount(roomId);
  const currentCount = 0; // 暫定
  
  return {
    available: currentCount < maxCapacity,
    current: currentCount,
    max: maxCapacity,
  };
}
```

### 404エラーページ
```typescript
// app/room/[room_id]/not-found.tsx
import Link from 'next/link';

export default function RoomNotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          ルームが見つかりません
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          指定されたルームは存在しないか、アクセス権限がありません。
          URLを確認してから再度お試しください。
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            ホームに戻る
          </Link>
          <Link
            href="/rooms"
            className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ルーム一覧を見る
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### ルーティングユーティリティ拡張
```typescript
// src/shared/utils/routing.ts
export const ROOM_PATTERNS = {
  MAIN_ROOM: 'main-room',
  ROOM_ID_REGEX: /^[a-zA-Z0-9-_]{1,50}$/,
} as const;

export function parseRoomRoute(pathname: string) {
  const match = pathname.match(/^\/room\/([^\/]+)$/);
  if (!match) return null;

  const roomId = match[1];
  return {
    roomId,
    isMainRoom: roomId === ROOM_PATTERNS.MAIN_ROOM,
    isValid: validateRoomId(roomId),
  };
}

export function validateRoomId(roomId: string): boolean {
  if (!roomId || roomId.length === 0) return false;
  if (roomId === ROOM_PATTERNS.MAIN_ROOM) return true;
  return ROOM_PATTERNS.ROOM_ID_REGEX.test(roomId);
}

export function buildRoomUrl(roomId: string, params?: Record<string, string>): string {
  let url = `/room/${roomId}`;
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
}

// URL生成ヘルパー
export const roomUrls = {
  main: () => buildRoomUrl('main-room'),
  byId: (roomId: string) => buildRoomUrl(roomId),
  withReturn: (roomId: string, returnTo: string) => 
    buildRoomUrl(roomId, { returnTo }),
};
```

## 成果物
- 動的ルートページ実装
- ルームパラメータ検証機能
- エラーページ・状態処理
- ルーティングユーティリティ拡張

## 検証方法
### テストケース
1. **有効なルーム**
   - `/room/main-room` への正常アクセス
   - メタデータの正確な生成

2. **無効なルーム**
   - 存在しないルームでの404表示
   - 不正な文字を含むルームIDの処理

3. **権限・定員制限**
   - アクセス権限のない場合の処理
   - 定員超過時の適切なエラー表示

## SEO・メタデータ対応
- 動的なページタイトル・説明文
- Open Graphメタデータ
- 検索エンジン最適化

## パフォーマンス考慮
- 静的パラメータ生成（MVP段階）
- クライアントサイド検証の最適化
- 不要な再検証の回避

## 次のタスクへの準備
動的ルーティング基盤完了により、ルーティング統合テスト準備完了