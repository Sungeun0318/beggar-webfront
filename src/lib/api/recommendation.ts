import type { RecommendationResult } from '../../types'
import { client } from './client'
import { USE_MOCK } from './mockMode'

type RecommendParams = {
  tag?: string
  region?: string
  lat?: number
  lng?: number
  radius?: number
}

export async function getRecommendation(
  roomNo: number,
  params: RecommendParams = {},
): Promise<RecommendationResult> {
  if (USE_MOCK) {
    return {
      roomNo,
      totalBudget: 60000,
      spentAmount: 0,
      remainingBudget: 60000,
      recommendationBudget: 15000,
      budgetGuide: '1인당 15,000원 안에서 추천했어요.',
      fallbackApplied: false,
      requestedTag: params.tag ?? null,
      requestedRegion: params.region ?? null,
      places: [],
    }
  }

  // 실제 경로: GET /rooms/{no}/recommend?tag=&region=&lat=&lng=&radius=
  return client.get<RecommendationResult>(`/rooms/${roomNo}/recommend`, params)
}
