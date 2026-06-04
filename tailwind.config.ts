import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // STEP 1에서 거지방 디자인 토큰(core/theme)을 여기 채운다:
      //   colors: bg/canvas/text/accent/brown/sub/... , borderRadius, backgroundImage(골드 그라데이션) 등
    },
  },
  plugins: [],
} satisfies Config
