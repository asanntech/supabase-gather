# タスク: Presence・定員管理システム実装

## 概要
Supabase Realtime Presenceを利用したリアルタイム定員管理システムを実装し、5人制限の入退室制御を行う。

## 前提条件
- ルームドメイン基盤が実装済み
- Supabase Realtimeが設定済み
- 認証システムが実装済み

## 実装対象
### 1. Presence統合サービス
Supabase Realtime Presenceとのインターフェース

### 2. リアルタイム定員管理
接続中ユーザー数の監視・制御

### 3. 入退室制御ロジック
定員制限に基づく入室許可・拒否

## 詳細仕様

### Presence統合インフラ
```typescript
// src/features/rooms/infrastructure/supabase/SupabasePresenceService.ts
export interface PresenceState {
  clientId: string;
  userId: string | null;
  userType: 'google' | 'guest';
  displayName: string;
  avatarType: string;
  joinedAt: string;
  lastActiveAt: string;
}

export class SupabasePresenceService {
  private channel: RealtimeChannel | null = null;
  private currentPresence: Map<string, PresenceState> = new Map();

  constructor(
    private supabase: SupabaseClient,
    private onPresenceChange?: (presence: Map<string, PresenceState>) => void
  ) {}

  async joinRoom(roomId: string, userState: PresenceState): Promise<void> {
    const channelName = `room:${roomId}`;
    
    // 既存チャンネルがあれば切断
    if (this.channel) {
      await this.leaveRoom();
    }

    this.channel = this.supabase.channel(channelName, {
      config: {
        presence: { key: userState.clientId }
      }
    });

    // Presence状態変更の監視
    this.channel
      .on('presence', { event: 'sync' }, () => {
        this.handlePresenceSync();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        this.handlePresenceJoin(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        this.handlePresenceLeave(key, leftPresences);
      });

    // チャンネル参加
    await this.channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        // Presence状態をトラック
        await this.channel?.track(userState);
      }
    });
  }

  async leaveRoom(): Promise<void> {
    if (this.channel) {
      await this.channel.untrack();
      await this.channel.unsubscribe();
      this.channel = null;
      this.currentPresence.clear();
    }
  }

  getCurrentPresence(): Map<string, PresenceState> {
    return new Map(this.currentPresence);
  }

  getCurrentCount(): number {
    return this.currentPresence.size;
  }

  private handlePresenceSync(): void {
    const presenceState = this.channel?.presenceState();
    if (!presenceState) return;

    // Presence状態を更新
    this.currentPresence.clear();
    
    Object.entries(presenceState).forEach(([clientId, presences]) => {
      const presence = presences[0] as PresenceState;
      if (presence) {
        this.currentPresence.set(clientId, presence);
      }
    });

    this.onPresenceChange?.(this.currentPresence);
  }

  private handlePresenceJoin(key: string, newPresences: any[]): void {
    const presence = newPresences[0] as PresenceState;
    if (presence) {
      this.currentPresence.set(key, presence);
      this.onPresenceChange?.(this.currentPresence);
    }
  }

  private handlePresenceLeave(key: string, leftPresences: any[]): void {
    this.currentPresence.delete(key);
    this.onPresenceChange?.(this.currentPresence);
  }

  // ハートビート機能（接続維持）
  startHeartbeat(intervalMs: number = 30000): void {
    setInterval(async () => {
      if (this.channel) {
        const currentState = this.channel.presenceState();
        const myClientId = Object.keys(currentState)[0];
        
        if (myClientId) {
          const updatedState: Partial<PresenceState> = {
            lastActiveAt: new Date().toISOString(),
          };
          
          await this.channel.track(updatedState);
        }
      }
    }, intervalMs);
  }
}
```

