# [05_rooms] 01\_ルームドメイン・基盤設計

## 概要

ルーム機能のDDD/Clean Architectureベースでの基盤を設計し、MVP（1ルーム固定）から将来拡張まで対応可能な構造を構築する。

## 前提条件

- データベーススキーマ（roomsテーブル）が作成済み
- 認証システムが実装済み
- ルーティング基盤が実装済み

## 実装対象

### 1. ルームドメインモデル

ルーム機能に関するエンティティ・値オブジェクト

### 2. ルームRepository・サービス

データアクセス・ビジネスロジック層

### 3. MVP制約の実装

1ルーム固定制約を持つ設計

## 詳細仕様

### ルームドメインエンティティ

```typescript
// src/features/rooms/domain/entities/Room.ts
export interface Room {
  id: string
  name: string
  description: string | null
  maxCapacity: number
  currentCapacity: number
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

export interface RoomMember {
  id: string
  roomId: string
  userId: string | null // ゲストの場合はnull
  clientId: string
  userType: 'google' | 'guest'
  displayName: string
  avatarType: string
  joinedAt: Date
  lastActiveAt: Date
}

export interface RoomCapacity {
  roomId: string
  current: number
  max: number
  available: number
  isFull: boolean
}
```

### 値オブジェクト

```typescript
// src/features/rooms/domain/value-objects/RoomId.ts
export class RoomId {
  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error(`Invalid room ID: ${value}`)
    }
  }

  static create(value: string): RoomId {
    return new RoomId(value)
  }

  static createMainRoom(): RoomId {
    return new RoomId('main-room')
  }

  getValue(): string {
    return this.value
  }

  isMainRoom(): boolean {
    return this.value === 'main-room'
  }

  equals(other: RoomId): boolean {
    return this.value === other.value
  }

  private isValid(value: string): boolean {
    // MVP: main-roomのみ許可
    if (value === 'main-room') return true

    // 将来: UUID形式 or 英数字+ハイフン（3-50文字）
    const pattern = /^[a-zA-Z0-9-_]{3,50}$/
    return pattern.test(value)
  }
}

// src/features/rooms/domain/value-objects/RoomCapacityLimit.ts
export class RoomCapacityLimit {
  static readonly DEFAULT_MAX_CAPACITY = 5
  static readonly MIN_CAPACITY = 1
  static readonly MAX_CAPACITY = 100

  constructor(private readonly value: number) {
    if (
      value < RoomCapacityLimit.MIN_CAPACITY ||
      value > RoomCapacityLimit.MAX_CAPACITY
    ) {
      throw new Error(
        `Invalid capacity: ${value}. Must be between ${RoomCapacityLimit.MIN_CAPACITY} and ${RoomCapacityLimit.MAX_CAPACITY}`
      )
    }
  }

  static createDefault(): RoomCapacityLimit {
    return new RoomCapacityLimit(this.DEFAULT_MAX_CAPACITY)
  }

  getValue(): number {
    return this.value
  }

  canAccommodate(currentCount: number): boolean {
    return currentCount < this.value
  }

  getRemainingCapacity(currentCount: number): number {
    return Math.max(0, this.value - currentCount)
  }
}
```

### Repository Interfaces

```typescript
// src/features/rooms/domain/repositories/RoomRepository.ts
export interface RoomRepository {
  findById(roomId: RoomId): Promise<Room | null>
  findMainRoom(): Promise<Room>
  update(room: Room): Promise<Room>
  // 将来拡張用
  findAll(): Promise<Room[]>
  create(room: Omit<Room, 'id' | 'createdAt'>): Promise<Room>
  delete(roomId: RoomId): Promise<void>
}

// src/features/rooms/domain/repositories/RoomMemberRepository.ts
export interface RoomMemberRepository {
  findByRoomId(roomId: RoomId): Promise<RoomMember[]>
  findByClientId(clientId: string): Promise<RoomMember | null>
  add(member: RoomMember): Promise<void>
  remove(clientId: string): Promise<void>
  updateLastActive(clientId: string): Promise<void>
  countByRoomId(roomId: RoomId): Promise<number>
}
```

### ドメインサービス

