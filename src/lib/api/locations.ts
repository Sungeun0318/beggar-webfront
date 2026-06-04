import type { LocationSearchResult } from '../../types'
import { client } from './client'
import { USE_MOCK } from './mockMode'

export async function searchLocations(
  query: string,
): Promise<LocationSearchResult[]> {
  if (USE_MOCK) {
    return [
      {
        name: '명학역',
        address: '경기 안양시 만안구 안양동',
        lat: 37.3844,
        lng: 126.9356,
      },
    ]
  }

  // 실제 경로: GET /locations/search?query=
  return client.getList<LocationSearchResult>('/locations/search', { query })
}
