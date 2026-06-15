import { currentUser } from "../../mocks"
import type { User, UserTitle, UserTitleManagement } from "../../types"
import { client } from "./client"
import { MOCK } from "./mockMode"

type LoginRequest = {
  email: string
  password: string
}

type SignupRequest = {
  email: string
  password: string
  nickname: string
  age: number
  gender?: number
}

type KakaoLoginProfileRequest = {
  email: string
  gender: number
  age: number
}

type LoginData = {
  accessToken: string
  refreshToken?: string
  userNo: number
  userName: string
  email?: string
  profileImageUrl?: string | null
}

type UserResponse = {
  userNo: number
  userName: string
  email: string
  profileImageUrl?: string | null
  role?: string
  gender?: number | null
  ageRange?: string | null
  score?: number | string | null
  beggarScore?: number | string | null
  userScore?: number | string | null
  title?: string | null
  beggarTitle?: string | null
  currentTitle?: string | null
}

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

const defaultTitles: UserTitle[] = [
  {
    id: "baby",
    title: "아기 거지",
    description: "거지력 관리를 막 시작했어요",
    minScore: 0,
    maxScore: 19,
    scoreRange: "0-19점",
    unlocked: true,
    selected: false,
  },
  {
    id: "growing",
    title: "성장하는 거지",
    description: "예산 습관이 자라고 있어요",
    minScore: 20,
    maxScore: 39,
    scoreRange: "20-39점",
    unlocked: false,
    selected: false,
  },
  {
    id: "smart",
    title: "알뜰한 거지",
    description: "지출과 절약의 균형을 잡았어요",
    minScore: 40,
    maxScore: 59,
    scoreRange: "40-59점",
    unlocked: false,
    selected: false,
  },
  {
    id: "pro",
    title: "프로 거지",
    description: "착한가격업소와 예산을 잘 활용해요",
    minScore: 60,
    maxScore: 79,
    scoreRange: "60-79점",
    unlocked: false,
    selected: false,
  },
  {
    id: "legend",
    title: "전설의 거지",
    description: "친구들의 예산 수호자예요",
    minScore: 80,
    maxScore: 100,
    scoreRange: "80-100점",
    unlocked: false,
    selected: false,
  },
]

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function fromUserResponse(response: UserResponse): User {
  const score =
    toNumber(response.score) ??
    toNumber(response.beggarScore) ??
    toNumber(response.userScore)

  return {
    no: response.userNo,
    name: response.userName,
    email: response.email,
    profileImageUrl: response.profileImageUrl ?? undefined,
    score,
    title: response.title ?? response.beggarTitle ?? response.currentTitle ?? undefined,
  }
}

function resolveTitleByScore(score: number) {
  return (
    defaultTitles.find((item) => score >= item.minScore && score <= item.maxScore) ??
    defaultTitles[defaultTitles.length - 1]
  )
}

export function buildTitleManagement(user: User): UserTitleManagement {
  const score = user.score ?? 0
  const scoreTitle = resolveTitleByScore(score)
  const currentTitle = user.title || scoreTitle.title
  const titles = defaultTitles.map((item) => ({
    ...item,
    unlocked: score >= item.minScore,
    selected: item.title === currentTitle || item.id === scoreTitle.id,
  }))

  if (!titles.some((item) => item.selected)) {
    const fallback = [...titles].reverse().find((item) => item.unlocked) ?? titles[0]
    return {
      currentTitle: fallback.title,
      selectedTitleId: fallback.id,
      score,
      titles: titles.map((item) => ({ ...item, selected: item.id === fallback.id })),
    }
  }

  const selected = titles.find((item) => item.selected)
  return {
    currentTitle: selected?.title ?? currentTitle,
    selectedTitleId: selected?.id,
    score,
    titles,
  }
}

function localUser(): User {
  const storedScore = toNumber(localStorage.getItem("userScore"))
  const storedTitle = localStorage.getItem("userTitle") || undefined

  return {
    no: Number(localStorage.getItem("userNo")) || currentUser.no,
    name: localStorage.getItem("userName") || currentUser.name,
    email: localStorage.getItem("userEmail") || currentUser.email,
    profileImageUrl:
      localStorage.getItem("profileImageUrl") ||
      currentUser.profileImageUrl ||
      undefined,
    score: storedScore ?? currentUser.score,
    title: storedTitle ?? currentUser.title,
  }
}

function clearStoredUser() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("userNo")
  localStorage.removeItem("userName")
  localStorage.removeItem("userEmail")
  localStorage.removeItem("profileImageUrl")
  localStorage.removeItem("userScore")
  localStorage.removeItem("userTitle")
}

export async function login({ email, password }: LoginRequest): Promise<User> {
  if (MOCK.auth) {
    return currentUser
  }

  const response = await client.post<ApiResponse<LoginData>>("/auth/login", {
    email,
    password,
  })
  
  console.log("Login Response:", response)

  if (response.data && response.data.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken)
    localStorage.setItem("userNo", response.data.userNo.toString())
    localStorage.setItem("userName", response.data.userName)
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken)
    }
  } else {
    console.error("Login failed: Access token not found in response", response)
  }

  return {
    no: response.data.userNo,
    name: response.data.userName,
    email,
  }
}

