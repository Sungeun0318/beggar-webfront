type KakaoAuthResponse = {
  access_token?: string
}

type KakaoSdk = {
  isInitialized: () => boolean
  init: (appKey: string) => void
  Auth: {
    login: (options: {
      success: (auth: KakaoAuthResponse) => void
      fail: (error: unknown) => void
    }) => void
  }
}

declare global {
  interface Window {
    Kakao?: KakaoSdk
  }
}

const kakaoSdkUrl = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js'
let sdkPromise: Promise<KakaoSdk> | null = null

function loadKakaoSdk() {
  if (window.Kakao) {
    return Promise.resolve(window.Kakao)
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

export async function getKakaoAccessToken() {
  const appKey = import.meta.env.VITE_KAKAO_JS_KEY

  if (!appKey) {
    throw new Error('VITE_KAKAO_JS_KEY가 설정되지 않았어요.')
  }

  const kakao = await loadKakaoSdk()

  if (!kakao.isInitialized()) {
    kakao.init(appKey)
  }

  return new Promise<string>((resolve, reject) => {
    kakao.Auth.login({
      success: (auth) => {
        if (auth.access_token) {
          resolve(auth.access_token)
          return
        }

        reject(new Error('카카오 access token을 받지 못했어요.'))
      },
      fail: reject,
    })
  })
}
