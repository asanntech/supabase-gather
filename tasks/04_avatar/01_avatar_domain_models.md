# 01. アバタードメインモデル設計

## 目的
アバターシステムのドメイン層とビジネスロジックを定義する

## 実装内容

### 1. アバタータイプの定義
- `src/features/avatar/domain/types.ts` を作成
- アバターカラー列挙型を定義：
  ```typescript
  export type AvatarColor = 'blue' | 'purple' | 'cyan' | 'indigo' | 'green'
  ```

### 2. アバターエンティティ
- `src/features/avatar/domain/entities/Avatar.ts` を作成
- アバターの基本プロパティと振る舞いを定義
- バリデーション機能を含む

### 3. アバター値オブジェクト
- `src/features/avatar/domain/value-objects/AvatarType.ts` を作成
- アバタータイプの不変性を保証

### 4. アバタードメインサービス
- `src/features/avatar/domain/services/AvatarService.ts` を作成
- アバター画像パス生成ロジック
- アバター選択可能性の判定

## 成果物
- アバタータイプの型安全性確保
- ドメインロジックの集約
- 他レイヤーからの依存関係明確化

## 依存関係
- なし（純粋なドメインレイヤー）

## 次のタスク
- アバターアセットセットアップ（02_avatar_assets_setup.md）