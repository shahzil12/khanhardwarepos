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
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <BarChart3 className={`h-6 w-6 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            Enterprise Financial Analytics & Audit Logs
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Real-time Profit & Loss breakdown, COGS calculations, inventory stock valuation, and system security audit trail.
          </p>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales Revenue</p>
          <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{formatCurrency(grossRevenue)}</h3>
          <p className="text-xs text-emerald-600 font-bold mt-1 flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {completedSales.length} Total Sales
          </p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost of Goods Sold (COGS)</p>
          <h3 className="text-2xl font-extrabold mt-1 text-slate-700 dark:text-slate-300">{formatCurrency(totalCOGS)}</h3>
          <p className="text-xs text-slate-500 mt-1">Direct inventory vendor cost</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operating Expenses</p>
          <h3 className="text-2xl font-extrabold mt-1 text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</h3>
          <p className="text-xs text-slate-500 mt-1">Rent, wages & utilities</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Profit (Margin %)</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
            {formatCurrency(netProfit)}
          </h3>
          <p className="text-xs font-bold mt-1 text-blue-600 dark:text-cyan-400">
            {netMarginPercent}% Net Profit Margin
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('financials')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'financials'
              ? isDark ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-50 text-blue-700 border-blue-200'
              : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          P&L & Sales Analytics
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'inventory'
              ? isDark ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-50 text-blue-700 border-blue-200'
              : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          Inventory Stock Valuation
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'audit'
              ? isDark ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-50 text-blue-700 border-blue-200'
              : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
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
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Income & Expense Breakdown</h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Gross Sales Revenue:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(grossRevenue)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Less Cost of Goods Sold (COGS):</span>
                <span className="font-bold text-red-600">-{formatCurrency(totalCOGS)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800 font-bold bg-slate-50 dark:bg-slate-950/50 p-2 rounded-lg">
                <span className="text-slate-700 dark:text-slate-300">Gross Operating Profit:</span>
                <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(grossProfit)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Less Store Operating Expenses:</span>
                <span className="font-bold text-red-600">-{formatCurrency(totalExpenses)}</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-blue-600 font-extrabold text-base pt-3">
                <span className="text-slate-900 dark:text-white">Net Business Profit:</span>
                <span className="text-blue-600 dark:text-cyan-400">{formatCurrency(netProfit)}</span>
              </div>
            </div>
          </div>

          {/* Top Selling Hardware Products */}
          <div className={`p-6 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Top Performing Products</h3>
            <div className="space-y-3">
              {topSellingProducts.length === 0 ? (
                <p className="text-slate-400 text-xs">No sales data recorded yet.</p>
              ) : (
                topSellingProducts.slice(0, 5).map((prod, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 border rounded-xl dark:border-slate-800">
                    <div>
                      <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{prod.name}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{prod.qty} units sold</span>
                    </div>
                    <span className="font-extrabold text-xs text-blue-600 dark:text-cyan-400">{formatCurrency(prod.revenue)}</span>
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Asset Value (COGS)</p>
              <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{formatCurrency(totalInventoryAssetValue)}</h3>
              <p className="text-xs text-slate-500 mt-1">Asset cost valuation across {products.length} catalog items</p>
            </div>

            <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Retail Sales Value Potential</p>
              <h3 className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{formatCurrency(totalRetailValuation)}</h3>
              <p className="text-xs text-slate-500 mt-1">Expected revenue upon full stock clearance</p>
            </div>

            <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Threshold Warnings</p>
              <h3 className="text-2xl font-extrabold mt-1 text-amber-500">{lowStockCount} Products</h3>
              <p className="text-xs text-slate-500 mt-1">Requires immediate purchase order re-supply</p>
            </div>
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} font-semibold uppercase tracking-wider`}>
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
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                        {p.name}
                        <span className="block text-[10px] text-slate-400 font-mono">Barcode: {p.barcode}</span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{p.category}</td>
                      <td className="p-4">
                        <span className={`font-bold ${p.stockQuantity <= p.minThreshold ? 'text-red-500' : 'text-slate-800 dark:text-slate-200'}`}>
                          {p.stockQuantity} {p.unit || 'piece'}s
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">Rs. {p.costPrice}</td>
                      <td className="p-4 font-extrabold text-blue-600 dark:text-cyan-400">
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

      {/* Tab 3: System Audit Trail */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['ALL', 'POS', 'INVENTORY', 'VENDOR', 'DRAWER', 'SYSTEM'].map((cat) => (
              <button
                key={cat}
                onClick={() => setAuditFilter(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                  auditFilter === cat
                    ? 'bg-blue-600 text-white border-blue-500'
                    : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={`border rounded-2xl overflow-hidden shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} font-semibold uppercase tracking-wider`}>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Details / Audit Description</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium">
                      <td className="p-3 text-slate-400 font-mono text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {log.category}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-blue-600 dark:text-cyan-400">{log.action}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{log.performedBy}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
