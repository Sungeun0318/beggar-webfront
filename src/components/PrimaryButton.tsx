import { colors, gradients } from '../theme/tokens'

type PrimaryButtonProps = {
  label: string
  onTap: () => void
  enabled?: boolean
}

export function PrimaryButton({
  label,
  onTap,
  enabled = true,
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={!enabled}
      onClick={enabled ? onTap : undefined}
      className="flex h-[60px] w-full items-center justify-center rounded-card text-base font-semibold disabled:cursor-default"
      style={{
        background: enabled ? gradients.goldGradient : colors.border,
        boxShadow: enabled ? '0 8px 10px rgba(212, 175, 55, 0.25)' : undefined,
        color: enabled ? '#FFFFFF' : colors.lightSub,
        letterSpacing: -0.31,
      }}
    >
      {label}
    </button>
  )
}
