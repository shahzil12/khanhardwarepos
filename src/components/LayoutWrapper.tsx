'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Database, 
  Flame, 
  Menu, 
  X, 
  User, 
  AlertTriangle,
  Sun,
  Moon
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cylinders, themeMode, toggleThemeMode } = useStore();
  
  // Calculate overdue cylinders count for warning banner
  const [overdueCount, setOverdueCount] = useState(0);

  useEffect(() => {
    const today = new Date();
    const count = cylinders.filter(c => {
      if (c.status !== 'Issued to Customer' || !c.customer) return false;
      return new Date(c.customer.expectedReturnDate) < today;
    }).length;
    setOverdueCount(count);
  }, [cylinders]);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Hardware POS', href: '/pos', icon: ShoppingCart },
    { 
      name: 'Cylinder Tracking', 
      href: '/cylinder', 
      icon: Database,
      badge: overdueCount > 0 ? overdueCount : undefined 
    },
  ];

  const isDark = themeMode === 'dark';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row antialiased font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Sidebar for Desktop */}
      <aside className={`hidden md:flex flex-col w-64 shrink-0 border-r transition-colors duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        {/* Header / Logo */}
        <div className={`h-16 flex items-center justify-between px-6 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 ${
              isDark 
                ? 'bg-cyan-950 border border-cyan-400/50 shadow-cyan-glow' 
                : 'bg-orange-600 shadow-sm shadow-orange-600/20'
            }`}>
              <Flame className={`h-6 w-6 text-white ${isDark ? 'animate-pulse' : 'animate-pulse-slow'}`} />
            </div>
            <div>
              <h1 className={`text-md font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
                isDark ? 'from-cyan-400 to-blue-200' : 'from-orange-600 to-amber-500'
              }`}>
                Khan Hardware
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                POS & Gas System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group border ${
                  isActive
                    ? isDark
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 text-white shadow-cyan-glow'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-500/10 text-white shadow-md shadow-orange-600/10'
                    : isDark
                      ? '-400 hover:bg-slate-800 hover:text-slate-200 border-transparent'
                      : '-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive 
                      ? 'text-white' 
                      : isDark 
                        ? '-400 group-hover:text-slate-200' 
                        : 'text-slate-400 group-hover:text-slate-700'
                  }`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive 
                      ? 'bg-white text-orange-600' 
                      : isDark
                        ? 'bg-red-500/20 text-red-400 border -500/20'
                        : 'bg-red-50 -600 border border-red-100'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Session Info & Theme toggler Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className={`flex items-center justify-between p-3 rounded-xl border ${
            isDark ? 'bg-slate-950/40 -800' : 'bg-slate-50 border-slate-100'
          }`}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <User className="h-5 w-5 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <p className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Operator</p>
                <p className="text-[10px] text-slate-400">Terminal 1</p>
              </div>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleThemeMode}
              className={`p-2 rounded-lg transition-colors border shadow-sm ${
                isDark 
                  ? 'bg-slate-900 -700 text-cyan-400 hover:text-white hover:bg-slate-800' 
                  : 'bg-white border-slate-200 -600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Top Navigation for Mobile */}
      <header className={`md:hidden h-16 flex items-center justify-between px-6 shrink-0 z-50 sticky top-0 border-b transition-colors duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 ${
            isDark 
              ? 'bg-cyan-950 border border-cyan-400/50 shadow-cyan-glow' 
              : 'bg-orange-600 shadow-sm'
          }`}>
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className={`text-sm font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
              isDark ? 'from-cyan-400 to-blue-200' : 'from-orange-600 to-amber-500'
            }`}>
              Khan Hardware
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {overdueCount > 0 && (
            <Link href="/cylinder" className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold animate-pulse ${
              isDark ? 'bg-red-950 border-red-900 -400' : 'bg-red-50 border-red-200 text-red-600'
            }`}>
              <AlertTriangle className="h-4 w-4" />
              <span>{overdueCount}</span>
            </Link>
          )}

          {/* Mobile Theme Toggle Button */}
          <button
            onClick={toggleThemeMode}
            className={`p-2 rounded-lg border shadow-sm ${
              isDark 
                ? '-800 -700 text-cyan-400' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg border ${
              isDark ? '-800 -700 -300' : 'bg-slate-50 -200 -600'
            }`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className={`md:hidden fixed inset-0 top-16 z-45 flex flex-col p-6 animate-fade-in border-b transition-colors duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          <nav className="space-y-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-4 rounded-xl border ${
                    isActive
                      ? isDark
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 text-white shadow-cyan-glow'
                        : 'bg-gradient-to-r from-orange-600 to-amber-600 border-orange-500/10 text-white shadow-md shadow-orange-600/10'
                      : isDark
                        ? 'bg-slate-950 border border-slate-800 text-slate-400'
                        : 'bg-slate-50 border -100 -600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-6 w-6" />
                    <span className="font-semibold text-base">{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      isActive 
                        ? 'bg-white text-orange-600' 
                        : isDark
                          ? 'bg-red-500/20 text-red-400 border -500/20'
                          : '-50 text-red-600 border border-red-100'
                    }`}>
                      {item.badge} Overdue
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-6">
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              isDark ? 'bg-slate-950/40 -800' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                <User className="h-6 w-6 text-slate-500 dark:text-slate-400" />
              </div>
              <div>
                <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Operator</p>
                <p className="text-xs text-slate-400">Terminal 1</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Banner with system alerts / status */}
        {overdueCount > 0 && pathname !== '/cylinder' && (
          <div className={`border-b py-2.5 px-6 flex items-center justify-between text-xs sm:text-sm font-medium transition-colors duration-200 ${
            isDark 
              ? 'bg-gradient-to-r from-red-950/40 via-red-900/35 to-red-950/40 border-red-900 text-red-300' 
              : 'bg-gradient-to-r from-red-50 -100 to-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 animate-bounce ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              <span>
                <strong>System Warning:</strong> You have {overdueCount} cylinder{overdueCount > 1 ? 's' : ''} overdue for return. Settle immediately.
              </span>
            </div>
            <Link 
              href="/cylinder" 
              className={`underline font-bold ml-2 ${isDark ? 'hover:text-red-200' : 'hover:text-red-900'}`}
            >
              Resolve Now &rarr;
            </Link>
          </div>
        )}

        {/* Dynamic page container */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
