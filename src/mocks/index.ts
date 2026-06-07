import type { BudgetResult, Member, Receipt, Room, User } from '../types'

export const currentUser: User = {
  no: 3,
  name: '거지판다',
  email: 'flutter_dev03@kakao.com',
}

export const room: Room = {
  no: 1,
  ownerNo: 3,
  name: '명학역 데이트',
  code: 'abc001',
  location: '경기 안양시 만안구',
  tags: ['한식', '양식', '기타 요식업'],
  memberCount: 4,
  maxMemberCount: 8,
}

export const members: Member[] = [
  { name: '거지판다', status: '제출 완료', mine: true },
  { name: '거지진감', status: '제출 완료', mine: false },
  { name: '거지로봇', status: '제출 완료', mine: false },
  { name: '거거', status: '제출 완료', mine: false },
]

export const budgetResult: BudgetResult = {
  minBudgetPerPerson: 15000,
  memberCount: 4,
  totalBudget: 60000,
}

export const receipts: Receipt[] = [
  {
    id: 101,
    date: '2024.05.18',
    room: '명학역 데이트',
    image: 'assets/images/figma/receipt_food.png',
    title: '정성 한식',
    amount: 35000,
  },
  {
    id: 102,
    date: '2024.05.12',
    room: '전시 보러 가요',
    image: 'assets/images/figma/receipt_cafe.png',
    title: '블루보틀 삼청',
    amount: 14000,
  },
  {
    id: 103,
    date: '2024.05.05',
    room: '주말 브런치 클럽',
    image: 'assets/images/figma/receipt_brunch.png',
    title: '오아시스 한남',
    amount: 52000,
  },
]
