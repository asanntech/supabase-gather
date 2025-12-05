'use client'

import React from 'react'
import { LoginForm } from '@/features/auth/ui/login-form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/card'
import { Users, MessageSquare, MapPin, Zap } from 'lucide-react'

/**
 * ランディングページコンポーネント
 */
export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Supabase Gather
            </h1>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                機能
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900">
                概要
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 左側：説明 */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              バーチャルオフィスで
              <br />
              新しい働き方を
            </h2>
            <p className="text-xl text-gray-600">
              リアルタイムで繋がる2D空間。
              チームメンバーと自然なコミュニケーションを実現します。
            </p>

            {/* 機能ハイライト */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">最大5人まで同時接続</span>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">リアルタイムチャット</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">2D空間での移動</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">即座に利用開始</span>
              </div>
            </div>
          </div>

          {/* 右側：ログインフォーム */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>さあ、始めましょう</CardTitle>
                <CardDescription>
                  Googleアカウントまたはゲストとして入室できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 機能セクション */}
      <section id="features" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">主な機能</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>リアルタイムプレゼンス</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  誰がオンラインで、どこにいるのかが一目でわかります。
                  チームの状況を瞬時に把握できます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>2D空間での交流</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  アバターを動かして近づくことで、
                  自然な会話のきっかけが生まれます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>統合チャット</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  テキストチャットで素早くコミュニケーション。
                  会話の履歴も確認できます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Supabase Gather. Built with Next.js and Supabase.
          </p>
        </div>
      </footer>
    </div>
  )
}