### 定員管理ドメインサービス
```typescript
// src/features/rooms/domain/services/RoomPresenceService.ts
export class RoomPresenceService {
  constructor(
    private presenceService: SupabasePresenceService,
    private capacityService: RoomCapacityService
  ) {}

  async attemptJoinRoom(
    roomId: RoomId,
    user: User
  ): Promise<{
    success: boolean;
    error?: string;
    currentCapacity?: RoomCapacity;
  }> {
    try {
      // 1. 事前定員確認
      const capacity = await this.capacityService.getCurrentCapacity(roomId);
      
      if (capacity.isFull) {
        return {
          success: false,
          error: `ルームが満員です (${capacity.current}/${capacity.max})`,
          currentCapacity: capacity,
        };
      }

      // 2. Presence状態作成
      const clientId = this.generateClientId(user);
      const presenceState: PresenceState = {
        clientId,
        userId: user.userType === 'google' ? user.id : null,
        userType: user.userType,
        displayName: user.name,
        avatarType: user.avatarType,
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      // 3. ルーム参加試行
      await this.presenceService.joinRoom(roomId.getValue(), presenceState);

      // 4. 参加後の定員確認（レースコンディション対策）
      const postJoinCapacity = await this.waitForPresenceUpdate();
      
      if (postJoinCapacity.current > postJoinCapacity.max) {
        // 定員オーバーの場合、退室
        await this.presenceService.leaveRoom();
        
        return {
          success: false,
          error: '同時入室により定員を超過しました。再度お試しください。',
          currentCapacity: postJoinCapacity,
        };
      }

      return {
        success: true,
        currentCapacity: postJoinCapacity,
      };

    } catch (error) {
      console.error('ルーム参加エラー:', error);
      return {
        success: false,
        error: 'ルームへの参加に失敗しました',
      };
    }
  }

  async leaveRoom(): Promise<void> {
    await this.presenceService.leaveRoom();
  }

  getCurrentRoomState(): {
    members: PresenceState[];
    capacity: RoomCapacity;
  } {
    const presence = this.presenceService.getCurrentPresence();
    const members = Array.from(presence.values());
    const currentCount = members.length;
    const maxCapacity = RoomCapacityLimit.DEFAULT_MAX_CAPACITY;

    return {
      members,
      capacity: {
        roomId: 'main-room', // MVP固定
        current: currentCount,
        max: maxCapacity,
        available: Math.max(0, maxCapacity - currentCount),
        isFull: currentCount >= maxCapacity,
      },
    };
  }

  onPresenceChange(callback: (state: {
    members: PresenceState[];
    capacity: RoomCapacity;
  }) => void): void {
    this.presenceService.onPresenceChange = () => {
      callback(this.getCurrentRoomState());
    };
  }

  private generateClientId(user: User): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${user.userType}-${user.id}-${timestamp}-${randomSuffix}`;
  }

  private async waitForPresenceUpdate(timeoutMs: number = 1000): Promise<RoomCapacity> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkCapacity = () => {
        const currentState = this.getCurrentRoomState();
        
        if (Date.now() - startTime > timeoutMs) {
          resolve(currentState.capacity);
          return;
        }

        // 少し待ってから再確認
        setTimeout(checkCapacity, 100);
      };

      checkCapacity();
    });
  }
}
```

### React統合Hook
```typescript
// src/features/rooms/presentation/hooks/useRoomPresence.ts
export function useRoomPresence(roomId?: string) {
  const { user } = useAuth();
  const [roomState, setRoomState] = useState<{
    members: PresenceState[];
    capacity: RoomCapacity;
    loading: boolean;
    error?: string;
  }>({
    members: [],
    capacity: {
      roomId: roomId || 'main-room',
      current: 0,
      max: 5,
      available: 5,
      isFull: false,
    },
    loading: false,
  });

  const [presenceService, setPresenceService] = useState<RoomPresenceService | null>(null);

  // Presence サービス初期化
  useEffect(() => {
    if (!roomId) return;

    const supabaseClient = createClient(/* config */);
    const supabasePresenceService = new SupabasePresenceService(supabaseClient);
    const capacityService = new RoomCapacityService(/* 依存注入 */);
    const service = new RoomPresenceService(supabasePresenceService, capacityService);

    setPresenceService(service);

    return () => {
      service.leaveRoom().catch(console.error);
    };
  }, [roomId]);

  // Presence 変更監視
  useEffect(() => {
    if (!presenceService) return;

    presenceService.onPresenceChange((state) => {
      setRoomState(prev => ({
        ...prev,
        members: state.members,
        capacity: state.capacity,
        loading: false,
      }));
    });
  }, [presenceService]);

  const joinRoom = useCallback(async () => {
    if (!presenceService || !user || !roomId) {
      return { success: false, error: '必要な情報が不足しています' };
    }

    setRoomState(prev => ({ ...prev, loading: true, error: undefined }));

    try {
      const roomIdObj = RoomId.create(roomId);
      const result = await presenceService.attemptJoinRoom(roomIdObj, user);

      if (!result.success) {
        setRoomState(prev => ({
          ...prev,
          loading: false,
          error: result.error,
          capacity: result.currentCapacity || prev.capacity,
        }));
      }

      return result;

    } catch (error) {
      const errorMessage = '入室に失敗しました';
      setRoomState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      return { success: false, error: errorMessage };
    }
  }, [presenceService, user, roomId]);

  const leaveRoom = useCallback(async () => {
    if (!presenceService) return;

    await presenceService.leaveRoom();
    setRoomState(prev => ({
      ...prev,
      members: [],
      capacity: {
        ...prev.capacity,
        current: 0,
        available: prev.capacity.max,
        isFull: false,
      },
    }));
  }, [presenceService]);

  return {
    ...roomState,
    joinRoom,
    leaveRoom,
    isConnected: presenceService !== null,
  };
}

