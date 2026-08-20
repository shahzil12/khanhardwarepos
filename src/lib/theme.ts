export type ColorTheme = 'amber';

export interface ThemePreset {
  id: ColorTheme;
  name: string;
  subtitle: string;
  swatchGradient: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  dark: {
    gradient: string;
    textGradient: string;
    textAccent: string;
    bgSoft: string;
    borderAccent: string;
    glow: string;
    badge: string;
    iconBg: string;
    activeTab: string;
    ring: string;
  };
  light: {
    gradient: string;
    textGradient: string;
    textAccent: string;
    bgSoft: string;
    borderAccent: string;
    glow: string;
    badge: string;
    iconBg: string;
    activeTab: string;
    ring: string;
  };
}

export const THEME_PRESETS: Record<ColorTheme, ThemePreset> = {
  amber: {
    id: 'amber',
    name: 'Amber Gold',
    subtitle: 'Warm Sunfire Amber & Orange Gold',
    swatchGradient: 'from-amber-400 to-orange-500',
    primaryColorHex: '#f59e0b',
    secondaryColorHex: '#f97316',
    dark: {
      gradient: 'from-amber-600 to-orange-600',
      textGradient: 'from-amber-400 via-amber-200 to-orange-300',
      textAccent: 'text-amber-400',
      bgSoft: 'bg-amber-950/40',
      borderAccent: 'border-amber-500/30',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]',
      badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      iconBg: 'bg-amber-950 border border-amber-500/40 text-amber-400',
      activeTab: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      ring: 'ring-amber-500'
    },
    light: {
      gradient: 'from-amber-600 to-orange-600',
      textGradient: 'from-amber-700 via-orange-600 to-amber-600',
      textAccent: 'text-amber-800',
      bgSoft: 'bg-amber-50/80',
      borderAccent: 'border-amber-200',
      glow: 'shadow-md shadow-amber-600/15',
      badge: 'bg-amber-100 text-amber-900 border-amber-200',
      iconBg: 'bg-amber-600 text-white shadow-sm',
      activeTab: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500/20 shadow-md shadow-amber-600/15',
      ring: 'ring-amber-500'
    }
  }
};

export function getThemePreset(colorTheme: ColorTheme = 'amber'): ThemePreset {
  return THEME_PRESETS.amber;
}

export function getThemeStyles(colorTheme: ColorTheme = 'amber', isDark: boolean = true) {
  const preset = getThemePreset('amber');
  return isDark ? preset.dark : preset.light;
}
