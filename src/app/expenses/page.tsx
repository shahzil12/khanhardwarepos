'use client';

import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  DollarSign, 
  Receipt, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  X,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { useStore, Expense, CashDrawerReconciliation } from '@/store/useStore';

export default function ExpensesPage() {
  const { 
    expenses, 
    reconciliations, 
    openingFloat, 
    sales, 
    addExpense, 
    setOpeningFloat, 
    reconcileCashDrawer, 
    themeMode 
  } = useStore();

  const isDark = themeMode === 'dark';

  const [activeTab, setActiveTab] = useState<'expenses' | 'drawer'>('expenses');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isReconcileOpen, setIsReconcileOpen] = useState(false);

  // Add Expense State
  const [category, setCategory] = useState<Expense['category']>('Utilities');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Cash Drawer State
  const [newOpeningFloat, setNewOpeningFloat] = useState(String(openingFloat));
  const [actualClosingCash, setActualClosingCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const today = new Date().toISOString().split('T')[0];

  const todayCashSales = sales
    .filter(s => s.createdAt.startsWith(today) && s.paymentMethod === 'Cash' && s.status === 'Completed')
    .reduce((sum, s) => sum + s.total, 0);

  const todayCashRefunds = sales
    .filter(s => s.refundedAt && s.refundedAt.startsWith(today) && s.paymentMethod === 'Cash')
    .reduce((sum, s) => sum + s.total, 0);

  const todayExpenses = expenses
    .filter(e => e.createdAt.startsWith(today))
    .reduce((sum, e) => sum + e.amount, 0);

  const expectedDrawerCash = openingFloat + todayCashSales - todayCashRefunds - todayExpenses;

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    addExpense(category, parseFloat(amount), description);
    setAmount('');
    setDescription('');
    setIsAddExpenseOpen(false);
  };

  const handleReconcileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualClosingCash) return;
    reconcileCashDrawer(parseFloat(actualClosingCash), closingNotes);
    setActualClosingCash('');
    setClosingNotes('');
    setIsReconcileOpen(false);
  };

  const handleUpdateOpeningFloat = (e: React.FormEvent) => {
    e.preventDefault();
    setOpeningFloat(parseFloat(newOpeningFloat) || 0);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Wallet className={`h-6 w-6 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
            Expense & Cash Drawer Management
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Log store operational expenses, track petty cash outflow, and perform end-of-day drawer reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl transition-all shadow-sm ${
              isDark 
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Plus className="h-4.5 w-4.5 text-slate-500" />
            Log Expense
          </button>

          <button
            onClick={() => setIsReconcileOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl transition-all shadow-sm ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 text-white shadow-cyan-glow' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-500/10 shadow-md shadow-blue-600/10'
            }`}
          >
            <ShieldCheck className="h-4.5 w-4.5" />
            End-of-Day Drawer Close
          </button>
        </div>
      </div>

      {/* Live Cash Drawer Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opening Cash Float</p>
          <h3 className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-slate-100">{formatCurrency(openingFloat)}</h3>
          <form onSubmit={handleUpdateOpeningFloat} className="mt-2 flex gap-1.5">
            <input
              type="number"
              value={newOpeningFloat}
              onChange={(e) => setNewOpeningFloat(e.target.value)}
              className={`w-24 px-2 py-0.5 text-xs border rounded-lg ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-300'}`}
            />
            <button type="submit" className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-lg">Set</button>
          </form>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Cash Sales</p>
          <h3 className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{formatCurrency(todayCashSales)}</h3>
          <p className="text-xs text-slate-500 mt-1">Net cash collected at checkout</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Petty Expenses</p>
          <h3 className="text-2xl font-extrabold mt-1 text-red-600 dark:text-red-400">{formatCurrency(todayExpenses)}</h3>
          <p className="text-xs text-slate-500 mt-1">Utilities, fuel & wages</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expected Drawer Cash</p>
          <h3 className="text-2xl font-extrabold mt-1 text-blue-600 dark:text-cyan-400">{formatCurrency(expectedDrawerCash)}</h3>
          <p className="text-xs text-slate-500 mt-1">Opening + Sales - Expenses</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-3 border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'expenses'
              ? isDark ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-50 text-blue-700 border-blue-200'
              : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          Expense Ledger ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('drawer')}
          className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
            activeTab === 'drawer'
              ? isDark ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-50 text-blue-700 border-blue-200'
              : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          Drawer Reconciliations ({reconciliations.length})
        </button>
      </div>

      {/* Content Views */}
      {activeTab === 'expenses' ? (
        <div className={`border rounded-2xl overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} font-semibold uppercase tracking-wider`}>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Logged By</th>
                  <th className="p-4 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">No expenses recorded yet.</td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium">
                      <td className="p-4 text-slate-500 dark:text-slate-400">{new Date(expense.createdAt).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          expense.category === 'Rent' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400' :
                          expense.category === 'Utilities' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400' :
                          expense.category === 'Staff Wages' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400' :
                          'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{expense.description}</td>
                      <td className="p-4 text-slate-600 dark:text-slate-400">{expense.createdBy}</td>
                      <td className="p-4 text-right font-extrabold text-red-600 dark:text-red-400">
                        {formatCurrency(expense.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={`border rounded-2xl overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} font-semibold uppercase tracking-wider`}>
                  <th className="p-4">Date</th>
                  <th className="p-4">Opening Float</th>
                  <th className="p-4">Cash Sales</th>
                  <th className="p-4">Expected Closing</th>
                  <th className="p-4">Actual Counted</th>
                  <th className="p-4">Discrepancy Variance</th>
                  <th className="p-4 text-right">Closed By</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {reconciliations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">No drawer reconciliation records found.</td>
                  </tr>
                ) : (
                  reconciliations.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{rec.date}</td>
                      <td className="p-4">{formatCurrency(rec.openingFloat)}</td>
                      <td className="p-4 text-emerald-600 font-bold">{formatCurrency(rec.cashSales)}</td>
                      <td className="p-4 font-bold">{formatCurrency(rec.expectedClosingCash)}</td>
                      <td className="p-4 font-extrabold text-blue-600">{formatCurrency(rec.actualClosingCash)}</td>
                      <td className="p-4 font-bold">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs ${
                          rec.discrepancy === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          rec.discrepancy < 0 ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {rec.discrepancy === 0 ? 'Balanced' : `${rec.discrepancy > 0 ? '+' : ''}${formatCurrency(rec.discrepancy)}`}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-500">{rec.closedBy}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Add Expense */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                Log Petty Cash Expense
              </h3>
              <button onClick={() => setIsAddExpenseOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Expense Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className={`w-full px-3.5 py-2 border rounded-xl font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                >
                  <option value="Utilities">Utilities (Electricity, Gas, Water)</option>
                  <option value="Rent">Rent & Space Maintenance</option>
                  <option value="Staff Wages">Staff Daily Wages & Allowances</option>
                  <option value="Transportation">Transportation & Vehicle Fuel</option>
                  <option value="Maintenance">Equipment & Tool Maintenance</option>
                  <option value="Misc">Miscellaneous Expenses</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Expense Amount (PKR)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl font-bold text-lg ${isDark ? 'bg-slate-950 border-slate-800 text-cyan-400' : 'bg-white border-slate-300 text-red-600'}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Description / Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Delivery van fuel refill"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Save Expense Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Reconcile Cash Drawer */}
      {isReconcileOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                End-of-Day Drawer Close
              </h3>
              <button onClick={() => setIsReconcileOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl space-y-2 mb-4 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Opening Cash Float:</span>
                <span className="font-bold">{formatCurrency(openingFloat)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Today's Cash Sales:</span>
                <span className="font-bold text-emerald-600">+{formatCurrency(todayCashSales)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Today's Expenses:</span>
                <span className="font-bold text-red-600">-{formatCurrency(todayExpenses)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-sm">
                <span>Expected Drawer Cash:</span>
                <span className="text-blue-600 dark:text-cyan-400">{formatCurrency(expectedDrawerCash)}</span>
              </div>
            </div>

            <form onSubmit={handleReconcileSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Actual Physical Cash Counted (PKR)</label>
                <input
                  type="number"
                  required
                  placeholder={String(expectedDrawerCash)}
                  value={actualClosingCash}
                  onChange={(e) => setActualClosingCash(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl font-bold text-lg ${isDark ? 'bg-slate-950 border-slate-800 text-cyan-400' : 'bg-white border-slate-300 text-blue-600'}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Closing Notes / Discrepancy Reason</label>
                <input
                  type="text"
                  placeholder="e.g. All cash verified against receipts"
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Perform Reconcile & Close Drawer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
