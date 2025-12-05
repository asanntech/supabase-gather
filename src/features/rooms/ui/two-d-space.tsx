'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { AppUser } from '@/features/auth/domain/types'
import { RoomMember } from '../domain/types'
import { UserAvatar } from '@/features/auth/ui/user-avatar'
import { Card } from '@/shared/ui/card'

interface Position {
  x: number
  y: number
}

interface TwoDSpaceProps {
  currentUser: AppUser
  members: RoomMember[]
}

/**
 * 2Dスペースコンポーネント
 * ユーザーがアバターを操作して移動できる空間
 */
export function TwoDSpace({ currentUser, members }: TwoDSpaceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [userPosition, setUserPosition] = useState<Position>({ x: 50, y: 50 })
  const [targetPosition, setTargetPosition] = useState<Position | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  // TODO: 実際のアプリでは位置情報をSupabaseのプレゼンスで同期
  const [memberPositions, setMemberPositions] = useState<
    Record<string, Position>
  >({})

  // クリックで移動
  const handleSpaceClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      setTargetPosition({ x, y })
      setIsMoving(true)
    },
    []
  )

  // スムーズな移動アニメーション
  useEffect(() => {
    if (!targetPosition || !isMoving) return

    const animationFrame = requestAnimationFrame(() => {
      setUserPosition(current => {
        const dx = targetPosition.x - current.x
        const dy = targetPosition.y - current.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 1) {
          setIsMoving(false)
          setTargetPosition(null)
          return targetPosition
        }

        const speed = 0.1
        return {
          x: current.x + dx * speed,
          y: current.y + dy * speed,
        }
      })
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [targetPosition, userPosition, isMoving])

  // キーボード移動
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 5
      const newPosition = { ...userPosition }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          newPosition.y = Math.max(0, userPosition.y - step)
          break
        case 'ArrowDown':
        case 's':
          newPosition.y = Math.min(100, userPosition.y + step)
          break
        case 'ArrowLeft':
        case 'a':
          newPosition.x = Math.max(0, userPosition.x - step)
          break
        case 'ArrowRight':
        case 'd':
          newPosition.x = Math.min(100, userPosition.x + step)
          break
        default:
          return
      }

      e.preventDefault()
      setUserPosition(newPosition)
      setTargetPosition(null)
      setIsMoving(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [userPosition])

  // メンバーの初期位置をランダムに設定
  useEffect(() => {
    const positions: Record<string, Position> = {}
    members.forEach((member, index) => {
      if (member.userId !== currentUser.id) {
        positions[member.userId] = {
          x: 20 + ((index * 20) % 60),
          y: 20 + Math.floor(index / 3) * 20,
        }
      }
    })
    setMemberPositions(positions)
  }, [members, currentUser.id])

  return (
    <Card className="h-full relative overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full relative cursor-pointer bg-gradient-to-br from-blue-50 to-green-50"
        onClick={handleSpaceClick}
        style={{ minHeight: '500px' }}
      >
        {/* グリッドパターン */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 0, 0, 0.05) 25%, rgba(0, 0, 0, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 0, 0, 0.05) 75%, rgba(0, 0, 0, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* 移動先インジケーター */}
        {targetPosition && isMoving && (
          <div
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${targetPosition.x}%`,
              top: `${targetPosition.y}%`,
            }}
          >
            <div className="w-full h-full rounded-full bg-blue-400 opacity-50 animate-ping" />
          </div>
        )}

        {/* 他のメンバーのアバター */}
        {members.map(member => {
          if (member.userId === currentUser.id) return null
          const position = memberPositions[member.userId] || { x: 50, y: 50 }

          return (
            <div
              key={member.userId}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
              }}
            >
              <div className="flex flex-col items-center space-y-1">
                <UserAvatar user={member.user} size="md" />
                <span className="text-xs bg-black/75 text-white px-2 py-0.5 rounded">
                  {member.user.name}
                </span>
              </div>
            </div>
          )
        })}

        {/* 自分のアバター */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-100"
          style={{
            left: `${userPosition.x}%`,
            top: `${userPosition.y}%`,
          }}
        >
          <div className="flex flex-col items-center space-y-1">
            <div className="relative">
              <UserAvatar user={currentUser} size="md" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
              {currentUser.name} (You)
            </span>
          </div>
        </div>

        {/* 操作説明 */}
        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded-lg p-3 text-xs">
          <p className="font-semibold mb-1">操作方法</p>
          <p>• クリック: 移動</p>
          <p>• キーボード: WASD or 矢印キー</p>
        </div>
      </div>
    </Card>
  )
}
