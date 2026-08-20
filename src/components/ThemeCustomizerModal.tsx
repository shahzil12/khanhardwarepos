'use client';

import React from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  Check, 
  Sparkles, 
  Palette, 
  ShoppingCart, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { getThemeStyles } from '@/lib/theme';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeCustomizerModal({ isOpen, onClose }: ThemeCustomizerModalProps) {
  const { themeMode, toggleThemeMode } = useStore();

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';
  const currentStyles = getThemeStyles('amber', isDark);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in print:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-xl rounded-2xl shadow-2xl border transition-all duration-200 overflow-hidden z-10 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${currentStyles.iconBg}`}>
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Amber Gold Theme</h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Primary warm gold styling for Khan Hardware POS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          
          {/* Section 1: Appearance Mode */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Appearance Mode
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Dark Mode Card */}
              <button
                onClick={() => {
                  if (!isDark) toggleThemeMode();
                }}
                className={`relative p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 ${
                  isDark
                    ? `${currentStyles.borderAccent} bg-slate-950/80 ${currentStyles.glow}`
                    : 'border-slate-200 bg-slate-50 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                  <Moon className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Dark Mode</span>
                    {isDark && (
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center ${currentStyles.iconBg}`}>
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Warm Amber & Sunfire Gold Dark Contrast</p>
                </div>
              </button>

              {/* Light Mode Card */}
              <button
                onClick={() => {
                  if (isDark) toggleThemeMode();
                }}
                className={`relative p-4 rounded-2xl border text-left flex items-center gap-4 transition-all duration-200 ${
                  !isDark
                    ? `${currentStyles.borderAccent} bg-white ${currentStyles.glow}`
                    : 'border-slate-800 bg-slate-950/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-inner">
                  <Sun className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      Light Mode
                    </span>
                    {!isDark && (
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center ${currentStyles.iconBg}`}>
                        <Check className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Crisp Gold Layout for Day Use
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: Active Theme Badge */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isDark ? 'bg-amber-950/30 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm">Active Theme: Amber Gold</p>
                <p className="text-xs opacity-85">Warm Sunfire Amber & Orange Accent System</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${currentStyles.badge}`}>
              Active
            </span>
          </div>

          {/* Section 3: Live Component Preview */}
          <div className={`p-4 rounded-2xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Live Interface Preview
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {/* Active Tab Preview */}
              <div className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 ${currentStyles.activeTab}`}>
                <ShoppingCart className="h-4 w-4" />
                Active Tab
              </div>

              {/* Badge Preview */}
              <div className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${currentStyles.badge}`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                Gold Badge
              </div>

              {/* Text Highlight Preview */}
              <span className={`text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r ${currentStyles.textGradient}`}>
                Khan Hardware POS
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Amber Gold active across entire system</span>
          </div>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md bg-gradient-to-r ${currentStyles.gradient} ${currentStyles.glow}`}
          >
            Close Customizer
          </button>
        </div>
      </div>
    </div>
  );
}
