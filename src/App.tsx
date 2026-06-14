import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { LoginScreen } from './features/auth/LoginScreen'
import { MyPageScreen } from './features/auth/MyPageScreen'
import { SignupScreen } from './features/auth/SignupScreen'
import { BudgetInputScreen } from './features/budget/BudgetInputScreen'
import { BudgetResultScreen } from './features/budget/BudgetResultScreen'
import { CommunityChatScreen } from './features/community/CommunityChatScreen'
import { CommunityPostDetailScreen } from './features/community/CommunityPostDetailScreen'
import { CommunityPostWriteScreen } from './features/community/CommunityPostWriteScreen'
import { CommunityScreen } from './features/community/CommunityScreen'
import { HomeScreen } from './features/home/HomeScreen'
import { RankingScreen } from './features/home/RankingScreen'
import { RecommendationScreen } from './features/recommendation/RecommendationScreen'
import { ReceiptRegisterScreen } from './features/receipts/ReceiptRegisterScreen'
import { ReceiptSplitScreen } from './features/receipts/ReceiptSplitScreen'
import { ReceiptsScreen } from './features/receipts/ReceiptsScreen'
import { ActiveRoomScreen } from './features/room/ActiveRoomScreen'
import { CreateRoomScreen } from './features/room/CreateRoomScreen'
import { InviteRoomScreen } from './features/room/InviteRoomScreen'
import { JoinRoomScreen } from './features/room/JoinRoomScreen'
import { RoomRatingScreen } from './features/room/RoomRatingScreen'
import { RoomSettingsScreen } from './features/room/RoomSettingsScreen'
import { SplashScreen } from './features/splash/SplashScreen'

function App() {
  const hasKakaoCode = new URLSearchParams(window.location.search).has('code')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={hasKakaoCode ? <LoginScreen /> : <SplashScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/mypage" element={<MyPageScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/ranking" element={<RankingScreen />} />
        <Route path="/community" element={<CommunityScreen />} />
        <Route path="/community/chat" element={<CommunityChatScreen />} />
        <Route
          path="/community/post/:id"
          element={<CommunityPostDetailScreen />}
        />
        <Route
          path="/community/write"
          element={<CommunityPostWriteScreen />}
        />
        <Route path="/room/create" element={<CreateRoomScreen />} />
        <Route path="/room/invite/:roomNo" element={<InviteRoomScreen />} />
        <Route path="/room/join/:code" element={<JoinRoomScreen />} />
        <Route path="/room/join" element={<JoinRoomScreen />} />
        <Route path="/join/:code" element={<JoinRoomScreen />} />
        <Route path="/join" element={<JoinRoomScreen />} />
        <Route path="/budget/input/:roomNo" element={<BudgetInputScreen />} />
        <Route path="/budget/input" element={<BudgetInputScreen />} />
        <Route path="/budget/result/:roomNo" element={<BudgetResultScreen />} />
        <Route path="/budget/result" element={<BudgetResultScreen />} />
        <Route path="/recommend" element={<RecommendationScreen />} />
        <Route path="/receipts/register" element={<ReceiptRegisterScreen />} />
        <Route path="/receipts/split" element={<ReceiptSplitScreen />} />
        <Route path="/receipts" element={<ReceiptsScreen />} />
        <Route path="/room/:no/settings" element={<RoomSettingsScreen />} />
        <Route path="/room/:no/rating" element={<RoomRatingScreen />} />
        <Route path="/room/:no" element={<ActiveRoomScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
