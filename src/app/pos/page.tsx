'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  Coins, 
  CreditCard, 
  Wallet, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { useStore, Product } from '@/store/useStore';
import confetti from 'canvas-confetti';

export default function POSPage() {
  const { 
    products, 
    sales, 
    cart, 
    addToCart: storeAddToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart: storeClearCart, 
    checkoutCart,
    themeMode
  } = useStore();
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Wallet'>('Cash');
  const [cashReceived, setCashReceived] = useState('');
  
  // Active receipt for post-checkout modal rendering
  const [activeReceipt, setActiveReceipt] = useState<any>(null);
  
  // Mobile responsive views: 'products' list or 'cart' checkout summary
  const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');
  
  // Print reference
  const receiptRef = useRef<HTMLDivElement>(null);

  const isDark = themeMode === 'dark';

  // Categories list
  const categories = ['All', 'Hardware', 'Electrical', 'Plumbing', 'Safety', 'Tools'];

  // Add to cart helper with stock checking
  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) return;
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        alert(`Cannot add more. Only ${product.stockQuantity} items in stock.`);
        return;
      }
    }
    storeAddToCart(product);
  };

  // Decrement cart helper
  const decrementQuantity = (productId: string) => {
    const existing = cart.find((item) => item.product.id === productId);
    if (!existing) return;
    updateCartQuantity(productId, existing.quantity - 1);
  };

  // Clear entire checkout cart wrapper
  const clearCart = () => {
    storeClearCart();
    setCashReceived('');
  };

  // Filtering products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate Order Summary Metrics
  const subtotal = cart.reduce((sum, item) => sum + (item.product.retailPrice * item.quantity), 0);
  const taxAmount = subtotal * 0.17; // 17% Standard GST
  const grandTotal = subtotal + taxAmount;

  // Change computation (PKR cash drawer change)
  const cashNum = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, cashNum - grandTotal);

  // Handle Checkout submission
  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    if (paymentMethod === 'Cash' && cashNum < grandTotal) {
      alert('Cash received is less than grand total');
      return;
    }

    // Perform transaction checkout (0 discount, 17% tax rate)
    const newSale = checkoutCart(0, 17, paymentMethod);

    if (newSale) {
      // Fire confetti celebrate
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Construct a printer receipt profile mapping items back
      const receiptItems = newSale.items.map(item => {
        const product = products.find(p => p.id === item.productId) || {
          id: item.productId || '',
          name: item.productName,
          retailPrice: item.unitPrice,
          barcode: '',
          category: '',
          costPrice: 0,
          stockQuantity: 0,
          minThreshold: 0
        };
        return {
          product,
          quantity: item.quantity
        };
      });

      const receiptData = {
        transactionId: newSale.receiptNumber,
        timestamp: newSale.createdAt,
        items: receiptItems,
        subtotal: newSale.subtotal,
        taxAmount: newSale.tax,
        grandTotal: newSale.total,
        paymentMethod: newSale.paymentMethod,
        cashReceived: paymentMethod === 'Cash' ? cashNum : newSale.total,
        changeDue: paymentMethod === 'Cash' ? changeDue : 0
      };

      setActiveReceipt(receiptData);
    } else {
      alert('Checkout failed. Please verify stock levels.');
    }
  };

  // Print receipts
  const triggerPrint = () => {
    window.print();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="flex flex-col h-full space-y-6 pb-12">
      
      {/* POS Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <ShoppingCart className={`h-6 w-6 ${isDark ? '-400' : 'text-orange-600'}`} />
            Hardware POS Billing Terminal
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Add items, handle cash drawers, choose payment types, and print printed thermal invoices.
          </p>
        </div>

        {/* Barcode Search Field */}
        <form onSubmit={(e) => e.preventDefault()} className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Product Name or Barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm transition-colors shadow-sm ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700 placeholder:text-slate-500' 
                : 'bg-white border-slate-200 text-slate-800 focus:border-orange-500 placeholder:text-slate-400'
            }`}
          />
        </form>
      </div>

      {/* Category Selection Bar */}
      <div className={`flex gap-1.5 overflow-x-auto pb-1 p-1.5 rounded-xl border shadow-sm print:hidden ${
        isDark ? 'bg-slate-950/20 border-slate-900' : 'bg-white border-slate-200'
      }`}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? isDark
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 -500 text-white shadow-cyan-glow'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-500/10 shadow-md shadow-orange-600/10'
                : isDark
                  ? '-400 hover:-200 hover:bg-slate-900 border-transparent'
                  : '-500 hover:text-slate-800 hover:bg-slate-100 border-transparent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mobile Screen Toggle */}
      <div className={`flex md:hidden border rounded-xl p-1 print:hidden shadow-sm ${
        isDark ? 'bg-slate-950 -800' : '-100 border-slate-200'
      }`}>
        <button
          onClick={() => setMobileView('products')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg ${
            mobileView === 'products' 
              ? isDark 
                ? 'bg-slate-800 text-cyan-400 font-bold shadow-cyan-glow border border-slate-700' 
                : 'bg-white text-orange-600 shadow-sm border border-slate-200'
              : 'text-slate-500'
          }`}
        >
          Products ({filteredProducts.length})
        </button>
        <button
          onClick={() => setMobileView('cart')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg ${
            mobileView === 'cart' 
              ? isDark 
                ? 'bg-slate-800 text-cyan-400 font-bold shadow-cyan-glow border border-slate-700' 
                : 'bg-white text-orange-600 shadow-sm border border-slate-200'
              : 'text-slate-500'
          }`}
        >
          Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
        </button>
      </div>

      {/* Main POS Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-3 gap-6 flex-1 items-start">
        
        {/* Left Side: Product Grid */}
        <div className={`md:col-span-3 lg:col-span-2 space-y-4 print:hidden ${
          mobileView === 'products' ? 'block' : 'hidden md:block'
        }`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const inCart = cart.find(item => item.product.id === product.id);
              const isLowStock = product.stockQuantity <= product.minThreshold;
              const isOutOfStock = product.stockQuantity <= 0;

              return (
                <div 
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`border rounded-2xl p-4 flex flex-col justify-between cursor-pointer group transition-all duration-200 shadow-sm ${
                    isOutOfStock 
                      ? 'opacity-55 cursor-not-allowed border-slate-200 dark:border-slate-800' 
                      : inCart 
                        ? isDark
                          ? 'border-cyan-500 bg-cyan-950/10 shadow-cyan-glow'
                          : 'border-orange-500 bg-orange-50/5 shadow-md shadow-orange-600/5'
                        : isDark
                          ? 'bg-slate-900 border-slate-800 hover:-700 hover:scale-[1.01] hover:shadow-cyan-glow'
                          : 'bg-white border-slate-200 hover:-300 hover:scale-[1.01] hover:shadow-md text-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 rounded font-semibold border border-slate-200/50 dark:border-slate-700/50">
                        {product.category}
                      </span>
                      {isOutOfStock ? (
                        <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 -700 dark:text-red-400 text-[9px] font-bold rounded">
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 border -200 dark:border-amber-900 text-amber-700 dark:text-amber-400 text-[9px] font-bold rounded animate-pulse">
                          LOW STOCK ({product.stockQuantity})
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">
                          QTY: {product.stockQuantity}
                        </span>
                      )}
                    </div>

                    <h4 className={`font-bold text-sm mt-2 line-clamp-2 ${isDark ? 'text-slate-200 group-hover:text-white' : '-800 group-hover:text-slate-950'}`}>
                      {product.name}
                    </h4>
                    <p className="text-[10px] -400 font-mono tracking-wider">
                      SKU: {product.barcode}
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex justify-between items-center ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    <span className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                      {formatCurrency(product.retailPrice)}
                    </span>
                    
                    <button
                      disabled={isOutOfStock}
                      className={`p-1.5 rounded-lg transition-all border ${
                        isOutOfStock 
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:-800 text-slate-400' 
                          : inCart 
                            ? isDark
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-500/20 shadow-cyan-glow'
                              : 'bg-orange-600 text-white border-orange-500/10 shadow-sm shadow-orange-600/10'
                            : isDark
                              ? 'bg-slate-800 hover:-700 border-slate-700 text-slate-300 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 shadow-sm'
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Checkout Summary sidebar */}
        <div className={`md:col-span-2 lg:col-span-1 print:block ${
          mobileView === 'cart' ? 'block' : 'hidden md:block'
        }`}>
          
          <div className={`border rounded-2xl flex flex-col justify-between overflow-hidden shadow-md ${
            isDark ? 'bg-slate-900 border-slate-800 -200' : 'bg-white border-slate-200 -800'
          }`}>
            
            {/* Cart Header */}
            <div className={`p-4 border-b flex justify-between items-center ${
              isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 -50'
            }`}>
              <h3 className={`font-bold flex items-center gap-2 text-sm sm:text-base ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                <Receipt className={`h-5 w-5 ${isDark ? '-400' : 'text-orange-600'}`} />
                Checkout Cart
              </h3>
              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="text-slate-500 hover:text-red-500 text-xs font-bold transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className={`flex-1 overflow-y-auto max-h-[360px] p-4 divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-100'}`}>
              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-sm flex flex-col items-center justify-center space-y-2">
                  <ShoppingCart className="h-8 w-8 text-slate-300 animate-bounce" />
                  <p className="font-medium">POS Cart is Empty</p>
                  <p className="text-[10px] text-slate-400">Click on product cards to add hardware items.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 pr-2 truncate">
                      <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.product.name}</p>
                      <p className="text-[9px] -400 font-semibold font-mono uppercase tracking-wider">
                        Price: {formatCurrency(item.product.retailPrice)} • SKU: {item.product.barcode}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`flex items-center border rounded-lg overflow-hidden shadow-sm ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <button 
                          onClick={() => decrementQuantity(item.product.id)}
                          className="px-1.5 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className={`px-2 font-bold text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => addToCart(item.product)}
                          className="px-1.5 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="p-1 text-slate-400 hover:-500 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations Breakdown block */}
            <div className={`border-t p-4 space-y-3.5 text-xs ${
              isDark ? 'bg-slate-950 -800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="-500">Subtotal:</span>
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="-500">GST Sales Tax (17%):</span>
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{formatCurrency(taxAmount)}</span>
                </div>
              </div>

              {/* Total Row */}
              <div className={`flex justify-between items-center border-t pt-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">Grand Total:</span>
                <span className={`font-bold text-2xl ${isDark ? 'text-cyan-400' : 'text-orange-600'}`}>{formatCurrency(grandTotal)}</span>
              </div>

              {/* Payment Method Selector */}
              <div className={`grid grid-cols-3 gap-2 border-t pt-3.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                {[
                  { name: 'Cash', icon: Coins },
                  { name: 'Card', icon: CreditCard },
                  { name: 'Wallet', icon: Wallet }
                ].map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.name}
                      onClick={() => setPaymentMethod(p.name as any)}
                      className={`py-2 px-1 flex flex-col items-center gap-1 border rounded-xl transition-all shadow-sm ${
                        paymentMethod === p.name 
                          ? isDark
                            ? 'bg-slate-800 -500 text-cyan-400 font-bold shadow-cyan-glow'
                            : '-50 -500 text-orange-700 font-bold shadow-sm'
                          : isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-500 hover:-700 hover:-300'
                            : 'bg-white border-slate-200 text-slate-500 hover:-300 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[10px]">{p.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Cash Received & Change Due */}
              {paymentMethod === 'Cash' && (
                <div className={`space-y-2 border-t pt-3 animate-fade-in ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-slate-500 dark:text-slate-400 font-bold">Cash Received (PKR):</label>
                    <div className="relative w-28 shrink-0">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px]">Rs.</span>
                      <input 
                        type="number"
                        placeholder="0"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className={`w-full pl-6 pr-2 py-1 border rounded-lg text-xs font-bold text-right focus:outline-none shadow-sm ${
                          isDark 
                            ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                            : 'bg-white border-slate-300 text-slate-800 focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>
                  {cashNum >= grandTotal && (
                    <div className={`flex justify-between items-center p-2 rounded-lg text-[10px] font-bold border ${
                      isDark 
                        ? 'bg-cyan-950/20 -800 text-cyan-400' 
                        : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                    }`}>
                      <span>Change to Return:</span>
                      <span className="text-sm">{formatCurrency(changeDue)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-xl font-bold transition-all shadow-md text-sm sm:text-base border ${
                  cart.length === 0
                    ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:-800 -400 cursor-not-allowed shadow-none'
                    : isDark
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 text-white shadow-cyan-glow'
                      : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-orange-500/10'
                }`}
              >
                Pay & Print Thermal Receipt
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* 3. THERMAL RECEIPT DIALOG MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 -900/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:static print:bg-white print:p-0">
          
          <div className={`border rounded-2xl w-full max-w-sm p-6 relative shadow-2xl flex flex-col justify-between print:border-0 print:shadow-none print:w-full print:max-w-none print:bg-white print:p-0 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-cyan-glow' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Real thermal receipt print block */}
            <div ref={receiptRef} className="bg-white p-4 border border-slate-100 rounded-xl shadow-inner font-mono text-xs text-black print:border-0 print:shadow-none print:p-0">
              <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
                <h3 className="font-extrabold text-sm sm:text-base uppercase tracking-wider">Khan Hardware</h3>
                <p className="text-[10px]">Dual Shop & Cylinder Logistics</p>
                <p className="text-[9px]">G.T. Road, Peshawar, Pakistan</p>
                <p className="text-[9px]">Phone: +92 312 3456789</p>
              </div>

              <div className="py-3 space-y-1 border-b border-dashed border-slate-300 text-[10px]">
                <p><strong>INVOICE:</strong> {activeReceipt.transactionId}</p>
                <p><strong>DATE:</strong> {new Date(activeReceipt.timestamp).toLocaleString()}</p>
                <p><strong>CASHIER:</strong> Shop operator terminal</p>
                <p><strong>PAYMENT:</strong> {activeReceipt.paymentMethod} Payment</p>
              </div>

              {/* Items List */}
              <div className="py-3 border-b border-dashed border-slate-300 text-[10px]">
                <div className="grid grid-cols-12 font-bold mb-1 border-b border-slate-200 pb-1">
                  <span className="col-span-6">ITEM</span>
                  <span className="col-span-2 text-right">QTY</span>
                  <span className="col-span-4 text-right">TOTAL</span>
                </div>
                <div className="space-y-1.5">
                  {activeReceipt.items.map((item: any) => (
                    <div key={item.product.id} className="grid grid-cols-12">
                      <span className="col-span-6 truncate">{item.product.name}</span>
                      <span className="col-span-2 text-right">x{item.quantity}</span>
                      <span className="col-span-4 text-right">{formatCurrency(item.product.retailPrice * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total calculations */}
              <div className="py-3 text-[10px] space-y-1 border-b border-dashed border-slate-300">
                <div className="flex justify-between">
                  <span>SUBTOTAL:</span>
                  <span>{formatCurrency(activeReceipt.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST SALES TAX (17%):</span>
                  <span>{formatCurrency(activeReceipt.taxAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-100">
                  <span>GRAND TOTAL:</span>
                  <span>{formatCurrency(activeReceipt.grandTotal)}</span>
                </div>
              </div>

              <div className="py-2.5 text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>CASH RECEIVED:</span>
                  <span>{formatCurrency(activeReceipt.cashReceived)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CHANGE PAID:</span>
                  <span>{formatCurrency(activeReceipt.changeDue)}</span>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-slate-300 space-y-1">
                <p className="font-bold text-[10px] tracking-widest">THANK YOU FOR YOUR VISIT</p>
                <p className="text-[8px] text-slate-400">Software designed by Antigravity</p>
              </div>
            </div>

            {/* Print action footer - hidden on print */}
            <div className="mt-4 flex gap-3 print:hidden">
              <button
                onClick={triggerPrint}
                className={`flex-1 py-2.5 font-bold rounded-xl border flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm ${
                  isDark 
                    ? 'bg-slate-800 hover:-700 text-slate-300 border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 -200'
                }`}
              >
                <FileText className="h-4.5 w-4.5" />
                Physical Print / PDF
              </button>
              <button
                onClick={() => {
                  setActiveReceipt(null);
                  clearCart();
                }}
                className={`flex-1 py-2.5 font-bold rounded-xl flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-md border ${
                  isDark 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 text-white shadow-cyan-glow' 
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-orange-500/10 shadow-orange-600/10'
                }`}
              >
                <CheckCircle className="h-4.5 w-4.5" />
                New Transaction
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
