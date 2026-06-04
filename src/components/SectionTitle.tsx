type SectionTitleProps = {
  text: string
}

export function SectionTitle({ text }: SectionTitleProps) {
  return (
    <h2
      className="text-[17px] font-semibold leading-[1.5]"
      style={{ letterSpacing: -0.43 }}
    >
      {text}
    </h2>
  )
}
