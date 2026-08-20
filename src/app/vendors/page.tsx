'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  DollarSign, 
  Package, 
  Truck, 
  X, 
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useStore, Vendor, PurchaseOrder } from '@/store/useStore';

export default function VendorsPage() {
  const { 
    vendors, 
    purchaseOrders, 
    products, 
    addVendor, 
    createPurchaseOrder, 
    receiveGoodsNote, 
    recordVendorPayment, 
    themeMode 
  } = useStore();

  const isDark = themeMode === 'dark';

  // Tabs: Vendors list, Purchase Orders
  const [activeTab, setActiveTab] = useState<'vendors' | 'orders'>('vendors');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [isPayVendorOpen, setIsPayVendorOpen] = useState(false);
  const [selectedVendorForPayment, setSelectedVendorForPayment] = useState<Vendor | null>(null);

  // Add Vendor Form State
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Create PO Form State
  const [poVendorId, setPoVendorId] = useState('');
  const [poItems, setPoItems] = useState<{ productId: string; quantity: number; unitCost: number }[]>([]);

  // Vendor Payment Form State
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleAddVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !phone) return;
    addVendor({
      companyName,
      contactPerson,
      phone,
      email
    });
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setIsAddVendorOpen(false);
  };

  const handleAddPoItemRow = () => {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    setPoItems([...poItems, { productId: defaultProduct.id, quantity: 10, unitCost: defaultProduct.costPrice }]);
  };

  const handleRemovePoItemRow = (index: number) => {
    setPoItems(poItems.filter((_, i) => i !== index));
  };

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poVendorId || poItems.length === 0) return;
    createPurchaseOrder(poVendorId, poItems);
    setPoVendorId('');
    setPoItems([]);
    setIsCreatePOOpen(false);
  };

  const handlePayVendorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForPayment || !paymentAmount) return;
    recordVendorPayment(selectedVendorForPayment.id, parseFloat(paymentAmount), paymentNotes);
    setSelectedVendorForPayment(null);
    setPaymentAmount('');
    setPaymentNotes('');
    setIsPayVendorOpen(false);
  };

  const filteredVendors = vendors.filter(v => 
    v.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.phone.includes(searchQuery)
  );

  const filteredPOs = purchaseOrders.filter(po => 
    po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPayables = vendors.reduce((sum, v) => sum + v.balancePayable, 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <Building2 className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
            Vendor & Supplier Procurement
          </h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Manage hardware suppliers, purchase orders (PO), goods received notes (GRN), and balance payables.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsAddVendorOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl transition-all shadow-sm ${
              isDark 
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
            }`}
          >
            <Plus className={`h-4.5 w-4.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`} />
            Add Supplier
          </button>

          <button
            onClick={() => {
              if (products.length > 0) {
                setPoItems([{ productId: products[0].id, quantity: 20, unitCost: products[0].costPrice }]);
              }
              setIsCreatePOOpen(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl transition-all shadow-sm ${
              isDark 
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-500/20 text-white shadow-amber-glow' 
                : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-500/10 shadow-md shadow-amber-600/15'
            }`}
          >
            <FileText className="h-4.5 w-4.5" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* Summary Analytics Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Active Suppliers</p>
          <h3 className={`text-2xl font-extrabold mt-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{vendors.length}</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Verified hardware & gas distributors</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Total Accounts Payable</p>
          <h3 className="text-2xl font-extrabold mt-1 text-red-600 dark:text-red-400">{formatCurrency(totalPayables)}</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Outstanding vendor invoices</p>
        </div>

        <div className={`p-5 border rounded-2xl shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Pending Purchase Orders</p>
          <h3 className="text-2xl font-extrabold mt-1 text-amber-500">{purchaseOrders.filter(p => p.status === 'Pending').length}</h3>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Awaiting stock arrival & GRN</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border rounded-2xl shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Supplier Company, PO Number or Contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm transition-colors ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700 placeholder:text-slate-500' 
                : 'bg-white border-slate-200 text-slate-800 focus:border-blue-500 placeholder:text-slate-400'
            }`}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              activeTab === 'vendors'
                ? isDark ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-50 text-blue-700 border-blue-200'
                : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Suppliers Ledger ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
              activeTab === 'orders'
                ? isDark ? 'bg-blue-600 text-white border-blue-500' : 'bg-blue-50 text-blue-700 border-blue-200'
                : isDark ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Purchase Orders ({purchaseOrders.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'vendors' ? (
        <div className={`border rounded-2xl overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'} font-semibold uppercase tracking-wider`}>
                  <th className="p-4">Supplier / Company</th>
                  <th className="p-4">Contact Person</th>
                  <th className="p-4">Phone / Email</th>
                  <th className="p-4">Outstanding Balance</th>
                  <th className="p-4 text-right">Payment Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">No suppliers found.</td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium">
                      <td className="p-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{vendor.companyName}</p>
                        <span className="text-[10px] text-slate-400">ID: {vendor.id}</span>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{vendor.contactPerson}</td>
                      <td className="p-4">
                        <p className="text-slate-700 dark:text-slate-300">{vendor.phone}</p>
                        <p className="text-[10px] text-slate-400">{vendor.email || 'N/A'}</p>
                      </td>
                      <td className="p-4">
                        <span className={`font-extrabold ${vendor.balancePayable > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {formatCurrency(vendor.balancePayable)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedVendorForPayment(vendor);
                            setPaymentAmount(String(vendor.balancePayable));
                            setIsPayVendorOpen(true);
                          }}
                          disabled={vendor.balancePayable <= 0}
                          className={`px-3 py-1.5 font-bold text-xs rounded-xl border transition-all ${
                            vendor.balancePayable > 0
                              ? isDark 
                                ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500' 
                                : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 cursor-not-allowed'
                          }`}
                        >
                          Settle Payment
                        </button>
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
                  <th className="p-4">PO Number</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Items Ordered</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Receive Stock (GRN)</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                {filteredPOs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">No purchase orders found.</td>
                  </tr>
                ) : (
                  filteredPOs.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 font-medium">
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{po.poNumber}</td>
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{po.vendorName}</td>
                      <td className="p-4">
                        <div className="space-y-0.5 text-xs">
                          {po.items.map((i, idx) => (
                            <p key={idx} className="text-slate-600 dark:text-slate-400">
                              {i.productName} × {i.quantity} @ Rs. {i.unitCost}
                            </p>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{formatCurrency(po.totalAmount)}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          po.status === 'Received'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400'
                        }`}>
                          {po.status === 'Received' ? 'GRN Processed' : 'Pending Delivery'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {po.status === 'Pending' ? (
                          <button
                            onClick={() => receiveGoodsNote(po.id)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                          >
                            Receive GRN & Add Stock
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-bold">Stock Received</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Add Vendor */}
      {isAddVendorOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Register New Supplier
              </h3>
              <button onClick={() => setIsAddVendorOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddVendorSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Company / Supplier Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pak Hardware Supplies Ltd."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Tariq Mehmood"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+923001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="vendor@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Save Supplier Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Create PO */}
      {isCreatePOOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-xl p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Create Purchase Order (PO)
              </h3>
              <button onClick={() => setIsCreatePOOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreatePOSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Select Supplier</label>
                <select
                  value={poVendorId}
                  onChange={(e) => setPoVendorId(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.companyName} ({v.contactPerson})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-500">Order Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddPoItemRow}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    + Add Product Line
                  </button>
                </div>

                {poItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={item.productId}
                      onChange={(e) => {
                        const updated = [...poItems];
                        const prod = products.find(p => p.id === e.target.value);
                        updated[idx].productId = e.target.value;
                        if (prod) updated[idx].unitCost = prod.costPrice;
                        setPoItems(updated);
                      }}
                      className={`flex-1 px-2.5 py-1.5 border rounded-lg text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'}`}
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[idx].quantity = parseInt(e.target.value) || 1;
                        setPoItems(updated);
                      }}
                      className={`w-20 px-2 py-1.5 border rounded-lg text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'}`}
                    />

                    <input
                      type="number"
                      placeholder="Unit Cost"
                      value={item.unitCost}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[idx].unitCost = parseFloat(e.target.value) || 0;
                        setPoItems(updated);
                      }}
                      className={`w-24 px-2 py-1.5 border rounded-lg text-xs ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300'}`}
                    />

                    <button type="button" onClick={() => handleRemovePoItemRow(idx)} className="text-red-500 p-1">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md transition-all mt-4"
              >
                Issue Purchase Order
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Settle Vendor Payment */}
      {isPayVendorOpen && selectedVendorForPayment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                Settle Vendor Balance
              </h3>
              <button onClick={() => setIsPayVendorOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl mb-4 border border-blue-200 dark:border-blue-900/50">
              <p className="text-xs text-slate-500">Supplier: <strong className="text-slate-800 dark:text-slate-200">{selectedVendorForPayment.companyName}</strong></p>
              <p className="text-xs text-slate-500 mt-1">Current Payable Balance: <strong className="text-red-600">{formatCurrency(selectedVendorForPayment.balancePayable)}</strong></p>
            </div>
            <form onSubmit={handlePayVendorSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Payment Amount (PKR)</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl font-bold text-lg ${isDark ? 'bg-slate-950 border-slate-800 text-cyan-400' : 'bg-white border-slate-300 text-blue-600'}`}
                />
              </div>
              <div>
                <label className="block font-bold text-slate-500 mb-1">Payment Reference / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Transfer Ref #99281"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Confirm Payment Settlement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