// src/features/rooms/presentation/hooks/useRoomCapacityMonitor.ts
export function useRoomCapacityMonitor(roomId: string) {
  const [capacityInfo, setCapacityInfo] = useState<{
    current: number;
    max: number;
    available: number;
    isFull: boolean;
    members: PresenceState[];
  }>({
    current: 0,
    max: 5,
    available: 5,
    isFull: false,
    members: [],
  });

  const { members, capacity } = useRoomPresence(roomId);

  useEffect(() => {
    setCapacityInfo({
      current: capacity.current,
      max: capacity.max,
      available: capacity.available,
      isFull: capacity.isFull,
      members,
    });
  }, [members, capacity]);

  const canJoin = useMemo(() => {
    return !capacityInfo.isFull;
  }, [capacityInfo.isFull]);

  const capacityPercentage = useMemo(() => {
    return Math.round((capacityInfo.current / capacityInfo.max) * 100);
  }, [capacityInfo.current, capacityInfo.max]);

  const capacityStatus = useMemo(() => {
    if (capacityInfo.isFull) return 'full';
    if (capacityInfo.current >= capacityInfo.max * 0.8) return 'high';
    if (capacityInfo.current >= capacityInfo.max * 0.5) return 'medium';
    return 'low';
  }, [capacityInfo.current, capacityInfo.max, capacityInfo.isFull]);

  return {
    ...capacityInfo,
    canJoin,
    capacityPercentage,
    capacityStatus,
  };
}
```

## 成果物
- Supabase Presence統合サービス
- リアルタイム定員管理システム
- 入退室制御ロジック
- React統合Hooks

## 検証方法
### テストケース
1. **定員制限テスト**
   - 5人まで入室許可
   - 6人目の入室拒否
   - 退室後の入室再開

2. **リアルタイム更新**
   - 入退室の即座反映
   - Presence状態の同期

3. **レースコンディション**
   - 同時入室試行の処理
   - 定員超過時の適切な処理

## 技術的考慮事項
- **ネットワーク断絶**: 自動再接続機能
- **パフォーマンス**: 効率的なPresence更新
- **セキュリティ**: クライアント偽装対策

## 次のタスクへの準備
Presence・定員管理完了により、メッセージ・チャット機能実装準備完了