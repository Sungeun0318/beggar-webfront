export const colors = {
  bg: '#FDFBF7',
  canvas: '#F3EFE6',
  text: '#2C241B',
  darkSub: '#5A4F43',
  sub: '#8C7E6A',
  lightSub: '#A69986',
  placeholder: '#C4B8A5',
  border: '#E8E3D9',
  muted: '#F3EFE6',
  accent: '#D4AF37',
  brown: '#C69C6D',
  danger: '#D9734C',
  accentBg: '#FFF9F0',
  kakaoYellow: '#FEE500',
  tagBgFood: '#FFEADD',
  tagBgCafe: '#FFF2D1',
  tagFgCafe: '#B88B2D',
  tagBgPlay: '#EAE4FE',
  tagFgPlay: '#8B6CE0',
  sparkleYellow: '#E9C867',
  sparkleOrange: '#F0A282',
  sparklePurple: '#B994F2',
} as const

export const gradients = {
  goldGradient: 'linear-gradient(to right, #D4AF37, #C69C6D)',
  medalGold: 'linear-gradient(to bottom right, #FFE7A2, #FFFBD0)',
  medalSilver: 'linear-gradient(to right, #F4F4F4, #8E8E8E)',
  medalBronze: 'linear-gradient(to bottom, #FFDBA9, #D0701B)',
} as const

export const spacing = {
  pageH: 24,
  headerTop: 55,
  headerHeight: 56,
  contentTop: 128,
  bottomSafe: 120,
} as const

export const radii = {
  compact: 16,
  card: 20,
  hero: 28,
  chip: 9999,
} as const

export const textStyles = {
  appBrand: {
    fontSize: 19,
    fontWeight: 700,
    letterSpacing: -0.7,
    color: colors.text,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: -0.45,
    color: colors.text,
  },
  sectionHeading: {
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: -0.7,
    color: colors.text,
  },
  bodyStrong: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.darkSub,
  },
  bodySub: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.sub,
  },
} as const