```typescript
// src/features/rooms/domain/services/RoomCapacityService.ts
export class RoomCapacityService {
  constructor(private memberRepository: RoomMemberRepository) {}

  async getCurrentCapacity(roomId: RoomId): Promise<RoomCapacity> {
    const currentCount = await this.memberRepository.countByRoomId(roomId)
    const maxCapacity = RoomCapacityLimit.DEFAULT_MAX_CAPACITY // MVP固定値

    return {
      roomId: roomId.getValue(),
      current: currentCount,
      max: maxCapacity,
      available: Math.max(0, maxCapacity - currentCount),
      isFull: currentCount >= maxCapacity,
    }
  }

  async canJoinRoom(roomId: RoomId): Promise<boolean> {
    const capacity = await this.getCurrentCapacity(roomId)
    return !capacity.isFull
  }

  async validateJoinAttempt(
    roomId: RoomId
  ): Promise<{ canJoin: boolean; reason?: string }> {
    const canJoin = await this.canJoinRoom(roomId)

    if (!canJoin) {
      return {
        canJoin: false,
        reason: 'ルームが満員です',
      }
    }

    return { canJoin: true }
  }
}

// src/features/rooms/domain/services/RoomValidationService.ts
export class RoomValidationService {
  constructor(private roomRepository: RoomRepository) {}

  async validateRoomAccess(
    roomId: RoomId,
    userId?: string
  ): Promise<{
    isValid: boolean
    room?: Room
    error?: string
  }> {
    try {
      const room = await this.roomRepository.findById(roomId)

      if (!room) {
        return {
          isValid: false,
          error: 'ルームが見つかりません',
        }
      }

      if (!room.isActive) {
        return {
          isValid: false,
          room,
          error: 'ルームは現在利用できません',
        }
      }

      // MVP段階: アクセス制限なし
      // 将来: プライベートルームのアクセス制御など

      return {
        isValid: true,
        room,
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'ルーム情報の取得に失敗しました',
      }
    }
  }
}
```

### ユースケース（基本）

```typescript
// src/features/rooms/application/use-cases/GetMainRoomUseCase.ts
export class GetMainRoomUseCase {
  constructor(
    private roomRepository: RoomRepository,
    private capacityService: RoomCapacityService
  ) {}

  async execute(): Promise<{
    room: Room
    capacity: RoomCapacity
  }> {
    const room = await this.roomRepository.findMainRoom()
    const capacity = await this.capacityService.getCurrentCapacity(
      RoomId.createMainRoom()
    )

    return { room, capacity }
  }
}

// src/features/rooms/application/use-cases/ValidateRoomJoinUseCase.ts
export class ValidateRoomJoinUseCase {
  constructor(
    private validationService: RoomValidationService,
    private capacityService: RoomCapacityService
  ) {}

  async execute(
    roomId: string,
    userId?: string
  ): Promise<{
    canJoin: boolean
    room?: Room
    capacity?: RoomCapacity
    error?: string
  }> {
    const roomIdObj = RoomId.create(roomId)

    // 1. ルームの妥当性確認
    const validation = await this.validationService.validateRoomAccess(
      roomIdObj,
      userId
    )

    if (!validation.isValid) {
      return {
        canJoin: false,
        room: validation.room,
        error: validation.error,
      }
    }

    // 2. 定員確認
    const joinValidation =
      await this.capacityService.validateJoinAttempt(roomIdObj)
    const capacity = await this.capacityService.getCurrentCapacity(roomIdObj)

    return {
      canJoin: joinValidation.canJoin,
      room: validation.room,
      capacity,
      error: joinValidation.reason,
    }
  }
}
```

### MVP制約の実装

```typescript
// src/features/rooms/domain/constants/RoomConstants.ts
export const ROOM_CONSTANTS = {
  // MVP段階
  MAIN_ROOM_ID: 'main-room',
  DEFAULT_MAX_CAPACITY: 5,

  // 将来拡張用の予約値
  ROOM_TYPES: {
    PUBLIC: 'public',
    PRIVATE: 'private',
  } as const,

  CAPACITY_LIMITS: {
    MIN: 1,
    MAX: 100,
    DEFAULT: 5,
  } as const,
} as const

// src/features/rooms/application/services/MVPRoomService.ts
export class MVPRoomService {
  constructor(
    private roomRepository: RoomRepository,
    private capacityService: RoomCapacityService
  ) {}

  // MVP段階: main-roomの固定取得
  async getAvailableRoom(): Promise<Room> {
    return await this.roomRepository.findMainRoom()
  }

  // MVP段階: ルーム選択機能なし（固定）
  async getDefaultRoomId(): string {
    return ROOM_CONSTANTS.MAIN_ROOM_ID
  }

  // MVP段階: シンプルな入室可否判定
  async canUserJoinDefaultRoom(): Promise<boolean> {
    const roomId = RoomId.createMainRoom()
    return await this.capacityService.canJoinRoom(roomId)
  }
}
```

## 成果物

- ルームドメインエンティティ・値オブジェクト
- Repository インターフェース
- ドメインサービス（容量制限・検証）
- 基本ユースケース
- MVP制約の実装

## 検証方法

- ドメインロジックの単体テスト
- Repository インターフェースの動作確認
- ユースケース統合テスト

## 設計のポイント

- **MVP制約**: main-room固定だが拡張可能な設計
- **ドメイン駆動**: ビジネスルールをドメイン層に集約
- **型安全性**: TypeScriptによる厳密な型定義
- **将来拡張性**: マルチルーム対応を想定した構造

## 次のタスクへの準備

ルームドメイン基盤完了により、Presence統合実装準備完了
