import type { LocationSearchResult } from '../../types'
import { client } from './client'
import { MOCK } from './mockMode'

export async function searchLocations(
  query: string,
): Promise<LocationSearchResult[]> {
  if (MOCK.location) {
    return mockLocations()
  }

  // 실제 경로: GET /locations/search?query=
  try {
    return await client.getList<LocationSearchResult>('/locations/search', {
      query,
    })
  } catch (error) {
    console.warn('위치 검색 API 실패 - mock 대체', error)
    return mockLocations()
  }
}

function mockLocations(): LocationSearchResult[] {
  return [
    {
      name: '명학역',
      address: '경기 안양시 만안구 안양동',
      lat: 37.3844,
      lng: 126.9356,
    },
  ]
}
