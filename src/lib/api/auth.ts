import { currentUser } from '../../mocks'
import type { User } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

type LoginRequest = {
  email: string
  password: string
}

type LoginResponse = {
  data: {
    accessToken: string
    refreshToken?: string
    userNo: number
    userName: string
  }
}

type SignupRequest = {
  email: string
  password: string
  nickname: string
  ageRange: string
  gender?: number
}

export async function login({ email, password }: LoginRequest): Promise<User> {
  if (MOCK.auth) {
    return currentUser
  }

  // 실제 경로: POST /auth/login
  const response = await client.post<LoginResponse>('/auth/login', {
    email,
    password,
  })
  localStorage.setItem('accessToken', response.data.accessToken)
  if (response.data.refreshToken) {
    localStorage.setItem('refreshToken', response.data.refreshToken)
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

  // 실제 경로: POST /users/signup
  await client.post('/users/signup', {
    email: request.email,
    password: request.password,
    userName: request.nickname,
    ageRange: request.ageRange,
    gender: request.gender,
  })
}

export async function loginWithKakao(kakaoAccessToken: string): Promise<User> {
  if (MOCK.auth) {
    return currentUser
  }

  // 실제 경로: POST /auth/kakao
  const response = await client.post<LoginResponse>('/auth/kakao', {
    kakaoAccessToken,
  })
  localStorage.setItem('accessToken', response.data.accessToken)
  if (response.data.refreshToken) {
    localStorage.setItem('refreshToken', response.data.refreshToken)
  }

  return {
    no: response.data.userNo,
    name: response.data.userName,
    email: `user-${response.data.userNo}@kakao.local`,
  }
}
