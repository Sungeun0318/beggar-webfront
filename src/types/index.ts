export type User = {
  no: number
  name: string
  email: string
}

export type Room = {
  no: number
  ownerNo: number
  name: string
  code: string
  location: string
  tags: string[]
  memberCount: number
  maxMemberCount: number
}

export type Member = {
  name: string
  status: string
  mine: boolean
}

export type BudgetResult = {
  minBudgetPerPerson: number
  memberCount: number
  totalBudget: number
}

export type Receipt = {
  id?: number
  date: string
  room: string
  image: string
  title: string
  amount: number
}

export type RecommendationResult = {
  roomNo: number
  totalBudget?: number | null
  spentAmount: number
  remainingBudget?: number | null
  recommendationBudget?: number | null
  budgetGuide?: string | null
  fallbackApplied: boolean
  requestedTag?: string | null
  requestedRegion?: string | null
  places: RecommendedPlace[]
}

export type RecommendedPlace = {
  storeId?: string | null
  name: string
  category: string
  expectedPrice?: number | null
  menuName?: string | null
  walkTime?: string | null
  rating?: number | null
  thumbnailUrl: string
  address: string
  mapUrl: string
  source: string
  reason: string
}

export type Recommendation = RecommendedPlace
export type Place = RecommendedPlace

export type LocationSearchResult = {
  name: string
  address: string
  lat: number
  lng: number
}

export type RoomFreePost = {
  id: number
  title: string
  content: string
  author: string
  tag: string
  commentCount: number
  createdAt: string
}

export type RoomFreeComment = {
  id: number
  author: string
  content: string
  createdAt: string
}

export type RoomFreePostDetail = RoomFreePost & {
  comments: RoomFreeComment[]
}

export type RoomFreeChat = {
  id: number
  sender: string
  message: string
  createdAt: string
  isMine: boolean
}
