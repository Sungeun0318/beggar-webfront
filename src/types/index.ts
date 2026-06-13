export type User = {
  no: number
  name: string
  email: string
  profileImageUrl?: string
  score?: number
  title?: string
}

export type UserTitle = {
  id: string
  title: string
  description: string
  minScore: number
  maxScore: number
  scoreRange: string
  unlocked: boolean
  selected: boolean
}

export type UserTitleManagement = {
  currentTitle: string
  selectedTitleId?: string
  score: number
  titles: UserTitle[]
}

export type Room = {
  no: number
  roomNo?: number
  ownerNo: number
  name: string
  roomName?: string
  code: string
  roomCode?: string
  location: string
  tags: string[]
  memberCount: number
  maxMemberCount: number
  status?: string
  budget?: number
  spent?: number
}

export type Member = {
  roomMemberId?: number
  userNo?: number
  name: string
  status: string
  mine: boolean
  budgetSubmitted?: boolean
}

export type BudgetResult = {
  minBudgetPerPerson: number
  memberCount: number
  totalBudget: number
}

export type BeggarScore = {
  roomNo: number
  score: number
  title: string
  totalSpentAmount: number
  totalSavedAmount: number
  goodPriceVerifiedCount: number
  budgetComplianceRate: number
  avgSavingsRatio: number
  lastCalculatedAt: string
}

export type RankingEntry = {
  rank: number
  roomNo: number
  roomName: string
  score: number
  title: string
}

export type Receipt = {
  id?: number
  no?: number
  receiptId?: number
  roomNo?: number
  receiptType?: 'COMBINED' | 'SPLIT' | 'PERSONAL' | string
  date: string
  room: string
  image: string
  imageUrl?: string
  title: string
  storeName?: string
  totalAmount?: number
  amount: number
  address?: string
  createdAt?: string
  splits?: {
    roomMemberId?: number
    userName?: string
    amount?: number
  }[]
}

export type ReceiptHistoryItem = {
  receiptId: number
  roomNo: number
  roomName: string
  storeName?: string
  receiptType: 'COMBINED' | 'SPLIT' | string
  amount: number
  createdAt: string
}

export type ReceiptHistory = {
  receipts: ReceiptHistoryItem[]
  totalAmount: number
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
  authorProfileImageUrl?: string
}

export type RoomFreeComment = {
  id: number
  author: string
  content: string
  createdAt: string
  authorProfileImageUrl?: string
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
  senderProfileImageUrl?: string
}
