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

  orange: '#F97316',
  orangeSoft: '#FFEDD5',

  fuchsia: '#D946EF',
  fuchsiaSoft: '#FAE8FF',

  lime: '#84CC16',
  limeSoft: '#ECFCCB',

  stone: '#78716C',
  stoneSoft: '#E7E5E4',

  slate: '#1F2230',
  slateMuted: '#6B7080',
  slateFaint: '#A1A6B5',

  border: '#ECEAE4',
  surface: '#FFFFFF',
  surfaceAlt: '#F6F4EF',
  background: '#FAF7F2',

  success: '#22C5A5',
  warning: '#F5A524',
  danger: '#DC2626',
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
    sky: { base: palette.sky, soft: palette.skySoft },
    mint: { base: palette.mint, soft: palette.mintSoft },
    lime: { base: palette.lime, soft: palette.limeSoft },
    amber: { base: palette.amber, soft: palette.amberSoft },
    orange: { base: palette.orange, soft: palette.orangeSoft },
    coral: { base: palette.coral, soft: palette.coralSoft },
    rose: { base: palette.rose, soft: palette.roseSoft },
    fuchsia: { base: palette.fuchsia, soft: palette.fuchsiaSoft },
    stone: { base: palette.stone, soft: palette.stoneSoft },
  },
} as const;

export type AccentName = keyof typeof colors.accents;
