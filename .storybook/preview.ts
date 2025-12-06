import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css' // Tailwind CSSを適用

const preview: Preview = {
  parameters: {
    // Controlsアドオンの自動マッチング
    controls: {
      matchers: {
        color: /(background|color)$/i, // colorを含むpropsにカラーピッカー
        date: /Date$/i, // Dateを含むpropsに日付ピッカー
      },
    },
    // Next.js App Router設定
    nextjs: {
      appDirectory: true,
    },
    // レイアウト設定
    layout: 'padded', // centered, fullscreen, paddedから選択
    // アクセシビリティ設定
    a11y: {
      test: 'todo', // violations を警告として表示
    },
  },
}

export default preview
