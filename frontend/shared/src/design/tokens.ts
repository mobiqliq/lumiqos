/**
 * LumiqOS Design Tokens — Single Source of Truth
 * All values exported as constants for use in TypeScript/React components.
 * Corresponding CSS variables are generated in theme.css
 */

// ============  Colour — Foundation  ============
export const COLORS = {
  // Ink & Slate — Structure
  ink: '#0A0A0F',
  ink60: 'rgba(10,10,15,0.6)',
  ink30: 'rgba(10,10,15,0.3)',
  ink10: 'rgba(10,10,15,0.08)',
  slate: '#1C1C2E',
  slateMid: '#2D2D44',
  gold: '#C8A96E',
  goldLight: '#E8D5B0',
  goldPale: '#F7F1E6',
  surface: '#FAFAF8',
  surface2: '#F2F1ED',
  surface3: '#E8E6DF',
  border: 'rgba(10,10,15,0.09)',
  borderStrong: 'rgba(10,10,15,0.18)',

  // Semantic States
  success: '#0E7A6E',
  successLight: '#D0EDE9',
  warning: '#B86B1A',
  warningLight: '#F5E6CC',
  danger: '#A82828',
  dangerLight: '#FADADD',
  info: '#1A3A6B',
  infoLight: '#D6E4F7',
} as const;

// ============  Persona Accents  ============
export const PERSONA_ACCENTS = {
  principal: '#2B5BA8',
  admin: '#1A3A6B',
  teacher: '#0E7A6E',
  finance: '#B86B1A',
  hr: '#4A3080',
  parent: '#2E6B2E',
  student: '#9B3A5C',
} as const;

// ============  Typography  ============
export const TYPOGRAPHY = {
  fontSerif: "'DM Serif Display', Georgia, serif",
  fontSans: "'DM Sans', system-ui, -apple-system, sans-serif",
  fontMono: "'DM Mono', 'Courier New', monospace",
} as const;

// ============  Spacing (8px base grid)  ============
export const SPACING = {
  space1: '4px',
  space2: '8px',
  space4: '16px',
  space6: '24px',
  space8: '32px',
  space10: '40px',
  space12: '48px',
  space16: '64px',
} as const;

// ============  Border Radius  ============
export const RADIUS = {
  rSm: '10px',
  rMd: '16px',
  rLg: '22px',
  rXl: '28px',
  rPill: '9999px',
} as const;

// ============  Motion  ============
export const MOTION = {
  easeEnter: 'cubic-bezier(0.16, 1, 0.3, 1)',
  easeExit: 'cubic-bezier(0.4, 0, 1, 1)',
  easeStatic: 'ease-in-out',
  tInstant: '100ms',
  tTransition: '240ms',
  tReveal: '420ms',
} as const;

// ============  Layout Dimensions  ============
export const LAYOUT = {
  sidebarWidth: '200px',
  sidebarCollapsedWidth: '48px',
  topbarHeight: '64px',
  tabBarHeight: '52px',
} as const;
