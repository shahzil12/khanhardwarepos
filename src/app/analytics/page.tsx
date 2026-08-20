'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  FileText,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AnalyticsPage() {
  const { sales, products, expenses, auditLogs, themeMode } = useStore();
  const isDark = themeMode === 'dark';

  const [activeTab, setActiveTab] = useState<'financials' | 'inventory' | 'audit'>('financials');
  const [auditFilter, setAuditFilter] = useState<string>('ALL');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Calculations
  const completedSales = sales.filter(s => s.status === 'Completed');
  const grossRevenue = completedSales.reduce((sum, s) => sum + s.total, 0);

  const totalCOGS = completedSales.reduce((sum, s) => {
    const saleCOGS = s.items.reduce((iSum, item) => iSum + (item.costPrice || 0) * item.quantity, 0);
    return sum + saleCOGS;
  }, 0);

  const grossProfit = grossRevenue - totalCOGS;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const netMarginPercent = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : '0.0';

  // Stock Valuation
  const totalInventoryAssetValue = products.reduce((sum, p) => sum + p.costPrice * p.stockQuantity, 0);
  const totalRetailValuation = products.reduce((sum, p) => sum + p.retailPrice * p.stockQuantity, 0);
  const lowStockCount = products.filter(p => p.stockQuantity <= p.minThreshold).length;

  // Top Selling Items
  const productSalesMap: { [name: string]: { qty: number; revenue: number } } = {};
  completedSales.forEach(s => {
    s.items.forEach(item => {
      if (!productSalesMap[item.productName]) {
        productSalesMap[item.productName] = { qty: 0, revenue: 0 };
      }
      productSalesMap[item.productName].qty += item.quantity;
      productSalesMap[item.productName].revenue += item.totalPrice;
    });
  });

  const topSellingProducts = Object.entries(productSalesMap)
    .map(([name, data]) => ({ name, qty: data.qty, revenue: data.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  const filteredLogs = auditFilter === 'ALL' 
    ? auditLogs 
    : auditLogs.filter(l => l.category === auditFilter);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <BarChart3 className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
            Enterprise Financial Analytics & Audit Logs
          </h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Real-time Profit & Loss breakdown, COGS calculations, inventory stock valuation, and system security audit trail.
          </p>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Gross Sales Revenue</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(grossRevenue)}</h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {completedSales.length} Total Sales
          </p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Cost of Goods Sold (COGS)</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatCurrency(totalCOGS)}</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Direct inventory vendor cost</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Operating Expenses</p>
          <h3 className="text-2xl font-extrabold mt-1 text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Rent, wages & utilities</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Net Profit (Margin %)</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </h3>
          <p className={`text-xs font-bold mt-1 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
            {netMarginPercent}% Net Profit Margin
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`flex gap-2 border-b pb-3 no-scrollbar overflow-x-auto ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => setActiveTab('financials')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'financials'
              ? isDark ? 'bg-amber-600 text-white border-amber-500 shadow-amber-glow' : 'bg-amber-50 text-amber-900 border-amber-300 shadow-sm'
              : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
        >
          P&L & Sales Analytics
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'inventory'
              ? isDark ? 'bg-amber-600 text-white border-amber-500 shadow-amber-glow' : 'bg-amber-50 text-amber-900 border-amber-300 shadow-sm'
              : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
        >
          Inventory Stock Valuation
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'audit'
              ? isDark ? 'bg-amber-600 text-white border-amber-500 shadow-amber-glow' : 'bg-amber-50 text-amber-900 border-amber-300 shadow-sm'
              : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900'
          }`}
        >
          System Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* Tab 1: P&L & Top Products */}
      {activeTab === 'financials' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* P&L Statement breakdown */}
          <div className={`p-6 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Income & Expense Breakdown</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className={`flex justify-between py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Gross Sales Revenue:</span>
                <span className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(grossRevenue)}</span>
              </div>
              <div className={`flex justify-between py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Less Cost of Goods Sold (COGS):</span>
                <span className="font-bold text-red-600">-{formatCurrency(totalCOGS)}</span>
              </div>
              <div className={`flex justify-between py-2 border-b font-bold p-2 rounded-lg ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                <span className={isDark ? 'text-slate-300' : 'text-slate-800'}>Gross Operating Profit:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(grossProfit)}</span>
              </div>
              <div className={`flex justify-between py-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Less Store Operating Expenses:</span>
                <span className="font-bold text-red-600">-{formatCurrency(totalExpenses)}</span>
              </div>
              <div className={`flex justify-between py-3 border-t-2 border-amber-500 font-extrabold text-base pt-3`}>
                <span className={isDark ? 'text-white' : 'text-slate-900'}>Net Business Profit:</span>
                <span className={isDark ? 'text-amber-400' : 'text-amber-800'}>{formatCurrency(netProfit)}</span>
              </div>
            </div>
          </div>

          {/* Top Selling Hardware Products */}
          <div className={`p-6 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Top Performing Products</h3>
            <div className="space-y-3">
              {topSellingProducts.length === 0 ? (
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No sales data recorded yet.</p>
              ) : (
                topSellingProducts.slice(0, 5).map((prod, idx) => (
                  <div key={idx} className={`flex justify-between items-center p-3 border rounded-xl ${isDark ? 'border-slate-800 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'}`}>
                    <div>
                      <p className={`font-bold text-xs ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{prod.name}</p>
                      <span className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{prod.qty} units sold</span>
                    </div>
                    <span className={`font-extrabold text-xs ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>{formatCurrency(prod.revenue)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inventory Valuation */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Stock Asset Value (COGS)</p>
              <h3 className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{formatCurrency(totalInventoryAssetValue)}</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Asset cost valuation across {products.length} catalog items</p>
            </div>

            <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Retail Sales Value Potential</p>
              <h3 className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRetailValuation)}</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Expected revenue upon full stock clearance</p>
            </div>

            <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Low Stock Threshold Warnings</p>
              <h3 className="text-2xl font-extrabold mt-1 text-amber-500">{lowStockCount} Products</h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Requires immediate purchase order re-supply</p>
            </div>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className={`w-full text-left border-collapse text-xs sm:text-sm ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-800'}`}>
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-700'} font-bold uppercase tracking-wider`}>
                    <th className="p-4">Item & Barcode</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Current Stock</th>
                    <th className="p-4">Unit Cost Price</th>
                    <th className="p-4">Total Inventory Valuation</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium">
                      <td className={`p-4 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                        {p.name}
                        <span className={`block text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Barcode: {p.barcode}</span>
                      </td>
                      <td className={`p-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{p.category}</td>
                      <td className="p-4">
                        <span className={`font-bold ${p.stockQuantity <= p.minThreshold ? 'text-red-600' : isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                          {p.stockQuantity} {p.unit || 'piece'}s
                        </span>
                      </td>
                      <td className={`p-4 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>Rs. {p.costPrice}</td>
                      <td className={`p-4 font-extrabold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                        {formatCurrency(p.costPrice * p.stockQuantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System Security Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {['ALL', 'POS', 'INVENTORY', 'VENDOR', 'DRAWER', 'SYSTEM'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setAuditFilter(cat)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                    auditFilter === cat
                      ? isDark ? 'bg-amber-600 text-white border-amber-500' : 'bg-amber-100 text-amber-900 border-amber-300'
                      : isDark ? 'bg-slate-900 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className={`w-full text-left border-collapse text-xs sm:text-sm ${isDark ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-800'}`}>
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-slate-100 text-slate-700'} font-bold uppercase tracking-wider`}>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Operator</th>
                    <th className="p-4">Details Log</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={`p-8 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No system audit logs found.</td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium">
                        <td className={`p-4 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded border ${
                            log.category === 'SYSTEM' ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400' :
                            log.category === 'POS' ? 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400' :
                            'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                          }`}>
                            {log.category}
                          </span>
                        </td>
                        <td className={`p-4 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{log.action}</td>
                        <td className={`p-4 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{log.performedBy}</td>
                        <td className={`p-4 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
