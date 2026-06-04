import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { BottomNav } from './components/BottomNav'
import { PhoneFrame } from './components/PhoneFrame'
import { spacing, textStyles } from './theme/tokens'

type PlaceholderScreenProps = {
  title: string
  showBottomNav?: boolean
}

const routes = [
  { path: '/', title: 'Splash' },
  { path: '/login', title: 'Login' },
  { path: '/signup', title: 'Signup' },
  { path: '/home', title: 'Home', showBottomNav: true },
  { path: '/community', title: 'Community', showBottomNav: true },
  { path: '/community/chat', title: 'CommunityChat' },
  { path: '/community/post/:id', title: 'CommunityPostDetail' },
  { path: '/community/write', title: 'CommunityPostWrite' },
  { path: '/ranking', title: 'Ranking', showBottomNav: true },
  { path: '/mypage', title: 'MyPage', showBottomNav: true },
  { path: '/room/create', title: 'CreateRoom' },
  { path: '/room/invite', title: 'InviteRoom' },
  { path: '/room/:no', title: 'ActiveRoom' },
  { path: '/room/:no/settings', title: 'RoomSettings' },
  { path: '/room/:no/rating', title: 'RoomRating' },
  { path: '/budget/input', title: 'BudgetInput' },
  { path: '/budget/result', title: 'BudgetResult' },
  { path: '/recommend', title: 'Recommendation' },
  { path: '/receipts/register', title: 'ReceiptRegister' },
  { path: '/receipts', title: 'Receipts' },
] satisfies PlaceholderScreenProps[] & Array<{ path: string }>

function PlaceholderScreen({ title, showBottomNav = false }: PlaceholderScreenProps) {
  return (
    <PhoneFrame>
      <main
        className="relative flex min-h-[852px] flex-col bg-bg px-pageH"
        style={{ paddingBottom: showBottomNav ? spacing.bottomSafe : 0 }}
      >
        <section className="flex flex-1 items-center justify-center text-center">
          <h1 style={textStyles.pageTitle}>{title}</h1>
        </section>
        {showBottomNav && <BottomNav />}
      </main>
    </PhoneFrame>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map(({ path, title, showBottomNav }) => (
          <Route
            key={path}
            path={path}
            element={
              <PlaceholderScreen title={title} showBottomNav={showBottomNav} />
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