export async function signup(request: SignupRequest): Promise<void> {
  if (MOCK.auth) {
    return
  }

  await client.post("/users/signup", {
    email: request.email,
    password: request.password,
    userName: request.nickname,
    age: request.age,
    gender: request.gender,
  })
}

export async function getCurrentUser(): Promise<User> {
  if (MOCK.auth) {
    return localUser()
  }

  const response = await client.get<ApiResponse<UserResponse>>("/users/me")
  const user = fromUserResponse(response.data)
  localStorage.setItem("userNo", user.no.toString())
  localStorage.setItem("userName", user.name)
  localStorage.setItem("userEmail", user.email)
  if (user.profileImageUrl) {
    localStorage.setItem("profileImageUrl", user.profileImageUrl)
  } else {
    localStorage.removeItem("profileImageUrl")
  }
  if (user.score !== undefined) {
    localStorage.setItem("userScore", String(user.score))
  } else {
    localStorage.removeItem("userScore")
  }
  if (user.title) {
    localStorage.setItem("userTitle", user.title)
  } else {
    localStorage.removeItem("userTitle")
  }

  return user
}

export async function getTitleManagement(): Promise<UserTitleManagement> {
  const user = await getCurrentUser().catch(() => localUser())
  return buildTitleManagement(user)
}

export async function updateNickname(userName: string): Promise<User> {
  const nextUserName = userName.trim()
  const user = localUser()

  if (MOCK.auth) {
    localStorage.setItem("userName", nextUserName)
    return { ...user, name: nextUserName }
  }

  await client.patch<ApiResponse<void>>("/users/me", {
    userName: nextUserName,
  })

  return getCurrentUser()
}

export async function updateProfileImage(profileImageUrl: string): Promise<User> {
  const user = localUser()

  if (MOCK.auth) {
    localStorage.setItem("profileImageUrl", profileImageUrl)
    return { ...user, profileImageUrl }
  }

  await client.patch<ApiResponse<void>>("/users/me", {
    userName: user.name,
    profileImageUrl: profileImageUrl,
  })

  // 업데이트 후 서버에서 최신 정보를 다시 가져옵니다.
  return getCurrentUser()
}

export async function withdraw(): Promise<void> {
  if (MOCK.auth) {
    clearStoredUser()
    return
  }

  await client.del<ApiResponse<void>>("/users/me")
  clearStoredUser()
}

export async function uploadProfileImage(file: File): Promise<string> {
  if (MOCK.auth) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.readAsDataURL(file)
    })
  }

  const accessToken = localStorage.getItem("accessToken")
  if (!accessToken) {
    throw new Error("로그인이 필요합니다.")
  }

  // 한글 파일명 등으로 인한 500 에러 방지를 위해 파일명을 안전하게 변경합니다.
  const extension = file.name.split(".").pop() || "jpg"
  const safeFileName = `profile_${Date.now()}.${extension}`
  
  console.log("Presigned URL 요청 파일명:", safeFileName)

  // 백엔드 컨트롤러가 @GetMapping으로 선언되어 있으므로 client.get을 사용합니다.
  const response = await client.get<ApiResponse<string>>(
    "/users/me/presigned-url",
    { fileName: safeFileName },
  )

  const uploadUrl = response.data

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  })

  if (!uploadResponse.ok) {
    throw new Error("S3 업로드 실패")
  }

  // 백엔드에서 get 시점에 Presigned GET URL을 생성해주므로, DB에는 파일명(Key)만 저장합니다.
  const objectKey = decodeURIComponent(
    new URL(uploadUrl).pathname.split("/").filter(Boolean).pop() || safeFileName,
  )

  return objectKey
}

export async function loginWithKakaoCode(
  code: string,
  redirectUri: string,
  profile: KakaoLoginProfileRequest,
): Promise<User> {
  if (MOCK.auth) {
    return currentUser
  }

  const response = await client.post<ApiResponse<LoginData>>("/auth/kakao/code", {
    code,
    redirectUri,
    email: profile.email,
    gender: profile.gender,
    age: profile.age,
  })
  
  console.log("Kakao Login Response:", response)

  if (response.data && response.data.accessToken) {
    localStorage.setItem("accessToken", response.data.accessToken)
    localStorage.setItem("userNo", response.data.userNo.toString())
    localStorage.setItem("userName", response.data.userName)
    if (response.data.email) {
      localStorage.setItem("userEmail", response.data.email)
    }
    if (response.data.profileImageUrl) {
      localStorage.setItem("profileImageUrl", response.data.profileImageUrl)
    }
    if (response.data.refreshToken) {
      localStorage.setItem("refreshToken", response.data.refreshToken)
    }
  } else {
    console.error("Kakao Login failed: Access token not found in response", response)
  }

  const freshUser = await getCurrentUser().catch(() => null)
  if (freshUser) {
    return freshUser
  }

  return {
    no: response.data.userNo,
    name: response.data.userName,
    email: response.data.email ?? `user-${response.data.userNo}@kakao.local`,
    profileImageUrl: response.data.profileImageUrl ?? undefined,
  }
}
