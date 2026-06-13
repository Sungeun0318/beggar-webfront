import type { BeggarScore, RankingEntry } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

const mockScore: BeggarScore = {
  roomNo: 1,
  score: 82,
  title: '전설의 거지',
  totalSpentAmount: 42000,
  totalSavedAmount: 18000,
  goodPriceVerifiedCount: 3,
  budgetComplianceRate: 92,
  avgSavingsRatio: 18,
  lastCalculatedAt: new Date().toISOString(),
}

export async function getBeggarScore(roomNo: number): Promise<BeggarScore> {
  if (MOCK.rooms) {
    return { ...mockScore, roomNo }
  }

  const response = await client.get<ApiResponse<BeggarScore>>(
    `/rooms/${roomNo}/beggar-score`,
  )
  return response.data
}

export async function getRanking(limit = 15): Promise<RankingEntry[]> {
  if (MOCK.rooms) {
    return Array.from({ length: limit }, (_, index) => ({
      rank: index + 1,
      roomNo: index + 1,
      roomName: index < 3 ? '박진감' : '거지가 아닙니다',
      score: Math.max(0, 95 - index * 4),
      title: index < 3 ? '전설의 거지' : '프로 거지',
    }))
  }

  const response = await client.get<ApiResponse<RankingEntry[]>>('/ranking', {
    limit,
  })
  return response.data
}
