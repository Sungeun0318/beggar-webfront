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
  if (MOCK.rooms) {
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

    return {
      ...room, // 기본 목 데이터로 필드 채워두기 (ownerNo, location, tags 등)
      ...data,
      no: data.roomNo || no,
      name: data.roomName || data.name || '로딩 실패방',
      code: data.roomCode || data.code || '',
    }
  } catch (error) {
    console.error(`🔥 getRoom(${no}) 호출 도중 치명적 에러 캐치:`, error)
    // 튕기지 않게 최소한의 가짜 데이터 그릇이라도 리턴해서 화면을 살려둡니다!
    return {
      ...room,
      no,
      name: '예산 확정 정산 중...',
      code: '',
      maxMemberCount: 4,
    } as any
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

  // ���� ���: POST /rooms/{no}/budget/start
  await client.post(/rooms//budget/start)
}
