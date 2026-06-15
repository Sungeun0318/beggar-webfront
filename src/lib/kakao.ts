type KakaoSdk = {
  isInitialized: () => boolean
  init: (appKey: string) => void
  Auth: {
    authorize: (options: { redirectUri: string; scope?: string }) => void
  }
  Share: {
    sendDefault: (options: any) => void
  }
}

declare global {
  interface Window {
    Kakao?: KakaoSdk
  }
}

const kakaoSdkUrl = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js'
let sdkPromise: Promise<KakaoSdk> | null = null

async function loadKakaoSdk() {
  if (window.Kakao) {
    return window.Kakao
  }

  if (sdkPromise) {
    return sdkPromise
  }

  sdkPromise = new Promise<KakaoSdk>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = kakaoSdkUrl
    script.async = true
    script.onload = () => {
      if (window.Kakao) {
        resolve(window.Kakao)
        return
      }

      reject(new Error('카카오 SDK를 불러오지 못했어요.'))
    }
    script.onerror = () => reject(new Error('카카오 SDK 로드에 실패했어요.'))
    document.head.appendChild(script)
  })

  return sdkPromise
}

async function ensureKakaoInitialized() {
  const appKey = import.meta.env.VITE_KAKAO_JS_KEY

  if (!appKey) {
    throw new Error('VITE_KAKAO_JS_KEY가 설정되지 않았어요.')
  }

  const kakao = await loadKakaoSdk()

  if (!kakao.isInitialized()) {
    kakao.init(appKey)
  }

  return kakao
}

export function getKakaoRedirectUri() {
  return `${window.location.origin}/`
}

export function consumeKakaoCode() {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')

  if (code) {
    window.history.replaceState({}, document.title, window.location.pathname)
  }

  return code
}

export async function authorizeWithKakao() {
  const kakao = await ensureKakaoInitialized()

  kakao.Auth.authorize({
    redirectUri: getKakaoRedirectUri(),
    scope: 'profile_nickname',
  })
}

/**
 * 카카오톡 초대 공유 (Feed 타입)
 */
export async function shareRoomInvitation({
  roomName,
  roomCode,
  inviteUrl,
}: {
  roomName: string
  roomCode: string
  inviteUrl?: string
}) {
  const kakao = await ensureKakaoInitialized()

  const nextInviteUrl = inviteUrl || `${window.location.origin}/join/${roomCode}`

  kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title: '💸 거지 우정 수호대 초대장',
      description: `[${roomName}] 방에 초대받았습니다! 같이 절약하며 우정을 지켜봐요.`,
      imageUrl:
        'https://raw.githubusercontent.com/f-lab-edu/beggar-webfront/main/public/assets/images/figma/mascot_celebration.png',
      link: {
        mobileWebUrl: nextInviteUrl,
        webUrl: nextInviteUrl,
      },
    },
    buttons: [
      {
        title: '방 참여하기',
        link: {
          mobileWebUrl: nextInviteUrl,
          webUrl: nextInviteUrl,
        },
      },
    ],
  })
}
