'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  DollarSign, 
  UserCheck, 
  Phone, 
  CreditCard, 
  FileText, 
  X,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useStore, CustomerKhata } from '@/store/useStore';

export default function KhataPage() {
  const { khatas, addKhataCustomer, recordKhataPayment, themeMode } = useStore();
  const isDark = themeMode === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedKhata, setSelectedKhata] = useState<CustomerKhata | null>(null);
  const [viewHistoryKhata, setViewHistoryKhata] = useState<CustomerKhata | null>(null);

  // Add Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnic, setCnic] = useState('');
  const [creditLimit, setCreditLimit] = useState('50000');

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) return;
    addKhataCustomer(customerName, phone, cnic, parseFloat(creditLimit) || 50000);
    setCustomerName('');
    setPhone('');
    setCnic('');
    setCreditLimit('50000');
    setIsAddCustomerOpen(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKhata || !paymentAmount) return;
    recordKhataPayment(selectedKhata.id, parseFloat(paymentAmount), paymentReference);
    setSelectedKhata(null);
    setPaymentAmount('');
    setPaymentReference('');
    setIsRecordPaymentOpen(false);
  };

  const filteredKhatas = khatas.filter(k => 
    k.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    k.phone.includes(searchQuery)
  );

  const totalReceivables = khatas.reduce((sum, k) => sum + k.currentBalance, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header bar */}
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <BookOpen className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
            Customer Credit Khata Ledger
          </h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Track customer accounts receivable, credit limits, debt sales, and cash collection receipts.
          </p>
        </div>

        <button
          onClick={() => setIsAddCustomerOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl transition-all shadow-sm ${
            isDark 
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-500/20 text-white shadow-amber-glow' 
              : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-500/10 shadow-md shadow-amber-600/15'
          }`}
        >
          <Plus className="h-4.5 w-4.5" />
          Create Customer Khata
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Accounts Receivable</p>
          <h3 className="text-2xl font-extrabold mt-1 text-red-600 dark:text-red-400">{formatCurrency(totalReceivables)}</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Outstanding customer credit debt</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Active Credit Customers</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{khatas.length}</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Verified Khata account holders</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Overdue Reminders</p>
          <h3 className="text-2xl font-extrabold mt-1 text-amber-500">{khatas.filter(k => k.currentBalance > k.creditLimit * 0.8).length}</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Accounts above 80% credit limit</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className={`p-4 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="relative max-w-md">
          <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            placeholder="Search Customer Name or Phone Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm transition-colors ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-amber-500 placeholder:text-slate-500' 
                : 'bg-white border-slate-200 text-slate-900 focus:border-amber-500 placeholder:text-slate-500'
            }`}
          />
        </div>
      </div>

      {/* Customer Directory Table */}
      <div className={`border rounded-2xl overflow-hidden shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} font-semibold uppercase tracking-wider`}>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Credit Limit</th>
                <th className="p-4">Current Debt Balance</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
              {filteredKhatas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">No Khata customer accounts found.</td>
                </tr>
              ) : (
                filteredKhatas.map((khata) => (
                  <tr key={khata.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium">
                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">
                      {khata.customerName}
                      {khata.cnic && <span className="block text-[10px] text-slate-400 font-normal">CNIC: {khata.cnic}</span>}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">{khata.phone}</td>
                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-400">{formatCurrency(khata.creditLimit)}</td>
                    <td className="p-4">
                      <span className={`font-extrabold text-sm ${khata.currentBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {formatCurrency(khata.currentBalance)}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">{new Date(khata.updatedAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewHistoryKhata(khata)}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                      >
                        Ledger History
                      </button>

                      <button
                        onClick={() => {
                          setSelectedKhata(khata);
                          setPaymentAmount(String(khata.currentBalance));
                          setIsRecordPaymentOpen(true);
                        }}
                        disabled={khata.currentBalance <= 0}
                        className={`px-3 py-1.5 font-bold text-xs rounded-xl border transition-all ${
                          khata.currentBalance > 0
                            ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-500 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                        }`}
                      >
                        Collect Payment
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add Khata Customer */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Register New Khata Customer
              </h3>
              <button onClick={() => setIsAddCustomerOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Customer / Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chaudhry Construction Co."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +923001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">CNIC (Optional)</label>
                  <input
                    type="text"
                    placeholder="35201-1234567-9"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Credit Limit (PKR)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded-xl font-bold ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Create Khata Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Record Khata Payment */}
      {isRecordPaymentOpen && selectedKhata && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Collect Khata Debt Payment
              </h3>
              <button onClick={() => setIsRecordPaymentOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl mb-4 border border-emerald-200 dark:border-emerald-900/50">
              <p className="text-xs text-slate-500">Customer: <strong className="text-slate-800 dark:text-slate-200">{selectedKhata.customerName}</strong></p>
              <p className="text-xs text-slate-500 mt-1">Current Outstanding Debt: <strong className="text-red-600">{formatCurrency(selectedKhata.currentBalance)}</strong></p>
            </div>
            <form onSubmit={handlePaymentSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Collection Amount (PKR)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl font-bold text-lg ${isDark ? 'bg-slate-950 border-slate-800 text-cyan-400' : 'bg-white border-slate-300 text-emerald-600'}`}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 mb-1">Receipt Reference / Payment Method</label>
                <input
                  type="text"
                  placeholder="e.g. Cash Receipt #8821 or Bank Transfer"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Issue Payment Collection Receipt
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: View Ledger History */}
      {viewHistoryKhata && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col max-h-[85vh] ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div>
                <h3 className="text-lg font-bold">{viewHistoryKhata.customerName} - Credit Statement</h3>
                <p className="text-xs text-slate-500">{viewHistoryKhata.phone} • Limit: {formatCurrency(viewHistoryKhata.creditLimit)}</p>
              </div>
              <button onClick={() => setViewHistoryKhata(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar space-y-3">
              {viewHistoryKhata.transactions.length === 0 ? (
                <p className="text-slate-400 text-center py-8 text-xs">No Khata transactions logged yet.</p>
              ) : (
                viewHistoryKhata.transactions.map((tx) => (
                  <div key={tx.id} className={`p-3 border rounded-xl flex items-center justify-between text-xs ${
                    tx.type === 'DEBIT_SALE' 
                      ? 'bg-red-50/20 border-red-200 text-slate-700 dark:text-slate-300' 
                      : 'bg-emerald-50/20 border-emerald-200 text-slate-700 dark:text-slate-300'
                  }`}>
                    <div>
                      <span className={`font-bold flex items-center gap-1 text-xs ${tx.type === 'DEBIT_SALE' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {tx.type === 'DEBIT_SALE' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                        {tx.type === 'DEBIT_SALE' ? 'Credit Purchase (Debit)' : 'Payment Collection (Credit)'}
                      </span>
                      <p className="text-slate-500 mt-0.5">{tx.notes || tx.reference}</p>
                      <span className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleString()}</span>
                    </div>

                    <span className={`font-extrabold text-sm ${tx.type === 'DEBIT_SALE' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {tx.type === 'DEBIT_SALE' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
