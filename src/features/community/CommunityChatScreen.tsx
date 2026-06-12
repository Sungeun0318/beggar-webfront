import { Send } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { AppHeaderTitled } from '../../components/AppHeader'
import { PhoneFrame } from '../../components/PhoneFrame'
import { softBox } from '../../components/ui/softBox'
import { getChats, sendChat } from '../../lib/api/community'
import { wsClient } from '../../lib/websocket'
import { colors, radii } from '../../theme/tokens'
import type { RoomFreeChat } from '../../types'

function ChatBubble({ chat }: { chat: RoomFreeChat }) {
  return (
    <div className={`flex ${chat.isMine ? 'justify-end' : 'justify-start'}`}>
      {!chat.isMine && (
        <div className="mr-2.5 mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full bg-muted">
          {chat.senderProfileImageUrl ? (
            <img
              src={chat.senderProfileImageUrl}
              alt={chat.sender}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-accent/10 text-[11px] font-bold text-accent">
              {chat.sender[0]}
            </div>
          )}
        </div>
      )}
      <div className={`max-w-[258px] ${chat.isMine ? 'items-end' : 'items-start'}`}>
        {!chat.isMine && (
          <p className="mb-1.5 text-[12px] font-bold text-darkSub">
            {chat.sender}
          </p>
        )}
        <div
          className={`rounded-[18px] px-4 py-3 ${
            chat.isMine
              ? 'rounded-br-md bg-accent text-white'
              : 'rounded-bl-md bg-white text-text'
          }`}
          style={{
            boxShadow: chat.isMine
              ? '0 8px 18px rgba(212, 175, 55, 0.18)'
              : '0 4px 12px rgba(0, 0, 0, 0.04)',
          }}
        >
          <p className="text-[14px] font-semibold leading-[1.55]">
            {chat.message}
          </p>
        </div>
        <p
          className={`mt-1 text-[11px] font-semibold text-lightSub ${
            chat.isMine ? 'text-right' : 'text-left'
          }`}
        >
          {chat.createdAt}
        </p>
      </div>
    </div>
  )
}

export function CommunityChatScreen() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [chats, setChats] = useState<RoomFreeChat[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chats])

  useEffect(() => {
    const myName = localStorage.getItem('userName')

    // 기존 채팅 내역 로드 및 내 메시지 여부 판별
    void getChats().then((data) => {
      const transformed = data.map((chat) => ({
        ...chat,
        isMine: chat.sender === myName,
      }))
      const uniqueChats = transformed.filter(
        (chat, index, self) => index === self.findIndex((c) => c.id === chat.id)
      )
      setChats(uniqueChats)
    })

    let subscription: { unsubscribe: () => void } | undefined

    // WebSocket 연결 및 구독
    wsClient.connect(() => {
      console.log('커뮤니티 채팅 웹소켓 연결 성공')
      
      subscription = wsClient.subscribe('/sub/chats', (msg) => {
        try {
          const receivedChat = JSON.parse(msg.body)
          
          // 로컬 스토리지의 유저 정보와 비교하여 isMine 결정
          const myName = localStorage.getItem('userName')
          const chatWithMine: RoomFreeChat = {
            ...receivedChat,
            isMine: receivedChat.sender === myName
          }

          setChats((prev) => {
            if (prev.some(c => c.id === chatWithMine.id)) return prev
            return [...prev, chatWithMine]
          })
        } catch (err) {
          console.error('채팅 메시지 파싱 실패:', err)
        }
      })
    })

    return () => {
      console.log('커뮤니티 채팅 웹소켓 정리 중')
      subscription?.unsubscribe()
    }
  }, [])

  const handleSend = async () => {
    const nextMessage = message.trim()
    if (!nextMessage) return

    try {
      await sendChat(nextMessage)
      setMessage('')
    } catch (err) {
      console.error('채팅 전송 실패:', err)
      alert('메시지 전송에 실패했습니다.')
    }
  }

  return (
    <PhoneFrame>
      <main className="min-h-[852px] bg-bg">
        <AppHeaderTitled title="전체 채팅방" onBack={() => navigate(-1)} />

        <section className="px-pageH pt-2 pb-[116px]">
          <div
            className="px-5 py-[18px]"
            style={softBox({ color: colors.accentBg, radius: radii.card })}
          >
            <p className="text-[14px] font-semibold leading-[1.55] text-sub">
              착한가격 업소, 쿠폰, 절약 루트를 자유롭게 공유해요!
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {chats.map((chat) => (
              <ChatBubble key={chat.id} chat={chat} />
            ))}
            <div ref={scrollRef} />
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto h-[92px] w-full max-w-[430px] border-t border-border bg-white/95 px-pageH pt-3">
          <div className="flex h-[52px] items-center px-4" style={softBox()}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSend()
              }}
              placeholder="메시지 입력"
              className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-text outline-none placeholder:text-placeholder"
            />
            <button
              type="button"
              onClick={handleSend}
              aria-label="메시지 전송"
              className="ml-3 grid h-9 w-9 place-items-center rounded-full bg-accent text-white"
            >
              <Send aria-hidden="true" size={18} />
            </button>
          </div>
        </div>
      </main>
    </PhoneFrame>
  )
}
