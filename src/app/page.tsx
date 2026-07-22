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
  Wallet
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
      .filter((s) => new Date(s.createdAt).toDateString() === todayStr)
      .reduce((sum, s) => sum + s.total, 0);
    setTodaySales(total);
  }, [sales]);

  // 2. Active Cylinders (Status is "Issued to Customer")
  const activeCylinders = cylinders.filter((c) => c.status === 'Issued to Customer');

  // 3. Overdue Cylinders
  const [overdueCylinders, setOverdueCylinders] = useState<Cylinder[]>([]);
  useEffect(() => {
    const today = new Date();
    const overdue = cylinders.filter(
      (c) => c.status === 'Issued to Customer' && c.customer && new Date(c.customer.expectedReturnDate) < today
    );
    setOverdueCylinders(overdue);
  }, [cylinders]);

  // 4. Low Stock Alerts (Hardware inventory)
  const { products } = useStore();
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minThreshold);

  // 5. Driver pending collections
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
        isDark ? 'bg-slate-900 -800 shadow-cyan-glow' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -z-10 pointer-events-none ${
          isDark ? 'bg-cyan-500/10' : 'bg-orange-600/5'
        }`}></div>
        <div>
          <h2 className={`text-2xl font-bold tracking-tight sm:text-3xl ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Welcome Back, Operator
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time status of Khan Hardware sales and medical/industrial oxygen cylinders.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/pos" 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-500/30 shadow-cyan-glow' 
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-orange-500/10 shadow-md shadow-orange-600/10'
            }`}
          >
            <PlusCircle className="h-4.5 w-4.5" />
            New Hardware Sale
          </Link>
          <Link 
            href="/cylinder" 
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border ${
              isDark 
                ? 'bg-slate-800 hover:-700 text-slate-200 border-slate-700' 
                : 'bg-slate-100 hover:-200 text-slate-700 border-slate-200'
            }`}
          >
            <Activity className="h-4.5 w-4.5 text-slate-400" />
            Manage Cylinders
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1: Today's Sales */}
        <div className={`border p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 group shadow-sm ${
          isDark 
            ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/40 shadow-emerald-glow' 
            : 'bg-white border-slate-200 hover:-300 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Today's Sales</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{formatCurrency(todaySales)}</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live updates active
            </p>
          </div>
        </div>

        {/* Metric 2: Active Cylinders */}
        <div className={`border p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 group shadow-sm ${
          isDark 
            ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/40 shadow-cyan-glow' 
            : 'bg-white border-slate-200 hover:-300 hover:shadow-md'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Active Cylinders Out</span>
            <span className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              isDark ? 'bg-cyan-500/10 text-cyan-400' : 'bg-orange-50 text-orange-600'
            }`}>
              <Database className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{activeCylinders.length}</h3>
            <p className="text-xs text-slate-400 mt-1">
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
              ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/45 shadow-cyan-glow-hover'
              : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Overdue Cylinders</span>
            <span className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              overdueCylinders.length > 0 
                ? isDark 
                  ? 'bg-red-500/20 text-red-400 animate-pulse' 
                  : 'bg-red-100 -600 animate-pulse' 
                : 'bg-slate-100 -400 dark:bg-slate-800 dark:text-slate-500'
            }`}>
              <AlertOctagon className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${
              overdueCylinders.length > 0 
                ? isDark ? 'text-red-400' : 'text-red-600' 
                : isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              {overdueCylinders.length}
            </h3>
            <p className={`text-xs mt-1 ${overdueCylinders.length > 0 ? 'text-red-600/90 font-semibold' : 'text-slate-400'}`}>
              {overdueCylinders.length > 0 ? 'Needs reminder alert' : 'Returned on time'}
            </p>
          </div>
        </div>

        {/* Metric 4: Low Stock Alert */}
        <div className={`p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 group border shadow-sm ${
          lowStockProducts.length > 0 
            ? isDark
              ? '-950/20 border-amber-900/60 hover:border-amber-500/45 shadow-amber-glow-hover'
              : 'bg-amber-50 border-amber-200 hover:border-amber-300'
            : isDark
              ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/45 shadow-cyan-glow-hover'
              : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Low Stock Alerts</span>
            <span className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              lowStockProducts.length > 0 
                ? isDark 
                  ? 'bg-amber-500/20 text-amber-400' 
                  : 'bg-amber-100 -600' 
                : 'bg-slate-100 -400 dark:bg-slate-800 dark:text-slate-500'
            }`}>
              <ArrowDownLeft className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${
              lowStockProducts.length > 0 
                ? isDark ? 'text-amber-400' : '-600' 
                : isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              {lowStockProducts.length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {lowStockProducts.length > 0 ? 'Below min threshold' : 'Levels stable'}
            </p>
          </div>
        </div>

        {/* Metric 5: Pending Driver Cash */}
        <div className={`p-5 rounded-2xl flex flex-col justify-between transition-all duration-300 group border shadow-sm ${
          pendingDriverCash > 0 
            ? isDark
              ? '-950/20 border-amber-900/60 hover:border-amber-500/45 shadow-amber-glow-hover'
              : 'bg-amber-50 border-amber-200 hover:border-amber-300'
            : isDark
              ? 'bg-slate-900 border-slate-800 hover:border-cyan-500/45 shadow-cyan-glow-hover'
              : 'bg-white border-slate-200 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Driver Cash Held</span>
            <span className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              pendingDriverCash > 0 
                ? isDark 
                  ? 'bg-amber-500/20 -400 animate-pulse' 
                  : 'bg-amber-100 -600 animate-pulse' 
                : 'bg-slate-100 -400 dark:bg-slate-800 dark:text-slate-500'
            }`}>
              <Wallet className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className={`text-2xl font-bold ${
              pendingDriverCash > 0 
                ? isDark ? 'text-amber-400' : '-600' 
                : isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              {formatCurrency(pendingDriverCash)}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {pendingDriverCount > 0 ? `${pendingDriverCount} cash runs pending` : 'Returned to shop'}
            </p>
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
              <h3 className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Critical Overdue Cylinder Alerts</h3>
            </div>
            <Link 
              href="/cylinder?filter=overdue" 
              className={`text-xs font-semibold hover:underline ${isDark ? 'text-cyan-400' : 'text-orange-600'}`}
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
              <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>All Clean!</p>
              <p className="text-slate-400 text-xs mt-1">No cylinders are currently overdue. Good job!</p>
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
                        <span className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>{cyl.serialNumber}</span>
                        <span className="text-[10px] bg-red-100 -700 font-bold px-1.5 py-0.2 rounded border border-red-200">
                          OVERDUE
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <p>Customer: <span className={`font-semibold ${isDark ? '-300' : 'text-slate-700'}`}>{cyl.customer?.customerName}</span></p>
                        <p>Phone: <span className={isDark ? '-300' : 'text-slate-700'}>{cyl.customer?.customerPhone}</span></p>
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
                            ? 'bg-slate-800 border-slate-700 hover:-700 text-slate-300' 
                            : 'bg-white -200 hover:bg-slate-50 text-slate-700'
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
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <h3 className={`text-md font-bold border-b pb-3 ${
              isDark ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-slate-100'
            }`}>Cylinder Status Tracker</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 -600">
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
                <div className="flex justify-between text-xs font-semibold mb-1 -600">
                  <span className="flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${isDark ? 'bg-cyan-500' : 'bg-orange-500'}`}></span>
                    With Customers
                  </span>
                  <span>{activeCylinders.length} / {cylinders.length}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  <div 
                    className={`h-full transition-all duration-500 ${isDark ? 'bg-cyan-500' : 'bg-orange-500'}`} 
                    style={{ width: `${(activeCylinders.length / cylinders.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 -600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    Returned (Empty)
                  </span>
                  <span>{cylindersReturnedEmpty} / {cylinders.length}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  <div 
                    className="bg-amber-500 h-full transition-all duration-500" 
                    style={{ width: `${(cylindersReturnedEmpty / cylinders.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 -600">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    Under Refill Process
                  </span>
                  <span>{cylindersUnderRefill} / {cylinders.length}</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'}`}>
                  <div 
                    className="bg-blue-500 h-full transition-all duration-500" 
                    style={{ width: `${(cylindersUnderRefill / cylinders.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className={`border-t pt-4 space-y-2.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Operator Panel</h4>
              
              <Link 
                href="/cylinder?action=issue" 
                className={`w-full flex items-center justify-between p-3 border text-xs font-bold rounded-xl transition-all ${
                  isDark 
                    ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 hover:-700 text-slate-200' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Truck className={`h-4 w-4 ${isDark ? 'text-cyan-400' : 'text-orange-600'}`} />
                  Issue Oxygen Cylinder
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </Link>
              
              <Link 
                href="/cylinder?action=return" 
                className={`w-full flex items-center justify-between p-3 border text-xs font-bold rounded-xl transition-all ${
                  isDark 
                    ? 'bg-slate-800/40 hover:bg-slate-800 border-slate-800 hover:-700 text-slate-200' 
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                }`}
              >
                <span className="flex items-center gap-2">
                  <ArrowDownLeft className="h-4 w-4 -600 dark:text-emerald-400" />
                  Receive Returned Cylinder
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
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
            <Wallet className="h-5 w-5 text-amber-500" />
            <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : '-800'}`}>Pending Driver Cash Collection logs</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {cylindersWithDrivers.map((cyl) => {
              const driver = workers.find(w => w.id === cyl.customer?.assignedWorkerId);
              return (
                <div 
                  key={cyl.id} 
                  className={`flex justify-between items-center p-3 border rounded-xl transition-colors ${
                    isDark 
                      ? 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/30 text-slate-200' 
                      : 'bg-amber-50/40 border-amber-100 hover:bg-amber-50 -700'
                  }`}
                >
                  <div>
                    <p className={`text-xs font-bold truncate ${isDark ? '-200' : '-800'}`}>Driver: {driver?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Cyl: {cyl.serialNumber} ({cyl.customer?.customerName})</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{formatCurrency((cyl.customer?.securityDeposit || 0) + (cyl.customer?.refillCharges || 0))}</p>
                    <Link 
                      href="/cylinder?filter=deliveries"
                      className={`text-[10px] font-bold hover:underline block mt-0.5 ${isDark ? 'text-cyan-400' : '-600'}`}
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
        <h3 className={`text-lg font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Recent Hardware Transactions</h3>
        
        <div className={`border rounded-2xl overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {sales.length === 0 ? (
            <div className={`p-8 text-center text-slate-400 text-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
              No transactions recorded today yet. Go to <Link href="/pos" className={`underline font-semibold ${isDark ? 'text-cyan-400' : 'text-orange-600'}`}>POS Checkout</Link> to start selling!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full text-left border-collapse text-xs sm:text-sm ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700'}`}>
                <thead>
                  <tr className={`border-b ${
                    isDark 
                      ? 'border-slate-800 bg-slate-900/80 text-slate-400' 
                      : 'border-slate-200 bg-slate-50 text-slate-500'
                  } font-semibold uppercase tracking-wider`}>
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
                          isDark ? 'bg-slate-800 text-slate-300' : '-100 text-slate-700'
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
