'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Database, 
  AlertOctagon, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle, 
  PlusCircle, 
  Activity, 
  Truck, 
  MessageSquare,
  Wallet,
  History,
  RotateCcw
} from 'lucide-react';
import { useStore, Cylinder } from '@/store/useStore';
import confetti from 'canvas-confetti';
import FormattedDate from '@/components/FormattedDate';

export default function Dashboard() {
  const { cylinders, sales, workers, themeMode } = useStore();

  // 1. Calculate Today's Sales (Hardware POS transactions)
  const [todaySales, setTodaySales] = useState(0);
  useEffect(() => {
    const todayStr = new Date().toDateString();
    const total = sales
      .filter((s) => (s.status || 'Completed') !== 'Refunded' && new Date(s.createdAt).toDateString() === todayStr)
      .reduce((sum, s) => sum + s.total, 0);
    setTodaySales(total);
  }, [sales]);

  // 2. Sales & Net Profit Analytics Calculations
  const validSales = sales.filter((s) => (s.status || 'Completed') !== 'Refunded');
  
  const totalRevenue = validSales.reduce((sum, s) => sum + s.total, 0);

  const totalCogs = validSales.reduce((sum, s) => {
    const saleCogs = s.items.reduce((itemSum, item) => {
      const cost = item.costPrice !== undefined ? item.costPrice : item.unitPrice * 0.65;
      return itemSum + cost * item.quantity;
    }, 0);
    return sum + saleCogs;
  }, 0);

  const netProfit = totalRevenue - totalCogs;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // 3. Active Cylinders (Status is "Issued to Customer")
  const activeCylinders = cylinders.filter((c) => c.status === 'Issued to Customer');

  // 4. Overdue Cylinders
  const [overdueCylinders, setOverdueCylinders] = useState<Cylinder[]>([]);
  useEffect(() => {
    const today = new Date();
    const overdue = cylinders.filter(
      (c) => c.status === 'Issued to Customer' && c.customer && new Date(c.customer.expectedReturnDate) < today
    );
    setOverdueCylinders(overdue);
  }, [cylinders]);

  // 5. Low Stock Alerts (Hardware inventory)
  const { products } = useStore();
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minThreshold);

  // 6. Driver pending collections
  const cylindersWithDrivers = cylinders.filter(
    (c) => c.status === 'Issued to Customer' && c.customer?.deliveryType === 'Delivery' && !c.customer.cashReturned
  );
  
  const pendingDriverCash = cylindersWithDrivers.reduce((sum, c) => {
    const dep = c.customer?.securityDeposit || 0;
    const ref = c.customer?.refillCharges || 0;
    return sum + dep + ref;
  }, 0);

  const pendingDriverCount = new Set(cylindersWithDrivers.map(c => c.customer?.assignedWorkerId).filter(Boolean)).size;

  // Cylinder status distributions
  const cylindersInStock = cylinders.filter(c => c.status === 'Filled (In Stock)').length;
  const cylindersReturnedEmpty = cylinders.filter(c => c.status === 'Returned (Empty)').length;
  const cylindersUnderRefill = cylinders.filter(c => c.status === 'Under Refill').length;

  const isDark = themeMode === 'dark';

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Reminder message generator
  const getWhatsAppLink = (cyl: Cylinder) => {
    if (!cyl.customer) return '#';
    const message = `Salam ${cyl.customer.customerName}, this is a friendly reminder from Khan Hardware. The oxygen cylinder (${cyl.serialNumber}) issued on ${cyl.customer.issueDate.split('T')[0]} was due on ${cyl.customer.expectedReturnDate.split('T')[0]}. Please return it to settle the security deposit of Rs. ${cyl.customer.securityDeposit}. Thank you!`;
    const cleanPhone = cyl.customer.customerPhone.replace(/[^0-9+]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Welcome Banner */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 border rounded-2xl relative overflow-hidden transition-all duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800 shadow-amber-glow' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -z-10 pointer-events-none ${
          isDark ? 'bg-amber-500/10' : 'bg-amber-500/10'
        }`}></div>
        <div>
          <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome Back, Operator
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real-time status of Khan Hardware sales, profit analytics, and medical/industrial oxygen cylinders.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/pos" 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
              isDark 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-500/30 shadow-amber-glow' 
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-500/20 shadow-md shadow-amber-600/15'
            }`}
          >
            <PlusCircle className="h-4.5 w-4.5" />
            New Hardware Sale
          </Link>
          <Link 
            href="/cylinder" 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
            }`}
          >
            <Activity className={`h-4.5 w-4.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            Manage Cylinders
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Today's Sales */}
        <div className={`border p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 group shadow-sm ${
          isDark 
            ? 'bg-slate-900 border-slate-800 hover:border-amber-500/40 shadow-amber-glow' 
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Today's Sales</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(todaySales)}</h3>
            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-1 font-semibold">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
              Live updates active
            </p>
          </div>
        </div>

        {/* Metric 2: Active Cylinders */}
        <div className={`border p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 group shadow-sm ${
          isDark 
            ? 'bg-slate-900 border-slate-800 hover:border-amber-500/40 shadow-amber-glow' 
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active Cylinders Out</span>
            <span className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'
            }`}>
              <Database className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{activeCylinders.length}</h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Currently with customers
            </p>
          </div>
        </div>

        {/* Metric 3: Overdue Cylinders */}
        <div className={`p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 group border shadow-sm ${
          overdueCylinders.length > 0 
            ? isDark
              ? 'bg-red-950/20 border-red-900/60 hover:border-red-500/40 shadow-red-glow-hover'
              : 'bg-red-50 border-red-200 hover:border-red-300'
            : isDark
              ? 'bg-slate-900 border-slate-800 hover:border-amber-500/45 shadow-amber-glow-hover'
              : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Overdue Cylinders</span>
            <span className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              overdueCylinders.length > 0 
                ? isDark 
                  ? 'bg-red-500/20 text-red-400 animate-pulse' 
                  : 'bg-red-100 text-red-700 animate-pulse' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <AlertOctagon className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${
              overdueCylinders.length > 0 
                ? isDark ? 'text-red-400' : 'text-red-700' 
                : isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {overdueCylinders.length}
            </h3>
            <p className={`text-xs mt-1 ${overdueCylinders.length > 0 ? 'text-red-700 font-semibold' : isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {overdueCylinders.length > 0 ? 'Needs reminder alert' : 'Returned on time'}
            </p>
          </div>
        </div>

        {/* Metric 4: Low Stock Alert */}
        <div className={`p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 group border shadow-sm ${
          lowStockProducts.length > 0 
            ? isDark
              ? 'bg-emerald-950/20 border-emerald-900/60 hover:border-emerald-500/45 shadow-emerald-glow'
              : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300'
            : isDark
              ? 'bg-slate-900 border-slate-800 hover:border-amber-500/45 shadow-amber-glow-hover'
              : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Low Stock Alerts</span>
            <span className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              lowStockProducts.length > 0 
                ? isDark 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-emerald-100 text-emerald-700' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <ArrowDownLeft className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${
              lowStockProducts.length > 0 
                ? isDark ? 'text-emerald-400' : 'text-emerald-700' 
                : isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {lowStockProducts.length}
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {lowStockProducts.length > 0 ? 'Below min threshold' : 'Levels stable'}
            </p>
          </div>
        </div>

        {/* Metric 5: Pending Driver Cash */}
        <div className={`p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 group border shadow-sm ${
          pendingDriverCash > 0 
            ? isDark
              ? 'bg-amber-950/20 border-amber-900/60 hover:border-amber-500/45 shadow-amber-glow'
              : 'bg-amber-50 border-amber-200 hover:border-amber-300'
            : isDark
              ? 'bg-slate-900 border-slate-800 hover:border-amber-500/45 shadow-amber-glow-hover'
              : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold tracking-wider uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Driver Cash Held</span>
            <span className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              pendingDriverCash > 0 
                ? isDark 
                  ? 'bg-amber-500/20 text-amber-400 animate-pulse' 
                  : 'bg-amber-100 text-amber-800 animate-pulse' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              <Wallet className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${
              pendingDriverCash > 0 
                ? isDark ? 'text-amber-400' : 'text-amber-800' 
                : isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {formatCurrency(pendingDriverCash)}
            </h3>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {pendingDriverCount > 0 ? `${pendingDriverCount} cash runs pending` : 'Returned to shop'}
            </p>
          </div>
        </div>

      </div>

      {/* 2. Sales & Net Profit Analytics Section */}
      <div className={`p-6 border rounded-2xl space-y-6 shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-amber-glow' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              Sales & Net Profit Analytics
            </h3>
            <p className={`text-xs sm:text-sm mt-0.5 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Real-time sales revenue, Cost of Goods Sold (COGS), net profit margins, and refund tracking.
            </p>
          </div>

          <Link
            href="/pos"
            className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-1.5 self-start sm:self-auto transition-all ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
            }`}
          >
            <History className="h-4 w-4" />
            Open Invoice History
          </Link>
        </div>

        {/* Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Gross Revenue */}
          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Gross Sales Revenue</span>
            <h4 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(totalRevenue)}</h4>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Valid non-refunded transactions</p>
          </div>

          {/* Card 2: Cost of Goods Sold (COGS) */}
          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Cost of Goods (COGS)</span>
            <h4 className={`text-2xl font-extrabold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatCurrency(totalCogs)}</h4>
            <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Inventory item unit cost base</p>
          </div>

          {/* Card 3: Net Profit */}
          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-amber-950/30 border-amber-900/50' : 'bg-amber-50/80 border-amber-200'}`}>
            <span className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center justify-between">
              Net Profit
              <ArrowUpRight className="h-4 w-4 text-amber-700 dark:text-amber-400" />
            </span>
            <h4 className="text-2xl font-extrabold text-amber-900 dark:text-amber-400">{formatCurrency(netProfit)}</h4>
            <p className="text-[11px] text-amber-800/90 dark:text-amber-300/80 font-medium">Total Revenue - Total COGS</p>
          </div>

          {/* Card 4: Net Margin % */}
          <div className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-orange-950/30 border-orange-900/50' : 'bg-orange-50/80 border-orange-200'}`}>
            <span className="text-xs font-bold text-orange-900 dark:text-amber-400 uppercase tracking-wider">Profit Margin</span>
            <h4 className="text-2xl font-extrabold text-orange-900 dark:text-amber-300">{profitMargin}%</h4>
            <p className="text-[11px] text-orange-800/90 dark:text-orange-300/80 font-medium">Average return rate per sale</p>
          </div>

        </div>
      </div>

      {/* Main Grid: Overdue Alerts & Cylinder Status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overdue Alerts Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
              <h3 className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Critical Overdue Cylinder Alerts</h3>
            </div>
            <Link 
              href="/cylinder?filter=overdue" 
              className={`text-xs font-bold hover:underline ${isDark ? 'text-amber-400' : 'text-amber-800'}`}
            >
              View All Overdue &rarr;
            </Link>
          </div>

          {overdueCylinders.length === 0 ? (
            <div className={`border rounded-2xl p-8 text-center flex flex-col items-center justify-center shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="p-3 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full mb-3">
                <CheckCircle className="h-6 w-6" />
              </div>
              <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>All Clean!</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No cylinders are currently overdue. Good job!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overdueCylinders.map((cyl) => {
                const returnDateStr = cyl.customer?.expectedReturnDate 
                  ? new Date(cyl.customer.expectedReturnDate).toLocaleDateString()
                  : '';
                return (
                  <div 
                    key={cyl.id} 
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl transition-all shadow-sm ${
                      isDark 
                        ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/20' 
                        : 'bg-red-50/40 border-red-100 hover:bg-red-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{cyl.serialNumber}</span>
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded border border-red-200">
                          OVERDUE
                        </span>
                      </div>
                      <div className={`grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        <p>Customer: <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>{cyl.customer?.customerName}</span></p>
                        <p>Phone: <span className={isDark ? 'text-slate-300' : 'text-slate-900'}>{cyl.customer?.customerPhone}</span></p>
                        <p>Issued: <FormattedDate dateString={cyl.customer!.issueDate} /></p>
                        <p className="text-red-600 font-semibold">Expected: {returnDateStr}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <a 
                        href={getWhatsAppLink(cyl)}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Remind WhatsApp
                      </a>
                      <Link
                        href={`/cylinder?filter=overdue`}
                        className={`px-3 py-1.5 border text-xs font-bold rounded-lg transition-colors ${
                          isDark 
                            ? 'bg-slate-800 border-slate-700 hover:border-slate-700 text-slate-300' 
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        Settle Return
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Cylinder Stock Breakdown */}
        <div className="space-y-6">
          <div className={`border rounded-2xl p-5 space-y-5 shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <h3 className={`text-md font-bold border-b pb-3 ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-900 border-slate-100'
            }`}>Cylinder Status Tracker</h3>
            
            <div className="space-y-4">
              <div>
                <div className={`flex justify-between text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Filled / In Stock
                  </span>
                  <span>{cylindersInStock} / {cylinders.length}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${(cylindersInStock / cylinders.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className={`flex justify-between text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    With Customers
                  </span>
                  <span>{activeCylinders.length} / {cylinders.length}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  <div 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    style={{ width: `${(activeCylinders.length / cylinders.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className={`flex justify-between text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                    Returned (Empty)
                  </span>
                  <span>{cylindersReturnedEmpty} / {cylinders.length}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  <div 
                    className="bg-teal-500 h-full transition-all duration-500" 
                    style={{ width: `${(cylindersReturnedEmpty / cylinders.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className={`flex justify-between text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                    Under Refill Process
                  </span>
                  <span>{cylindersUnderRefill} / {cylinders.length}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  <div 
                    className="bg-orange-500 h-full transition-all duration-500" 
                    style={{ width: `${(cylindersUnderRefill / cylinders.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className={`border-t pt-4 space-y-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h4 className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Operator Panel</h4>
              
              <Link 
                href="/cylinder?action=issue" 
                className={`w-full flex items-center justify-between p-3 border text-xs font-bold rounded-xl transition-all ${
                  isDark 
                    ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-200' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Truck className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                  Issue Oxygen Cylinder
                </span>
                <ArrowUpRight className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              </Link>
              
              <Link 
                href="/cylinder?action=return" 
                className={`w-full flex items-center justify-between p-3 border text-xs font-bold rounded-xl transition-all ${
                  isDark 
                    ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-200' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  Receive Returned Cylinder
                </span>
                <ArrowUpRight className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
              </Link>
            </div>
            
          </div>
        </div>

      </div>

      {/* Driver Cash Alerts */}
      {cylindersWithDrivers.length > 0 && (
        <div className={`border rounded-2xl p-5 space-y-4 shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className={`flex items-center gap-2 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <Wallet className="h-5 w-5 text-emerald-500" />
            <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Pending Driver Cash Collection logs</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {cylindersWithDrivers.map((cyl) => {
              const driver = workers.find(w => w.id === cyl.customer?.assignedWorkerId);
              return (
                <div 
                  key={cyl.id} 
                  className={`flex justify-between items-center p-3 border rounded-xl transition-colors min-w-0 ${
                    isDark 
                      ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/30 text-slate-200' 
                      : 'bg-amber-50/40 border-amber-100 hover:bg-amber-50 text-slate-800'
                  }`}
                >
                  <div className="min-w-0 flex-1 mr-3">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Driver: {driver?.name || 'Unknown'}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-600'}`} title={`Cyl: ${cyl.serialNumber} (${cyl.customer?.customerName})`}>Cyl: {cyl.serialNumber} ({cyl.customer?.customerName})</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{formatCurrency((cyl.customer?.securityDeposit || 0) + (cyl.customer?.refillCharges || 0))}</p>
                    <Link 
                      href="/cylinder?filter=deliveries"
                      className={`text-[10px] font-bold hover:underline block mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-800'}`}
                    >
                      Settle Cash &rarr;
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity Table (Hardware Sales) */}
      <div className="space-y-4">
        <h3 className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Recent Hardware Transactions</h3>
        
        <div className={`border rounded-2xl overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {sales.length === 0 ? (
            <div className={`p-8 text-center text-sm ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-600'}`}>
              No transactions recorded today yet. Go to <Link href="/pos" className={`underline font-bold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>POS Checkout</Link> to start selling!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full text-left border-collapse text-xs sm:text-sm ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-800'}`}>
                <thead>
                  <tr className={`border-b ${
                    isDark 
                      ? 'border-slate-800 bg-slate-900/80 text-slate-400' 
                      : 'border-slate-200 bg-slate-100 text-slate-700'
                  } font-bold uppercase tracking-wider`}>
                    <th className="p-4">Time</th>
                    <th className="p-4">Items / Description</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Subtotal</th>
                    <th className="p-4">Tax (GST)</th>
                    <th className="p-4">Grand Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {sales.map((sale) => (
                    <tr key={sale.id} className={`border-b hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium ${
                      isDark ? 'border-slate-800/60' : 'border-slate-100'
                    }`}>
                      <td className="p-4">
                        {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <div className="max-w-xs sm:max-w-sm truncate">
                          {sale.items.map(item => `${item.productName} (x${item.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="p-4">{formatCurrency(sale.subtotal)}</td>
                      <td className="p-4">{formatCurrency(sale.tax)}</td>
                      <td className={`p-4 font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{formatCurrency(sale.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

