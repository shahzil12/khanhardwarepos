export type ColorTheme = 'cyan' | 'emerald' | 'indigo' | 'amber' | 'rose';

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
  cyan: {
    id: 'cyan',
    name: 'Cyan Neon',
    subtitle: 'Cyberpunk Cyan & Electric Blue',
    swatchGradient: 'from-cyan-400 to-blue-500',
    primaryColorHex: '#06b6d4',
    secondaryColorHex: '#3b82f6',
    dark: {
      gradient: 'from-cyan-600 to-blue-600',
      textGradient: 'from-cyan-400 via-cyan-200 to-blue-300',
      textAccent: 'text-cyan-400',
      bgSoft: 'bg-cyan-950/40',
      borderAccent: 'border-cyan-500/30',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.35)]',
      badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      iconBg: 'bg-cyan-950 border border-cyan-500/40 text-cyan-400',
      activeTab: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
      ring: 'ring-cyan-500'
    },
    light: {
      gradient: 'from-blue-600 to-cyan-600',
      textGradient: 'from-blue-700 via-cyan-600 to-blue-600',
      textAccent: 'text-cyan-700',
      bgSoft: 'bg-cyan-50/80',
      borderAccent: 'border-cyan-200',
      glow: 'shadow-md shadow-cyan-600/15',
      badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      iconBg: 'bg-cyan-600 text-white shadow-sm',
      activeTab: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-500/20 shadow-md shadow-cyan-600/15',
      ring: 'ring-cyan-500'
    }
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Mint',
    subtitle: 'Fresh Forest Emerald & Mint',
    swatchGradient: 'from-emerald-400 to-teal-500',
    primaryColorHex: '#10b981',
    secondaryColorHex: '#14b8a6',
    dark: {
      gradient: 'from-emerald-600 to-teal-600',
      textGradient: 'from-emerald-400 via-teal-200 to-emerald-300',
      textAccent: 'text-emerald-400',
      bgSoft: 'bg-emerald-950/40',
      borderAccent: 'border-emerald-500/30',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.35)]',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      iconBg: 'bg-emerald-950 border border-emerald-500/40 text-emerald-400',
      activeTab: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      ring: 'ring-emerald-500'
    },
    light: {
      gradient: 'from-emerald-600 to-teal-600',
      textGradient: 'from-emerald-700 via-teal-600 to-emerald-600',
      textAccent: 'text-emerald-700',
      bgSoft: 'bg-emerald-50/80',
      borderAccent: 'border-emerald-200',
      glow: 'shadow-md shadow-emerald-600/15',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-600 text-white shadow-sm',
      activeTab: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-emerald-500/20 shadow-md shadow-emerald-600/15',
      ring: 'ring-emerald-500'
    }
  },
  indigo: {
    id: 'indigo',
    name: 'Royal Indigo',
    subtitle: 'Deep Royal Violet & Indigo',
    swatchGradient: 'from-indigo-400 to-purple-500',
    primaryColorHex: '#6366f1',
    secondaryColorHex: '#a855f7',
    dark: {
      gradient: 'from-indigo-600 to-purple-600',
      textGradient: 'from-indigo-400 via-purple-200 to-indigo-300',
      textAccent: 'text-indigo-400',
      bgSoft: 'bg-indigo-950/40',
      borderAccent: 'border-indigo-500/30',
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.35)]',
      badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      iconBg: 'bg-indigo-950 border border-indigo-500/40 text-indigo-400',
      activeTab: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.3)]',
      ring: 'ring-indigo-500'
    },
    light: {
      gradient: 'from-indigo-600 to-purple-600',
      textGradient: 'from-indigo-700 via-purple-600 to-indigo-600',
      textAccent: 'text-indigo-700',
      bgSoft: 'bg-indigo-50/80',
      borderAccent: 'border-indigo-200',
      glow: 'shadow-md shadow-indigo-600/15',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      iconBg: 'bg-indigo-600 text-white shadow-sm',
      activeTab: 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500/20 shadow-md shadow-indigo-600/15',
      ring: 'ring-indigo-500'
    }
  },
  amber: {
    id: 'amber',
    name: 'Amber Gold',
    subtitle: 'Warm Sunfire Amber & Orange',
    swatchGradient: 'from-amber-400 to-orange-500',
    primaryColorHex: '#f59e0b',
    secondaryColorHex: '#f97316',
    dark: {
      gradient: 'from-amber-600 to-orange-600',
      textGradient: 'from-amber-400 via-orange-200 to-amber-300',
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
  },
  rose: {
    id: 'rose',
    name: 'Rose Dusk',
    subtitle: 'Crimson Rose & Vibrant Pink',
    swatchGradient: 'from-rose-400 to-pink-500',
    primaryColorHex: '#f43f5e',
    secondaryColorHex: '#ec4899',
    dark: {
      gradient: 'from-rose-600 to-pink-600',
      textGradient: 'from-rose-400 via-pink-200 to-rose-300',
      textAccent: 'text-rose-400',
      bgSoft: 'bg-rose-950/40',
      borderAccent: 'border-rose-500/30',
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.35)]',
      badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      iconBg: 'bg-rose-950 border border-rose-500/40 text-rose-400',
      activeTab: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-400/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
      ring: 'ring-rose-500'
    },
    light: {
      gradient: 'from-rose-600 to-pink-600',
      textGradient: 'from-rose-700 via-pink-600 to-rose-600',
      textAccent: 'text-rose-700',
      bgSoft: 'bg-rose-50/80',
      borderAccent: 'border-rose-200',
      glow: 'shadow-md shadow-rose-600/15',
      badge: 'bg-rose-100 text-rose-800 border-rose-200',
      iconBg: 'bg-rose-600 text-white shadow-sm',
      activeTab: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-500/20 shadow-md shadow-rose-600/15',
      ring: 'ring-rose-500'
    }
  }
};

export function getThemePreset(colorTheme: ColorTheme = 'cyan'): ThemePreset {
  return THEME_PRESETS[colorTheme] || THEME_PRESETS.cyan;
}

export function getThemeStyles(colorTheme: ColorTheme = 'cyan', isDark: boolean = true) {
  const preset = getThemePreset(colorTheme);
  return isDark ? preset.dark : preset.light;
}
