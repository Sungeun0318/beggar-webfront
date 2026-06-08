import type { RecommendationResult } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

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
  if (MOCK.recommend) {
    return mockRecommendation(roomNo, params)
  }

  const token = localStorage.getItem('accessToken')

  // 실제 경로: GET /rooms/{no}/recommend?tag=&region=&lat=&lng=&radius=
  return client.get<RecommendationResult>(
    `/rooms/${roomNo}/recommend`,
    params,
    { Authorization: `Bearer ${token}` },
  )
}

function mockRecommendation(
  roomNo: number,
  params: RecommendParams = {},
): RecommendationResult {
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
    places: [
      {
        storeId: 'good-price-001',
        name: '정성 한식 세트',
        category: params.tag ?? '한식',
        expectedPrice: 9500,
        menuName: '제육 정식',
        walkTime: '도보 5분',
        rating: 4.6,
        thumbnailUrl: '/assets/images/figma/reco_food.png',
        address: '경기 안양시 만안구 명학로 12',
        mapUrl: 'https://map.kakao.com/',
        source: 'GOOD_PRICE_STORE',
        reason: '남는 예산까지 고려한 착한가격업소 추천이에요.',
      },
      {
        storeId: 'good-price-002',
        name: '명학 순두부',
        category: params.tag ?? '한식',
        expectedPrice: 8000,
        menuName: '순두부찌개',
        walkTime: '도보 6분',
        rating: 4.4,
        thumbnailUrl: '/assets/images/figma/reco_food.png',
        address: '경기 안양시 만안구 안양로 201',
        mapUrl: 'https://map.kakao.com/',
        source: 'GOOD_PRICE_STORE',
        reason: '남은 예산으로 충분히 가능한 다음 코스예요.',
      },
    ],
  }
}
