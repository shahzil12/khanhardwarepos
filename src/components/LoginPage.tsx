'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import confetti from 'canvas-confetti';

export default function LoginPage() {
  const { login, themeMode, toggleThemeMode } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isDark = themeMode === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    const success = login(username, password);
    if (success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } else {
      setErrorMessage('Invalid username or password. Please check your credentials.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-cyan-500' : 'bg-orange-500'
        }`}></div>
        <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${
          isDark ? 'bg-blue-600' : 'bg-amber-500'
        }`}></div>
      </div>

      {/* Main Login Card */}
      <div className={`w-full max-w-md border rounded-3xl p-6 sm:p-8 relative z-10 shadow-2xl transition-all duration-200 ${
        isDark 
          ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md shadow-cyan-glow' 
          : 'bg-white border-slate-200 shadow-xl'
      }`}>
        
        {/* Top Header & Theme Switcher */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 ${
              isDark 
                ? 'bg-cyan-950 border border-cyan-400/50 shadow-cyan-glow' 
                : 'bg-orange-600 shadow-md shadow-orange-600/20'
            }`}>
              <Flame className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <h1 className={`text-lg font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${
                isDark ? 'from-cyan-400 to-blue-200' : 'from-orange-600 to-amber-500'
              }`}>
                Khan Hardware
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                POS & Cylinder System
              </p>
            </div>
          </div>

          <button
            onClick={toggleThemeMode}
            className={`p-2 rounded-xl border transition-colors ${
              isDark 
                ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
            title="Toggle Theme"
          >
            {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </div>

        {/* Welcome Section */}
        <div className="my-6">
          <h2 className="text-xl font-extrabold tracking-tight">Operator Sign-In</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access Hardware POS billing and Gas Cylinder logistics.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
            {errorMessage}
          </div>
        )}

        {/* Sign-In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-xl font-semibold transition-all focus:outline-none shadow-sm ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500' 
                    : 'bg-white border-slate-200 text-slate-800 focus:border-orange-500'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 border rounded-xl font-semibold transition-all focus:outline-none shadow-sm ${
                  isDark 
                    ? 'bg-slate-950 border-slate-800 text-slate-100 focus:border-cyan-500' 
                    : 'bg-white border-slate-200 text-slate-800 focus:border-orange-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 border text-sm sm:text-base ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-500/20 shadow-cyan-glow' 
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-orange-500/10 shadow-orange-600/10'
            }`}
          >
            Sign In to Terminal
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
