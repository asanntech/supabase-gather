# [06b_room_entry_modal] 01\_モーダルベース・ダイアログセットアップ

## 目標

shadcn/ui の Dialog コンポーネントを使用してルーム入室モーダルの基本構造を作成する

## 実装内容

### 1. shadcn/ui Dialog コンポーネントの追加

```bash
npx shadcn@latest add dialog
```

### 2. メインモーダルコンポーネント作成

**ファイル**: `src/features/room-entry/ui/room-entry-modal.tsx`

```typescript
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface RoomEntryModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function RoomEntryModal({ isOpen, onOpenChange }: RoomEntryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ルームに入る</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* プレースホルダー: 後のタスクで実装 */}
          <div>表示名設定エリア</div>
          <div>アバター選択エリア</div>
          <div>ルーム状態表示エリア</div>
          <div>アクションボタンエリア</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

### 3. 必要なディレクトリ構造作成

```
src/features/room-entry/
  ui/
    room-entry-modal.tsx
  hooks/
    (後のタスクで追加)
  types/
    (後のタスクで追加)
```

## 検証項目

- [ ] shadcn/ui Dialog が正常にインストールされている
- [ ] モーダルが開閉できる
- [ ] レスポンシブデザインが適用されている
- [ ] ESC キーでモーダルが閉じる
- [ ] オーバーレイクリックでモーダルが閉じる

## 関連ファイル

- `src/features/room-entry/ui/room-entry-modal.tsx`
- `components/ui/dialog.tsx` (shadcn/ui)

## 次のタスク

02_avatar_selector_component.md - アバターセレクターコンポーネントの実装
