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
  FileText,
  History,
  RotateCcw,
  Printer,
  X,
  Pause,
  Play,
  BookOpen
} from 'lucide-react';
import { useStore, Product } from '@/store/useStore';
import confetti from 'canvas-confetti';

export default function POSPage() {
  const { 
    products, 
    sales, 
    cart, 
    heldCarts,
    khatas,
    addToCart: storeAddToCart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart: storeClearCart, 
    holdCart,
    resumeCart,
    deleteHeldCart,
    checkoutCart,
    refundTransaction,
    themeMode
  } = useStore();
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Invoice History & Refund Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<'All' | 'Completed' | 'Refunded'>('All');
  const [historySearch, setHistorySearch] = useState('');

  // Hold Cart Modal State
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [holdNote, setHoldNote] = useState('');
  const [isHeldListOpen, setIsHeldListOpen] = useState(false);

  // Payment Details
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Wallet' | 'Customer Khata'>('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [selectedKhataId, setSelectedKhataId] = useState('');
  
  // Active receipt for post-checkout modal rendering
  const [activeReceipt, setActiveReceipt] = useState<any>(null);
  
  // Mobile responsive views: 'products' list or 'cart' checkout summary
  const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');
  
  // Print reference
  const receiptRef = useRef<HTMLDivElement>(null);

  const isDark = themeMode === 'dark';

  // Refund handler
  const handleRefundSubmit = (transactionId: string, receiptNum: string) => {
    const reason = prompt(`Enter reason for refunding Invoice ${receiptNum}:`, 'Customer return / order cancel');
    if (reason === null) return;

    const success = refundTransaction(transactionId, reason);
    if (success) {
      confetti({ particleCount: 80, spread: 60, colors: ['#EF4444', '#F87171'] });
      alert(`Invoice ${receiptNum} successfully refunded! Product stock restored to inventory.`);
    } else {
      alert('Failed to process refund. Invoice may already be refunded.');
    }
  };

  // Re-print receipt handler
  const handleReprintReceipt = (sale: any) => {
    const receiptItems = sale.items.map((item: any) => {
      const product = products.find(p => p.id === item.productId) || {
        id: item.productId || '',
        name: item.productName,
        retailPrice: item.unitPrice,
        barcode: '',
        category: '',
        costPrice: item.costPrice || 0,
        stockQuantity: 0,
        minThreshold: 0
      };
      return { product, quantity: item.quantity };
    });

    const receiptData = {
      transactionId: sale.receiptNumber,
      timestamp: sale.createdAt,
      items: receiptItems,
      subtotal: sale.subtotal,
      taxAmount: sale.tax,
      grandTotal: sale.total,
      paymentMethod: sale.paymentMethod,
      cashReceived: sale.total,
      changeDue: 0
    };

    setActiveReceipt(receiptData);
  };

  // Filtered Sales History
  const filteredSalesHistory = sales.filter(s => {
    const matchesSearch = 
      s.receiptNumber.toLowerCase().includes(historySearch.toLowerCase()) ||
      s.items.some(i => i.productName.toLowerCase().includes(historySearch.toLowerCase()));
    
    if (!matchesSearch) return false;
    const saleStatus = s.status || 'Completed';
    if (historyFilter === 'All') return true;
    return saleStatus === historyFilter;
  });

  // Dynamically compute unique product categories from store catalog
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category && p.category.trim()) {
        set.add(p.category.trim());
      }
    });
    // Ensure default core hardware categories exist in tab bar
    ['Electrical', 'Fasteners', 'Hand Tools', 'Plumbing', 'Safety'].forEach((cat) => set.add(cat));
    return ['All', ...Array.from(set).sort()];
  }, [products]);

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

  // Robust Filtering products with smart category mapping and search query
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = 
      !query || 
      p.name.toLowerCase().includes(query) || 
      p.barcode.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query));

    if (selectedCategory === 'All') {
      return matchesSearch;
    }

    const catTarget = selectedCategory.trim().toLowerCase();
    const pCat = p.category.trim().toLowerCase();

    // Exact category match or subcategory/keyword overlap (e.g. 'Tools' matches 'Hand Tools')
    const matchesCategory = 
      pCat === catTarget || 
      pCat.includes(catTarget) || 
      catTarget.includes(pCat);

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

    if (paymentMethod === 'Customer Khata' && !selectedKhataId) {
      alert('Please select a Customer Khata credit account');
      return;
    }

    // Perform transaction checkout (0 discount, 17% tax rate)
    const newSale = checkoutCart(0, 17, paymentMethod, selectedKhataId || undefined);

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
      alert('Checkout failed. Please verify stock levels or Khata credit limit.');
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
          <h2 className={`text-2xl font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            <ShoppingCart className={`h-6 w-6 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
            Hardware POS Billing Terminal
          </h2>
          <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Add items, handle cash drawers, process refunds, and print thermal invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {heldCarts.length > 0 && (
            <button
              onClick={() => setIsHeldListOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md animate-pulse"
            >
              <Play className="h-4 w-4" />
              Held Carts ({heldCarts.length})
            </button>
          )}

          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              isDark 
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-amber-400 border-amber-500/20 shadow-amber-glow' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-amber-900 shadow-sm border-amber-200'
            }`}
          >
            <History className="h-4.5 w-4.5" />
            Invoice History & Refunds
          </button>

          {/* Barcode Search Field */}
          <form onSubmit={(e) => e.preventDefault()} className="relative w-full md:w-64">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              type="text"
              placeholder="Search Name or Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm transition-colors shadow-sm ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-amber-500 placeholder:text-slate-500' 
                  : 'bg-white border-slate-200 text-slate-900 focus:border-amber-500 placeholder:text-slate-500'
              }`}
            />
          </form>
        </div>
      </div>

      {/* Category Selection Bar */}
      <div className={`flex gap-2 overflow-x-auto no-scrollbar pb-1.5 p-2 rounded-2xl border shadow-sm print:hidden ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap border shadow-sm ${
              selectedCategory === cat
                ? isDark
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 text-white shadow-amber-glow scale-105'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500 shadow-md shadow-amber-600/20 scale-105'
                : isDark
                  ? 'bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                  : 'bg-white text-slate-900 border-slate-300 hover:bg-amber-100 hover:text-amber-950 hover:border-amber-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Mobile Screen Toggle */}
      <div className={`flex md:hidden border rounded-xl p-1 print:hidden shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <button
          onClick={() => setMobileView('products')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            mobileView === 'products' 
              ? isDark 
                ? 'bg-amber-600 text-white font-extrabold shadow-amber-glow border border-amber-500' 
                : 'bg-white text-amber-900 shadow-sm border border-amber-200 font-extrabold'
              : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          Products ({filteredProducts.length})
        </button>
        <button
          onClick={() => setMobileView('cart')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            mobileView === 'cart' 
              ? isDark 
                ? 'bg-amber-600 text-white font-extrabold shadow-amber-glow border border-amber-500' 
                : 'bg-white text-amber-900 shadow-sm border border-amber-200 font-extrabold'
              : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
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
                          ? 'border-amber-500 bg-amber-950/10 shadow-amber-glow'
                          : 'border-amber-500 bg-amber-50/50 shadow-md shadow-amber-600/5'
                        : isDark
                          ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:scale-[1.01] hover:shadow-amber-glow'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:scale-[1.01] hover:shadow-md text-slate-900'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex justify-between items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 text-[10px] rounded font-bold border ${
                        isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {product.category}
                      </span>
                      {isOutOfStock ? (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${
                          isDark ? 'bg-red-950/40 text-red-400 border-red-900/50' : 'bg-red-100 text-red-700 border-red-200'
                        }`}>
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border animate-pulse ${
                          isDark ? 'bg-amber-950/40 text-amber-400 border-amber-900/50' : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                          LOW STOCK ({product.stockQuantity})
                        </span>
                      ) : (
                        <span className={`text-[10px] font-semibold font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          QTY: {product.stockQuantity}
                        </span>
                      )}
                    </div>

                    <h4 className={`font-bold text-sm mt-2 line-clamp-2 ${isDark ? 'text-slate-200 group-hover:text-white' : 'text-slate-900 group-hover:text-black'}`}>
                      {product.name}
                    </h4>
                    <p className={`text-[10px] font-mono tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      SKU: {product.barcode}
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex justify-between items-center ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    <span className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                      {formatCurrency(product.retailPrice)}
                    </span>
                    
                    <button
                      disabled={isOutOfStock}
                      className={`p-1.5 rounded-lg transition-all border ${
                        isOutOfStock 
                          ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400' 
                          : inCart 
                            ? isDark
                              ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-500/20 shadow-amber-glow'
                              : 'bg-amber-600 text-white border-amber-500/10 shadow-sm shadow-amber-600/10'
                            : isDark
                              ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 shadow-sm'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
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
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Cart Header */}
            <div className={`p-4 border-b flex justify-between items-center ${
              isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'
            }`}>
              <h3 className={`font-bold flex items-center gap-2 text-sm sm:text-base ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                <Receipt className={`h-5 w-5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
                Checkout Cart
              </h3>
              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={() => setIsHoldModalOpen(true)}
                    className="flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:text-amber-800 text-xs font-bold transition-colors"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    Hold Cart
                  </button>
                )}
                {cart.length > 0 && (
                  <button 
                    onClick={clearCart}
                    className="text-slate-500 hover:text-red-500 text-xs font-bold transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Cart Items List */}
            <div className={`flex-1 overflow-y-auto max-h-[360px] p-4 divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-100'}`}>
              {cart.length === 0 ? (
                <div className={`py-16 text-center text-sm flex flex-col items-center justify-center space-y-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <ShoppingCart className={`h-8 w-8 animate-bounce ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                  <p className="font-medium">POS Cart is Empty</p>
                  <p className="text-[10px]">Click on product cards to add hardware items.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 pr-2 truncate">
                      <p className={`font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{item.product.name}</p>
                      <p className={`text-[9px] font-semibold font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Price: {formatCurrency(item.product.retailPrice)} • Unit: {item.product.unit || 'piece'}
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
                        <span className={`px-2 font-bold text-xs ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
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
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
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
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Subtotal:</span>
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>GST Sales Tax (17%):</span>
                  <span className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>{formatCurrency(taxAmount)}</span>
                </div>
              </div>

              {/* Total Row */}
              <div className={`flex justify-between items-center border-t pt-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <span className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>Grand Total:</span>
                <span className={`font-bold text-2xl ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>{formatCurrency(grandTotal)}</span>
              </div>

              {/* Payment Method Selector */}
              <div className={`grid grid-cols-4 gap-1.5 border-t pt-3.5 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                {[
                  { name: 'Cash', icon: Coins },
                  { name: 'Card', icon: CreditCard },
                  { name: 'Wallet', icon: Wallet },
                  { name: 'Customer Khata', icon: BookOpen }
                ].map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.name}
                      onClick={() => setPaymentMethod(p.name as any)}
                      className={`py-2 px-1 flex flex-col items-center gap-1 border rounded-xl transition-all shadow-sm ${
                        paymentMethod === p.name 
                          ? isDark
                            ? 'bg-slate-800 border-amber-500 text-amber-400 font-bold shadow-amber-glow'
                            : 'bg-amber-50 border-amber-500 text-amber-900 font-bold shadow-sm'
                          : isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-[10px]">{p.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Customer Khata Selector */}
              {paymentMethod === 'Customer Khata' && (
                <div className={`space-y-2 border-t pt-3 animate-fade-in ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <label className={`block font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Select Khata Credit Account:</label>
                  <select
                    value={selectedKhataId}
                    onChange={(e) => setSelectedKhataId(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl font-bold text-xs ${isDark ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-white border-slate-300 text-amber-900'}`}
                  >
                    <option value="">-- Select Customer Khata Account --</option>
                    {khatas.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.customerName} ({k.phone}) • Current Debt: Rs. {k.currentBalance}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cash Received & Change Due */}
              {paymentMethod === 'Cash' && (
                <div className={`space-y-2 border-t pt-3 animate-fade-in ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <label className={`font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Cash Received (PKR):</label>
                    <div className="relative w-28 shrink-0">
                      <span className={`absolute left-2 top-1/2 -translate-y-1/2 font-bold text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Rs.</span>
                      <input 
                        type="number"
                        placeholder="0"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        className={`w-full pl-6 pr-2 py-1 border rounded-lg text-xs font-bold text-right focus:outline-none shadow-sm ${
                          isDark 
                            ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-amber-500' 
                            : 'bg-white border-slate-300 text-slate-900 focus:border-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                  {cashNum >= grandTotal && (
                    <div className={`flex justify-between items-center p-2 rounded-lg text-[10px] font-bold border ${
                      isDark 
                        ? 'bg-amber-950/20 border-amber-800 text-amber-400' 
                        : 'bg-amber-50 border-amber-200 text-amber-900'
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
                className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md text-sm sm:text-base border ${
                  cart.length === 0
                    ? isDark
                      ? 'bg-slate-800/60 border-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                    : isDark
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 border-amber-500/20 text-white shadow-amber-glow'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-500/10 shadow-md shadow-amber-600/15'
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
        <div className="fixed inset-0 bg-slate-900/85 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-6 flex justify-center items-start sm:items-center py-6 sm:py-10 print-receipt-modal-backdrop print:static print:bg-white print:p-0">
          
          <div className={`border rounded-2xl w-full max-w-sm my-auto p-6 relative shadow-2xl flex flex-col justify-between print:border-0 print:shadow-none print:w-full print:max-w-none print:bg-white print:p-0 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-cyan-glow' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Real thermal receipt print block */}
            <div id="printable-receipt" ref={receiptRef} className="bg-white p-4 border border-slate-100 rounded-xl shadow-inner font-mono text-xs text-black print:border-0 print:shadow-none print:p-0">
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
              </div>
            </div>

            {/* Print action footer - hidden on print */}
            <div className="mt-4 flex gap-3 print:hidden">
              <button
                onClick={triggerPrint}
                className={`flex-1 py-2.5 font-bold rounded-xl border flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm ${
                  isDark 
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
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
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-500/10 shadow-blue-600/10'
                }`}
              >
                <CheckCircle className="h-4.5 w-4.5" />
                New Transaction
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. INVOICE HISTORY & REFUNDS MODAL */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 sm:p-6 flex items-center justify-center animate-fade-in print:hidden">
          <div className={`border rounded-2xl w-full max-w-3xl relative shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[90vh] animate-scale-in transition-colors duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-cyan-glow' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Pinned Modal Header */}
            <div className="p-5 sm:p-6 pb-4 relative shrink-0 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                  <History className={`h-5.5 w-5.5 shrink-0 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                  Invoice History & Refunds
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mt-0.5">View transactions, process refunds, and re-print customer receipts.</p>
              </div>

              <button 
                onClick={() => setIsHistoryModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className={`p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex gap-2">
                {(['All', 'Completed', 'Refunded'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setHistoryFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      historyFilter === tab
                        ? isDark
                          ? 'bg-cyan-600 text-white border-cyan-500 shadow-cyan-glow'
                          : 'bg-blue-600 text-white border-blue-500 shadow-sm'
                        : isDark
                          ? 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab} ({tab === 'All' ? sales.length : sales.filter(s => (s.status || 'Completed') === tab).length})
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search receipt # or product..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className={`w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg focus:outline-none ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                />
              </div>
            </div>

            {/* Scrollable Invoices List */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
              {filteredSalesHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  <History className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="font-bold">No Invoices Found</p>
                  <p className="text-xs text-slate-500 mt-1">Completed sales transactions will appear here.</p>
                </div>
              ) : (
                filteredSalesHistory.map(sale => {
                  const isRefunded = sale.status === 'Refunded';
                  return (
                    <div 
                      key={sale.id}
                      className={`border p-4 rounded-xl space-y-3 transition-all ${
                        isRefunded 
                          ? isDark ? 'bg-red-950/20 border-red-900/40' : 'bg-red-50/50 border-red-200'
                          : isDark ? 'bg-slate-950/50 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5 border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">{sale.receiptNumber}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              isRefunded 
                                ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
                                : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50'
                            }`}>
                              {isRefunded ? 'Refunded' : 'Completed'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                            {new Date(sale.createdAt).toLocaleString()} • Method: {sale.paymentMethod}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-xs text-slate-400 block font-medium">Total Amount</span>
                          <span className={`font-bold text-base ${isRefunded ? 'text-slate-400 line-through' : isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
                            {formatCurrency(sale.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items breakdown */}
                      <div className="space-y-1 text-xs">
                        {sale.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>{item.productName} (x{item.quantity})</span>
                            <span className="font-mono">{formatCurrency(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>

                      {isRefunded && sale.refundReason && (
                        <div className="text-[10px] p-2 bg-red-100/60 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900/50">
                          <strong>Refund Reason:</strong> {sale.refundReason} (Refunded on {new Date(sale.refundedAt!).toLocaleString()})
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 justify-end">
                        <button
                          onClick={() => handleReprintReceipt(sale)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
                            isDark 
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Printer className="h-3.5 w-3.5 text-slate-400" />
                          Re-Print Receipt
                        </button>

                        {!isRefunded && (
                          <button
                            onClick={() => handleRefundSubmit(sale.id, sale.receiptNumber)}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center gap-1.5 transition-all"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Refund Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className={`p-4 px-6 border-t flex justify-end shrink-0 ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-slate-50'}`}>
              <button
                onClick={() => setIsHistoryModalOpen(false)}
                className={`px-4 py-2 text-xs sm:text-sm font-bold border rounded-xl ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOLD CART MODAL */}
      {isHoldModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-md p-6 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Pause className="h-5 w-5 text-amber-500" />
                Hold POS Cart
              </h3>
              <button onClick={() => setIsHoldModalOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-500 mb-1">Customer / Reference Note</label>
                <input
                  type="text"
                  placeholder="e.g. Asif (will return with cash)"
                  value={holdNote}
                  onChange={(e) => setHoldNote(e.target.value)}
                  className={`w-full px-3.5 py-2 border rounded-xl ${isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-300'}`}
                />
              </div>
              <button
                onClick={() => {
                  holdCart(holdNote);
                  setHoldNote('');
                  setIsHoldModalOpen(false);
                }}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Confirm Hold Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HELD CARTS RESUME LIST MODAL */}
      {isHeldListOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 p-4 flex items-center justify-center">
          <div className={`border rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[85vh] ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Play className="h-5 w-5 text-amber-500" />
                Held Active Carts ({heldCarts.length})
              </h3>
              <button onClick={() => setIsHeldListOpen(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar space-y-3">
              {heldCarts.length === 0 ? (
                <p className="text-slate-400 text-center py-8 text-xs">No held carts available.</p>
              ) : (
                heldCarts.map((hc) => (
                  <div key={hc.id} className={`p-4 border rounded-xl flex items-center justify-between text-xs ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{hc.note}</span>
                      <p className="text-slate-500 mt-0.5">{hc.items.length} items • {new Date(hc.createdAt).toLocaleTimeString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          resumeCart(hc.id);
                          setIsHeldListOpen(false);
                        }}
                        className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-500"
                      >
                        Resume Cart
                      </button>
                      <button
                        onClick={() => deleteHeldCart(hc.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
