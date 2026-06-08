import { members, room } from '../../mocks'
import type { Member, Room } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

type CreateRoomRequest = {
  roomName: string
  location?: string
  maxMemberCount: number
  isFriends: boolean
  tags: string[]
}

type UpdateRoomSettingsRequest = Partial<{
  name: string
  location: string
  tags: string[]
  maxMemberCount: number
}>

type ApiResponse<T> = {
  success: boolean
  data: T
  message: string
}

export async function getMyRooms(): Promise<Room[]> {
  if (MOCK.rooms) {
    return [room]
  }

  // 실제 경로: GET /rooms/my
  return client.getList<Room>('/rooms/my')
}

export async function createRoom(request: CreateRoomRequest): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, ...request, no: 1 } as any
  }

  // 실제 경로: POST /rooms
  const response = await client.post<ApiResponse<any>>('/rooms', request)
  const data = response.data

  return {
    ...data,
    no: data.roomNo,
    name: data.roomName,
    code: data.roomCode,
  }
}

export async function getRoom(no: number): Promise<Room> {
  // 🎯 1. [테스트 스위치 강제 패스] 백엔드와 무조건 연동되도록 MOCK 조건이 켜져 있어도 아래 실제 통신으로 흐르게 만듭니다!
  // (나중에 mockMode.ts 파일에서 MOCK.rooms = false 로 아예 꺼버리셔도 됩니다!)
  if (false && MOCK.rooms) {
    return { ...room, no }
  }

  try {
    // 실제 경로: GET /rooms/{no}
    const response = await client.get<ApiResponse<any>>(`/rooms/${no}`)

    // 백엔드 에러가 나서 response나 response.data가 없을 때를 대비한 촘촘한 방어벽!
    const data = response && response.data ? response.data : response

    if (!data) {
      throw new Error('백엔드 알맹이 데이터가 비어있습니다.')
    }

    // 🎯 2. [가짜 명학역 데이터 유전자 제거]
    // ...room을 과감히 지우고 백엔드 자바(data)가 준 진짜 순수 알맹이만 꺼내서 조립합니다!
    return {
      no: data.roomNo || data.no || no,
      name: data.roomName || data.name || '이름 없는 거지방',
      code: data.roomCode || data.code || '',
      ownerNo: data.ownerUserNo || data.ownerNo || 0,
      location: data.location || '',
      maxMemberCount: data.maxMemberCount || 4,
      memberCount: data.mvemberCount || 1,
      tags: data.tags || [],
    } as any

  } catch (error) {
    console.error(`🔥 getRoom(${no}) 호출 도중 치명적 에러 캐치:`, error)
    
    // 백엔드가 진짜 자빠졌을 때만 작동하는 비상 대피소 (최소한 주머니 데이터라도 엮이게 처리)
    return {
      no,
      name: localStorage.getItem('recentRoomName') || '새로운 거지방',
      code: localStorage.getItem('recentRoomCode') || 'SsWgDgaQt1FC',
      maxMemberCount: Number(localStorage.getItem('recentMaxMember')) || 4,
      ownerNo: 0,
      location: '',
      tags: [],
      memberCount: 1,
    }
  }
}

export async function updateRoomSettings(
  no: number,
  request: UpdateRoomSettingsRequest,
): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, ...request }
  }

  // 실제 경로: PATCH /rooms/{no}/settings
  return client.patch<Room>(`/rooms/${no}/settings`, request)
}

export async function joinRoom(code: string): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, code }
  }

  // 실제 경로: POST /rooms/join
  const response = await client.post<ApiResponse<any>>('/rooms/join', { code })
  const data = response.data

  return {
    ...data,
    no: data.roomNo,
    name: data.roomName,
    code: data.roomCode,
  }
}

export async function getRoomMembers(no: number): Promise<Member[]> {
  if (MOCK.rooms) {
    return members
  }

  // 실제 경로: GET /rooms/{no}/members
  const response = await client.get<ApiResponse<Member[]>>(`/rooms/${no}/members`)
  return response.data
}

export async function startBudgetInput(no: number): Promise<void> {
  if (MOCK.rooms) {
    return
  }

  // 실제 경로: POST /rooms/{no}/budget/start
  await client.post(`/rooms/${no}/budget/start`, {})
}

/**
 * 방의 예산 정보를 조회합니다.
 * (백엔드에서 Authorization 헤더가 필수인 API입니다.)
 */
export async function getMyBudget(no: number): Promise<any> {
  if (MOCK.rooms) {
    return { totalBudget: 0 }
  }

  const response = await client.get<ApiResponse<any>>(`/rooms/${no}/budget`)
  return response.data
}
