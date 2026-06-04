import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { BottomNav } from './components/BottomNav'
import { PhoneFrame } from './components/PhoneFrame'
import { LoginScreen } from './features/auth/LoginScreen'
import { MyPageScreen } from './features/auth/MyPageScreen'
import { SignupScreen } from './features/auth/SignupScreen'
import { BudgetInputScreen } from './features/budget/BudgetInputScreen'
import { BudgetResultScreen } from './features/budget/BudgetResultScreen'
import { HomeScreen } from './features/home/HomeScreen'
import { RankingScreen } from './features/home/RankingScreen'
import { CreateRoomScreen } from './features/room/CreateRoomScreen'
import { InviteRoomScreen } from './features/room/InviteRoomScreen'
import { SplashScreen } from './features/splash/SplashScreen'
import { spacing, textStyles } from './theme/tokens'

type PlaceholderScreenProps = {
  title: string
  showBottomNav?: boolean
}

const routes = [
  { path: '/community', title: 'Community', showBottomNav: true },
  { path: '/community/chat', title: 'CommunityChat' },
  { path: '/community/post/:id', title: 'CommunityPostDetail' },
  { path: '/community/write', title: 'CommunityPostWrite' },
  { path: '/room/:no', title: 'ActiveRoom' },
  { path: '/room/:no/settings', title: 'RoomSettings' },
  { path: '/room/:no/rating', title: 'RoomRating' },
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
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/mypage" element={<MyPageScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/ranking" element={<RankingScreen />} />
        <Route path="/room/create" element={<CreateRoomScreen />} />
        <Route path="/room/invite" element={<InviteRoomScreen />} />
        <Route path="/budget/input" element={<BudgetInputScreen />} />
        <Route path="/budget/result" element={<BudgetResultScreen />} />
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
