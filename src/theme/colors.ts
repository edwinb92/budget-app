export const palette = {
  violet: '#6C5CE7',
  violetSoft: '#EEEBFF',
  violetDeep: '#4B3FBF',

  coral: '#FF7A6B',
  coralSoft: '#FFE6E2',

  amber: '#F5A524',
  amberSoft: '#FFF1D6',

  mint: '#22C5A5',
  mintSoft: '#D8F5EC',

  sky: '#3FA9F5',
  skySoft: '#E0F0FE',

  rose: '#EF5DA8',
  roseSoft: '#FCE3F0',

  slate: '#1F2230',
  slateMuted: '#6B7080',
  slateFaint: '#A1A6B5',

  border: '#ECEAE4',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F4EF',
  background: '#FAF7F2',

  success: '#22C5A5',
  warning: '#F5A524',
  danger: '#FF7A6B',
} as const;

export const colors = {
  background: palette.background,
  surface: palette.surface,
  surfaceAlt: palette.surfaceAlt,
  border: palette.border,

  primary: palette.violet,
  primarySoft: palette.violetSoft,
  primaryDeep: palette.violetDeep,
  onPrimary: '#FFFFFF',

  text: {
    primary: palette.slate,
    muted: palette.slateMuted,
    faint: palette.slateFaint,
    onPrimary: '#FFFFFF',
  },

  status: {
    success: palette.success,
    warning: palette.warning,
    danger: palette.danger,
  },

  accents: {
    violet: { base: palette.violet, soft: palette.violetSoft },
    coral: { base: palette.coral, soft: palette.coralSoft },
    amber: { base: palette.amber, soft: palette.amberSoft },
    mint: { base: palette.mint, soft: palette.mintSoft },
    sky: { base: palette.sky, soft: palette.skySoft },
    rose: { base: palette.rose, soft: palette.roseSoft },
  },
} as const;

export type AccentName = keyof typeof colors.accents;
