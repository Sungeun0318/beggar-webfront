import { Bell, ChevronLeft } from 'lucide-react'

import { colors, spacing, textStyles } from '../theme/tokens'

type HeaderIconButtonProps = {
  icon: 'back' | 'notification'
  size: number
  onClick?: () => void
}

type AppHeaderBrandProps = {
  title?: string
  logoSrc?: string
  onBack?: () => void
  showNotification?: boolean
  onNotification?: () => void
}

type AppHeaderTitledProps = {
  title: string
  onBack: () => void
}

const defaultLogoSrc = '/assets/images/figma/logo.png'

function HeaderIconButton({ icon, size, onClick }: HeaderIconButtonProps) {
  const Icon = icon === 'back' ? ChevronLeft : Bell

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="grid h-10 w-10 place-items-center p-0 disabled:cursor-default"
    >
      <Icon aria-hidden="true" size={size} color={colors.text} />
    </button>
  )
}

function HeaderShell({ children }: { children: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 bg-bg px-pageH pt-4 pb-2">
      <div style={{ height: spacing.headerHeight }}>{children}</div>
    </header>
  )
}

export function AppHeaderBrand({
  title = '거지 우정 수호대',
  logoSrc = defaultLogoSrc,
  onBack,
  showNotification = true,
  onNotification,
}: AppHeaderBrandProps) {
  return (
    <HeaderShell>
      <div className="flex h-full items-center">
        {onBack && (
          <>
            <HeaderIconButton icon="back" size={30} onClick={onBack} />
            <div className="w-1.5" />
          </>
        )}
        <img
          src={logoSrc}
          alt=""
          className="h-11 w-11 rounded-full object-cover"
        />
        <div className="w-2.5" />
        <h1
          className="min-w-0 flex-1 truncate"
          style={{ ...textStyles.sectionHeading, fontSize: 25 }}
        >
          {title}
        </h1>
        <div className="w-10">
          {showNotification && (
            <HeaderIconButton
              icon="notification"
              size={24}
              onClick={onNotification}
            />
          )}
        </div>
      </div>
    </HeaderShell>
  )
}

export function AppHeaderTitled({ title, onBack }: AppHeaderTitledProps) {
  return (
    <HeaderShell>
      <div className="relative grid h-full items-center">
        <div className="absolute left-0">
          <HeaderIconButton icon="back" size={30} onClick={onBack} />
        </div>
        <h1
          className="truncate text-center"
          style={{ ...textStyles.sectionHeading, fontSize: 21 }}
        >
          {title}
        </h1>
      </div>
    </HeaderShell>
  )
}
