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

/**
 * 내가 참여 중인 방 목록을 조회합니다.
 * (백엔드: GET /rooms/my)
 */
export async function findMyRooms(): Promise<Room[]> {
  if (MOCK.rooms) {
    return [room]
  }

  // client.ts의 request 함수가 localStorage에서 accessToken을 꺼내 
  // Authorization 헤더에 Bearer 토큰을 자동으로 실어줍니다.
  const response = await client.get<ApiResponse<any[]>>('/rooms/my')
  const data = response.data || []

  return data.map((item: any) => ({
    no: item.roomNo || item.no,
    name: item.roomName || item.name || '이름 없는 거지방',
    code: item.roomCode || item.code || '',
    ownerNo: item.ownerUserNo || item.ownerNo || 0,
    location: item.location || '',
    maxMemberCount: item.maxMemberCount || 4,
    memberCount: item.memberCount || item.mvemberCount || 1,
    tags: item.tags || [],
    status: item.roomStatus || item.status || 'ACTIVE',
    // 백엔드 응답에 포함될 수 있는 추가 필드들
    budget: item.totalBudget || item.budget || 0,
    spent: item.spentAmount || item.spent || 0,
  })) as Room[]
}

/**
 * 방 검색 API를 호출합니다.
 * (백엔드: GET /rooms/search?keyword=...)
 */
export async function searchRooms(keyword: string): Promise<Room[]> {
  if (MOCK.rooms) {
    return [room].filter(r => r.name.includes(keyword) || r.location.includes(keyword))
  }

  const response = await client.get<ApiResponse<any[]>>(`/rooms/search?keyword=${encodeURIComponent(keyword)}`)
  const data = response.data || []

  return data.map((item: any) => ({
    no: item.roomNo || item.no,
    name: item.roomName || item.name || '이름 없는 거지방',
    code: item.roomCode || item.code || '',
    ownerNo: item.ownerUserNo || item.ownerNo || 0,
    location: item.location || '',
    maxMemberCount: item.maxMemberCount || 4,
    memberCount: item.memberCount || item.mvemberCount || 1,
    tags: item.tags || [],
    status: item.roomStatus || item.status || 'ACTIVE',
    budget: item.totalBudget || item.budget || 0,
    spent: item.spentAmount || item.spent || 0,
  })) as Room[]
}

export async function closeRoom(no: number): Promise<void> {
  if (MOCK.rooms) {
    return
  }
  // 실제 경로: POST /rooms/{no}/close
  await client.post(`/rooms/${no}/close`, {})
}

export async function createRoom(request: CreateRoomRequest): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, ...request, no: 1 } as any
  }

  // 실제 경로: POST /rooms
  const response = await client.post<ApiResponse<any>>('/rooms', request)
  const data = response.data || {}

  return {
    ...data,
    no: data.roomNo || data.no,
    name: data.roomName || data.name,
    code: data.roomCode || data.code,
  } as any
}

export async function deleteRoom(no: number): Promise<void> {
  if (MOCK.rooms) {
    return
  }
  // 실제 경로: DELETE /rooms/{no}
  await client.del(`/rooms/${no}`)
}

export async function getRoom(no: number): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, no }
  }

  try {
    // 실제 경로: GET /rooms/{no}
    const response = await client.get<ApiResponse<any>>(`/rooms/${no}`)
    const data = response.data

    if (!data) {
      throw new Error('백엔드 데이터가 비어있습니다.')
    }

    return {
      no: data.roomNo || data.no || no,
      name: data.roomName || data.name || '이름 없는 거지방',
      code: data.roomCode || data.code || '',
      ownerNo: data.ownerUserNo || data.ownerNo || 0,
      location: data.location || '',
      maxMemberCount: data.maxMemberCount || 4,
      memberCount: data.memberCount || data.mvemberCount || 1,
      tags: data.tags || [],
      status: data.roomStatus || data.status || 'ACTIVE',
    } as any

  } catch (error) {
    console.error(`🔥 getRoom(${no}) 호출 도중 에러:`, error)
    throw error
  }
}

export async function updateRoomSettings(
  no: number,
  request: UpdateRoomSettingsRequest,
): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, ...request } as any
  }

  // 실제 경로: PATCH /rooms/{no}/settings
  const response = await client.patch<ApiResponse<any>>(`/rooms/${no}/settings`, request)
  const data = response.data || {}

  return {
    ...data,
    no: data.roomNo || data.no || no,
    name: data.roomName || data.name,
    code: data.roomCode || data.code,
  } as any
}

export async function joinRoom(code: string): Promise<Room> {
  if (MOCK.rooms) {
    return { ...room, code }
  }

  // 실제 경로: POST /rooms/join
  const response = await client.post<ApiResponse<any>>('/rooms/join', { code })
  const data = response.data || {}

  return {
    ...data,
    no: data.roomNo || data.no,
    name: data.roomName || data.name,
    code: data.roomCode || data.code,
  } as any
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
