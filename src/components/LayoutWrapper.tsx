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
  Moon,
  LogOut,
  ShieldCheck,
  CreditCard,
  Truck
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import LoginPage from './LoginPage';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { 
    cylinders, 
    themeMode, 
    toggleThemeMode, 
    currentUser, 
    isAuthenticated, 
    logout 
  } = useStore();
  
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

  // If user is not logged in, show Sign-In Page
  if (!isAuthenticated || !currentUser) {
    return <LoginPage />;
  }

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return isDark ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Cashier':
        return isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Driver':
        return isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

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
              <Flame className="h-6 w-6 text-white animate-pulse" />
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
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive 
                      ? 'text-white' 
                      : isDark 
                        ? 'text-slate-400 group-hover:text-slate-200' 
                        : 'text-slate-400 group-hover:text-slate-700'
                  }`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive 
                      ? 'bg-white text-orange-600' 
                      : isDark
                        ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                        : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Session Info & Theme / Logout Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className={`p-3 rounded-2xl border space-y-3 ${
            isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-orange-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-orange-600 dark:text-cyan-400" />
                </div>
                <div className="truncate">
                  <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {currentUser.name}
                  </p>
                  <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded border uppercase mt-0.5 ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleThemeMode}
                className={`p-1.5 rounded-lg transition-colors border shadow-sm ${
                  isDark 
                    ? 'bg-slate-900 border-slate-700 text-cyan-400 hover:text-white' 
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className={`w-full py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border shadow-sm ${
                isDark 
                  ? 'bg-red-950/30 hover:bg-red-900/40 border-red-900/50 text-red-400' 
                  : 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700'
              }`}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out Session
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
              isDark ? 'bg-red-950 border-red-900 text-red-400' : 'bg-red-50 border-red-200 text-red-600'
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
                ? 'bg-slate-800 border-slate-700 text-cyan-400' 
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg border ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
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
                        : 'bg-slate-50 border border-slate-200 text-slate-600'
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
                          ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                          : 'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {item.badge} Overdue
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200 dark:border-slate-800 pt-6 space-y-3">
            <div className={`flex items-center justify-between p-4 rounded-xl border ${
              isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-slate-800 flex items-center justify-center">
                  <User className="h-6 w-6 text-orange-600 dark:text-cyan-400" />
                </div>
                <div>
                  <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    {currentUser.name}
                  </p>
                  <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded border uppercase mt-0.5 ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
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
              : 'bg-gradient-to-r from-red-50 via-red-100 to-red-50 border-red-200 text-red-800'
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
