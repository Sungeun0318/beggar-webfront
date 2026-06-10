import { currentUser } from "../../mocks"
import type { User } from "../../types"
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
  ageRange: string
  gender?: number
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
}

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

function fromUserResponse(response: UserResponse): User {
  return {
    no: response.userNo,
    name: response.userName,
    email: response.email,
    profileImageUrl: response.profileImageUrl ?? undefined,
  }
}

function localUser(): User {
  return {
    no: Number(localStorage.getItem("userNo")) || currentUser.no,
    name: localStorage.getItem("userName") || currentUser.name,
    email: localStorage.getItem("userEmail") || currentUser.email,
    profileImageUrl:
      localStorage.getItem("profileImageUrl") ||
      currentUser.profileImageUrl ||
      undefined,
  }
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
    ageRange: request.ageRange,
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

  return user
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
    profileImageUrl: user.profileImageUrl ?? null,
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
): Promise<User> {
  if (MOCK.auth) {
    return currentUser
  }

  const response = await client.post<ApiResponse<LoginData>>("/auth/kakao/code", {
    code,
    redirectUri,
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
