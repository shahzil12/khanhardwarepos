'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Database, 
  Search, 
  UserPlus, 
  ArrowLeftRight, 
  RefreshCw, 
  Check, 
  AlertTriangle, 
  User, 
  Phone, 
  FileText, 
  DollarSign, 
  Calendar, 
  MessageSquare,
  X,
  ShieldCheck,
  Plus,
  Truck,
  UserCheck
} from 'lucide-react';
import { useStore, Cylinder, CylinderStatus, CustomerDetails } from '@/store/useStore';
import confetti from 'canvas-confetti';
import FormattedDate from '@/components/FormattedDate';

function CylinderPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { 
    cylinders, 
    issueCylinder, 
    returnCylinder, 
    sendToRefill, 
    completeRefill, 
    addCylinder,
    workers,
    settleDriverCash,
    updateDeliveryStatus,
    addWorker,
    themeMode
  } = useStore();
  
  // UI Tabs & Filters
  const [activeTab, setActiveTab] = useState<'all' | CylinderStatus | 'Deliveries' | 'Overdue'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Form State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isAddCylinderModalOpen, setIsAddCylinderModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  
  // Form values - Issue Cylinder
  const [selectedSerial, setSelectedSerial] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCnic, setCustomerCnic] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('15000');
  const [refillCharges, setRefillCharges] = useState('2500');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [deliveryType, setDeliveryType] = useState<'Pickup' | 'Delivery'>('Pickup');
  const [assignedWorkerId, setAssignedWorkerId] = useState('');
  
  // Form values - Return Cylinder
  const [returnSearchSerial, setReturnSearchSerial] = useState('');
  const [foundReturnCylinder, setFoundReturnCylinder] = useState<Cylinder | null>(null);
  
  // Form values - Add Cylinder
  const [newSerial, setNewSerial] = useState('');
  const [newCapacity, setNewCapacity] = useState('240 cu ft');
  const [newGasType, setNewGasType] = useState('Medical Oxygen');

  // Form values - Add Worker
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState<'Driver' | 'Loader'>('Driver');

  // Settle driver cash inline input state
  const [cashReturnedAmounts, setCashReturnedAmounts] = useState<Record<string, string>>({});

  const isDark = themeMode === 'dark';

  // Sync state from query params
  useEffect(() => {
    const action = searchParams.get('action');
    const filter = searchParams.get('filter');
    
    if (action === 'issue') {
      setIsIssueModalOpen(true);
      const available = cylinders.find(c => c.status === 'Filled (In Stock)');
      if (available) setSelectedSerial(available.serialNumber);
    } else if (action === 'return') {
      setIsReturnModalOpen(true);
    }
    
    if (filter === 'overdue') {
      setActiveTab('Overdue');
    } else if (filter === 'deliveries') {
      setActiveTab('Deliveries');
    }
  }, [searchParams, cylinders]);

  // Return cylinder lookup
  useEffect(() => {
    if (returnSearchSerial.trim()) {
      const match = cylinders.find(
        (c) => c.serialNumber.toLowerCase() === returnSearchSerial.toLowerCase() && c.status === 'Issued to Customer'
      );
      setFoundReturnCylinder(match || null);
    } else {
      setFoundReturnCylinder(null);
    }
  }, [returnSearchSerial, cylinders]);

  // Form handlers
  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSerial || !customerName || !customerPhone || !customerCnic || !expectedReturnDate) {
      alert('Please fill in all details');
      return;
    }

    if (deliveryType === 'Delivery' && !assignedWorkerId) {
      alert('Please assign a driver for delivery');
      return;
    }

    const dep = parseFloat(securityDeposit);
    const ref = parseFloat(refillCharges);

    const details: CustomerDetails = {
      customerName,
      customerPhone,
      customerCnic,
      issueDate: new Date().toISOString(),
      expectedReturnDate: new Date(expectedReturnDate).toISOString(),
      securityDeposit: dep,
      refillCharges: ref,
      deliveryType,
      assignedWorkerId: deliveryType === 'Delivery' ? assignedWorkerId : null,
      deliveryStatus: deliveryType === 'Delivery' ? 'Assigned' : 'N/A',
      cashCollected: dep + ref,
      cashReturned: deliveryType === 'Pickup', 
      cashAmountReturned: deliveryType === 'Pickup' ? (dep + ref) : 0,
      cashReturnedAt: deliveryType === 'Pickup' ? new Date().toISOString() : null
    };

    const success = issueCylinder(selectedSerial, details);
    if (success) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setIsIssueModalOpen(false);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerCnic('');
      setExpectedReturnDate('');
      setDeliveryType('Pickup');
      setAssignedWorkerId('');
      router.replace('/cylinder');
    } else {
      alert('Failed to issue cylinder. Verify status is Filled (In Stock).');
    }
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundReturnCylinder) return;

    const success = returnCylinder(foundReturnCylinder.serialNumber);
    if (success) {
      confetti({
        particleCount: 80,
        spread: 60,
        colors: ['#10B981', '#34D399', '#059669']
      });
      setIsReturnModalOpen(false);
      setReturnSearchSerial('');
      setFoundReturnCylinder(null);
      router.replace('/cylinder');
    } else {
      alert('Failed to return cylinder.');
    }
  };

  const handleAddCylinderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial.trim()) {
      alert('Please enter a Serial Number');
      return;
    }

    if (cylinders.some(c => c.serialNumber.toLowerCase() === newSerial.trim().toLowerCase())) {
      alert('A cylinder with this Serial Number already exists');
      return;
    }

    addCylinder({
      serialNumber: newSerial.trim(),
      capacity: newCapacity,
      gasType: newGasType
    });

    setIsAddCylinderModalOpen(false);
    setNewSerial('');
    confetti({
      particleCount: 50,
      spread: 40
    });
  };

  const handleAddWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newWorkerPhone.trim()) {
      alert('Please enter Worker Name and Phone');
      return;
    }

    addWorker(newWorkerName.trim(), newWorkerPhone.trim(), newWorkerRole);
    setNewWorkerName('');
    setNewWorkerPhone('');
    confetti({
      particleCount: 55,
      spread: 45,
      colors: isDark ? ['#06B6D4', '#3B82F6'] : ['#F97316', '#FBBF24']
    });
    alert('Worker registered successfully!');
  };

  // Settle driver collections
  const handleSettleDriverCash = (serialNumber: string, expectedAmount: number) => {
    const rawVal = cashReturnedAmounts[serialNumber];
    const amount = rawVal !== undefined ? parseFloat(rawVal) : expectedAmount;

    if (isNaN(amount) || amount < 0) {
      alert('Please enter a valid cash amount');
      return;
    }

    const success = settleDriverCash(serialNumber, amount);
    if (success) {
      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.6 }
      });
    } else {
      alert('Failed to settle cash.');
    }
  };

  // Filter cylinders
  const filteredCylinders = cylinders.filter((c) => {
    const matchesSearch = 
      c.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer?.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.customer?.customerPhone.includes(searchQuery) ||
      c.gasType.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    if (activeTab === 'Overdue') {
      return (
        c.status === 'Issued to Customer' && 
        c.customer && 
        new Date(c.customer.expectedReturnDate) < new Date()
      );
    }
    if (activeTab === 'Deliveries') {
      return (
        c.status === 'Issued to Customer' &&
        c.customer &&
        c.customer.deliveryType === 'Delivery'
      );
    }
    return c.status === activeTab;
  });

  const availableCylindersForIssue = cylinders.filter(
    (c) => c.status === 'Filled (In Stock)'
  );

  const getWhatsAppLink = (cyl: Cylinder) => {
    if (!cyl.customer) return '#';
    const message = `Salam ${cyl.customer.customerName}, this is a reminder from Khan Hardware about oxygen cylinder ${cyl.serialNumber}. Expected return was ${cyl.customer.expectedReturnDate.split('T')[0]}. Please return it to claim deposit of Rs. ${cyl.customer.securityDeposit}.`;
    const cleanPhone = cyl.customer.customerPhone.replace(/[^0-9+]/g, '');
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const overdueCount = cylinders.filter(c => {
    if (c.status !== 'Issued to Customer' || !c.customer) return false;
    return new Date(c.customer.expectedReturnDate) < new Date();
  }).length;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <Database className={`h-6 w-6 ${isDark ? '-400' : 'text-orange-600'}`} />
            Cylinder Lifecycle Management
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Track status, customer issues, driver deliveries, deposits, and returns.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setIsWorkerModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl transition-all shadow-sm ${
              isDark 
                ? 'bg-slate-900 border-slate-800 hover:-800 text-slate-200' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <UserCheck className="h-4.5 w-4.5 text-slate-500" />
            Workers & Drivers
          </button>
          <button
            onClick={() => setIsAddCylinderModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl transition-all shadow-sm ${
              isDark 
                ? 'bg-slate-900 border-slate-800 hover:-800 text-slate-200' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <Plus className="h-4.5 w-4.5 text-slate-500" />
            Add Cylinder
          </button>
          <button
            onClick={() => {
              const filled = cylinders.find(c => c.status === 'Filled (In Stock)');
              if (filled) setSelectedSerial(filled.serialNumber);
              setIsIssueModalOpen(true);
            }}
            className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl transition-all ${
              isDark 
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-500/20 shadow-cyan-glow' 
                : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-orange-500/10 shadow-md shadow-orange-600/10'
            }`}
          >
            <UserPlus className="h-4.5 w-4.5" />
            Issue Cylinder
          </button>
          <button
            onClick={() => setIsReturnModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl transition-all shadow-sm ${
              isDark 
                ? 'bg-emerald-600/90 hover:-600 text-white border-emerald-500/20' 
                : 'bg-emerald-600 hover:-500 text-white border-emerald-500/10'
            }`}
          >
            <ArrowLeftRight className="h-4.5 w-4.5" />
            Receive Return
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 border rounded-2xl shadow-sm ${
        isDark ? '-900 -800' : 'bg-white border-slate-200'
      }`}>
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Serial No., Customer Name or Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-xl text-sm transition-colors ${
              isDark 
                ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700 placeholder:text-slate-500' 
                : 'bg-white -200 text-slate-800 focus:-300 placeholder:text-slate-400'
            }`}
          />
        </div>
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'all', label: 'All Cylinders' },
            { id: 'Filled (In Stock)', label: 'Filled / In Stock' },
            { id: 'Issued to Customer', label: 'With Customers' },
            { id: 'Returned (Empty)', label: 'Returned (Empty)' },
            { id: 'Under Refill', label: 'Under Refill' },
            { id: 'Deliveries', label: 'Driver Deliveries' },
            { id: 'Overdue', label: 'Overdue Alerts', badge: overdueCount > 0 ? overdueCount : undefined }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                activeTab === tab.id
                  ? isDark
                    ? 'bg-slate-800 text-white border-slate-700 shadow-sm'
                    : 'bg-slate-100 text-slate-800 -200 shadow-sm'
                  : isDark
                    ? '-400 hover:text-slate-200 hover:bg-slate-800/35 border-transparent'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border-transparent'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isDark 
                    ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                    : '-100 text-red-600 border-red-200'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries specific view vs default grid view */}
      {activeTab === 'Deliveries' ? (
        <div className={`border rounded-2xl overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300 shadow-cyan-glow' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {filteredCylinders.length === 0 ? (
            <div className={`py-16 text-center text-slate-400 text-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
              No delivery cylinders currently assigned to drivers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full text-left border-collapse text-xs sm:text-sm ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                <thead>
                  <tr className={`border-b ${
                    isDark 
                      ? 'border-slate-800 bg-slate-900/80 text-slate-400' 
                      : 'border-slate-200 bg-slate-50 -500'
                  } font-semibold uppercase tracking-wider`}>
                    <th className="p-4">Cylinder Serial</th>
                    <th className="p-4">Customer Details</th>
                    <th className="p-4">Assigned Driver</th>
                    <th className="p-4">Delivery Status</th>
                    <th className="p-4">Expected Cash</th>
                    <th className="p-4 text-right">Cash Return Settle</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  {filteredCylinders.map((cyl) => {
                    if (!cyl.customer) return null;
                    const driver = workers.find(w => w.id === cyl.customer?.assignedWorkerId);
                    const expectedTotal = cyl.customer.securityDeposit + cyl.customer.refillCharges;
                    const isSettled = cyl.customer.cashReturned;

                    return (
                      <tr key={cyl.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-300 font-medium ${
                        isDark ? 'border-b border-slate-800/60' : 'border-b border-slate-100'
                      }`}>
                        <td className={`p-4 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          <p className="font-bold">{cyl.serialNumber}</p>
                          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            {cyl.capacity} • {cyl.gasType}
                          </span>
                        </td>
                        
                        <td className="p-4">
                          <p className={`font-bold ${isDark ? '-200' : '-700'}`}>{cyl.customer.customerName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{cyl.customer.customerPhone}</p>
                        </td>
                        
                        <td className="p-4 font-semibold -600 dark:text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-slate-400" />
                            <span>{driver ? driver.name : <span className="text-slate-400 font-normal">Unassigned</span>}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 ml-5 font-normal">{driver?.phone}</p>
                        </td>
                        
                        <td className="p-4">
                          <select
                            value={cyl.customer.deliveryStatus}
                            onChange={(e) => updateDeliveryStatus(cyl.serialNumber, e.target.value as any)}
                            disabled={isSettled}
                            className={`px-2 py-1 border rounded-lg text-xs focus:outline-none ${
                              isDark ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-white -200 text-slate-700'
                            } ${
                              cyl.customer.deliveryStatus === 'Delivered' ? 'text-emerald-700 border-emerald-200 bg-emerald-50/20' :
                              cyl.customer.deliveryStatus === 'Out for Delivery' ? 'text-blue-700 border-blue-200 bg-blue-50/20' :
                              cyl.customer.deliveryStatus === 'Failed' ? '-700 border-red-200 bg-red-50/20' :
                              'text-slate-600 border-slate-200'
                            }`}
                          >
                            <option value="Assigned">Assigned</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </td>
                        
                        <td className={`p-4 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                          {formatCurrency(expectedTotal)}
                          <span className="block text-[9px] font-normal -400 mt-0.5">
                            Dep: {cyl.customer.securityDeposit} / Refill: {cyl.customer.refillCharges}
                          </span>
                        </td>
                        
                        <td className="p-4 text-right">
                          {isSettled ? (
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 -700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25 text-[10px] font-bold rounded-full uppercase">
                                Cash Returned
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Returned: {formatCurrency(cyl.customer.cashAmountReturned)}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <div className="relative w-28">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">Rs.</span>
                                <input
                                  type="number"
                                  placeholder={String(expectedTotal)}
                                  value={cashReturnedAmounts[cyl.serialNumber] !== undefined ? cashReturnedAmounts[cyl.serialNumber] : ''}
                                  onChange={(e) => setCashReturnedAmounts({
                                    ...cashReturnedAmounts,
                                    [cyl.serialNumber]: e.target.value
                                  })}
                                  className={`w-full pl-8 pr-2 py-1 border rounded-lg text-xs text-right focus:outline-none shadow-sm ${
                                    isDark 
                                      ? 'bg-slate-950 border-slate-800 -200 focus:border-slate-700' 
                                      : 'bg-white -200 -800 focus:-300 font-bold'
                                  }`}
                                />
                              </div>
                              <button
                                onClick={() => handleSettleDriverCash(cyl.serialNumber, expectedTotal)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors shadow-sm"
                              >
                                Settle
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Grid of Cylinders */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCylinders.length === 0 ? (
            <div className={`col-span-full py-16 text-center border rounded-2xl -400 shadow-sm ${
              isDark ? 'bg-slate-900 border-slate-800 shadow-cyan-glow-hover' : 'bg-white border-slate-200'
            }`}>
              No cylinders found matching current criteria.
            </div>
          ) : (
            filteredCylinders.map((cyl) => {
              const isOverdue = 
                cyl.status === 'Issued to Customer' && 
                cyl.customer && 
                new Date(cyl.customer.expectedReturnDate) < new Date();
                
              return (
                <div 
                  key={cyl.id}
                  className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm ${
                    isOverdue 
                      ? 'border-red-200 bg-red-50/10 dark:border-red-900/60 dark:shadow-red-glow hover:border-red-300 dark:hover:border-red-800' 
                      : isDark
                        ? 'bg-slate-900 border-slate-800 hover:-700 hover:shadow-cyan-glow text-slate-200'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md text-slate-800'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold flex items-center gap-1.5 text-sm sm:text-base">
                        {cyl.serialNumber}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5 tracking-wider">
                        {cyl.capacity} • {cyl.gasType}
                      </p>
                    </div>
                    
                    {/* Status Badge */}
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border whitespace-nowrap shrink-0 ${
                      cyl.status === 'Filled (In Stock)' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                      cyl.status === 'Issued to Customer' ? (isOverdue ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30' : 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20') :
                      cyl.status === 'Returned (Empty)' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' :
                      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20'
                    }`}>
                      {isOverdue ? 'Overdue' : cyl.status}
                    </span>
                  </div>

                  {/* Details Section */}
                  <div className={`my-5 border-t pt-4 flex-1 ${isDark ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    {cyl.status === 'Issued to Customer' && cyl.customer ? (
                      // Customer Detail Mode
                      <div className="space-y-2.5 text-xs text-slate-600 dark:-300">
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold truncate">{cyl.customer.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{cyl.customer.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-mono text-[11px]">{cyl.customer.customerCnic}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>Due: <FormattedDate dateString={cyl.customer.expectedReturnDate} /></span>
                        </div>
                        <div className={`flex items-center gap-2 font-bold border-t pt-2 justify-between ${
                          isDark ? 'text-cyan-400 border-slate-800' : 'text-amber-700 border-slate-100'
                        }`}>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5 text-amber-500" />
                            <span>Deposit: PKR {cyl.customer.securityDeposit}</span>
                          </div>
                          {cyl.customer.deliveryType === 'Delivery' && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold uppercase ${
                              isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25' : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              Delivery
                            </span>
                          )}
                        </div>
                      </div>
                    ) : (
                      // Stock/Refill Mode details
                      <div className="h-full flex flex-col justify-center text-xs -400 py-2">
                        <p>Last checked: <FormattedDate dateString={cyl.updatedAt} /></p>
                        <p className="mt-1">
                          {cyl.status === 'Filled (In Stock)' ? 'Ready to be issued.' :
                           cyl.status === 'Returned (Empty)' ? 'Awaiting refill deployment.' :
                           'Currently at cylinder refilling plant.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer Buttons for Lifecycle Transitions */}
                  <div className={`border-t pt-3 flex items-center justify-between gap-2.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    {cyl.status === 'Issued to Customer' ? (
                      <>
                        <button
                          onClick={() => {
                            setReturnSearchSerial(cyl.serialNumber);
                            setIsReturnModalOpen(true);
                          }}
                          className={`flex-1 text-center py-1.5 border text-xs font-semibold rounded-lg transition-all shadow-sm ${
                            isDark 
                              ? 'bg-slate-800 hover:-700 border-slate-700 text-slate-300' 
                              : 'bg-slate-50 hover:bg-slate-100 -200 text-slate-700'
                          }`}
                        >
                          Receive Return
                        </button>
                        {isOverdue && (
                          <a
                            href={getWhatsAppLink(cyl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
                            title="Send WhatsApp Reminder"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </a>
                        )}
                      </>
                    ) : cyl.status === 'Returned (Empty)' ? (
                      <button
                        onClick={() => {
                          sendToRefill(cyl.serialNumber);
                          confetti({ particleCount: 30, colors: ['#3B82F6'] });
                        }}
                        className={`w-full py-1.5 border text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          isDark 
                            ? 'bg-blue-600/15 hover:bg-blue-600 border-blue-500/25 text-blue-400 hover:text-white' 
                            : 'bg-blue-50 hover:bg-blue-100 border-blue-200 -700'
                        }`}
                      >
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                        Send to Refill
                      </button>
                    ) : cyl.status === 'Under Refill' ? (
                      <button
                        onClick={() => {
                          completeRefill(cyl.serialNumber);
                          confetti({ particleCount: 50, colors: ['#10B981'] });
                        }}
                        className={`w-full py-1.5 border text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                          isDark 
                            ? '-600 border border-emerald-600/40 text-white shadow-sm' 
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/10'
                        }`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark Refill Complete
                      </button>
                    ) : (
                      // Filled / Stocked
                      <button
                        onClick={() => {
                          setSelectedSerial(cyl.serialNumber);
                          setIsIssueModalOpen(true);
                        }}
                        className={`w-full py-1.5 border text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                          isDark 
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 text-white shadow-cyan-glow' 
                            : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white border-orange-500/10 shadow-md shadow-orange-600/10'
                        }`}
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        Issue to Customer
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 1. ISSUE CYLINDER MODAL */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl animate-scale-in transition-colors duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-cyan-glow' : 'bg-white border-slate-200 -800'
          }`}>
            <button 
              onClick={() => setIsIssueModalOpen(false)}
              className={`absolute top-4 right-4 ${isDark ? 'text-slate-500 hover:-300' : 'text-slate-400 hover:-600'}`}
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <UserPlus className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-orange-600'}`} />
              Issue Cylinder to Customer
            </h3>
            <p className="text-xs text-slate-500 mb-6">Assign cylinder stock and track deposits.</p>

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Select Cylinder (In Stock)</label>
                <select
                  value={selectedSerial}
                  onChange={(e) => setSelectedSerial(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none shadow-sm ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                      : 'bg-white -300 text-slate-800 focus:border-orange-500'
                  }`}
                >
                  <option value="">-- Choose Cylinder --</option>
                  {availableCylindersForIssue.map(c => (
                    <option key={c.id} value={c.serialNumber}>
                      {c.serialNumber} ({c.capacity} - {c.gasType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Customer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asif Raza"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none placeholder:text-slate-400 shadow-sm ${
                      isDark 
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                        : 'bg-white -300 text-slate-800 focus:border-orange-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +923001234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none placeholder:text-slate-400 shadow-sm ${
                      isDark 
                        ? '-950 -800 text-slate-200 focus:border-slate-700' 
                        : 'bg-white -300 text-slate-800 focus:border-orange-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">National ID / CNIC</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 35201-1234567-9"
                  value={customerCnic}
                  onChange={(e) => setCustomerCnic(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none placeholder:text-slate-400 shadow-sm ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                      : 'bg-white -300 text-slate-800 focus:border-orange-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Security Deposit (PKR)</label>
                  <input
                    type="number"
                    required
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-bold shadow-sm ${
                      isDark 
                        ? 'bg-slate-950 border-slate-800 text-cyan-400 focus:border-slate-700' 
                        : 'bg-white -300 text-orange-600 focus:border-orange-500'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Refill Charges (PKR)</label>
                  <input
                    type="number"
                    required
                    value={refillCharges}
                    onChange={(e) => setRefillCharges(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-bold shadow-sm ${
                      isDark 
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                        : 'bg-white -300 text-slate-800 focus:border-orange-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Expected Return Date</label>
                <input
                  type="date"
                  required
                  value={expectedReturnDate}
                  onChange={(e) => setExpectedReturnDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none shadow-sm ${
                    isDark 
                      ? '-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                      : 'bg-white -300 text-slate-800 focus:border-orange-500'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Delivery Method</label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as any)}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-bold shadow-sm ${
                      isDark 
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                        : 'bg-white -300 -800 focus:border-orange-500'
                    }`}
                  >
                    <option value="Pickup">Self-Pickup</option>
                    <option value="Delivery">Driver Delivery</option>
                  </select>
                </div>
                {deliveryType === 'Delivery' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">Assign Driver</label>
                    <select
                      value={assignedWorkerId}
                      onChange={(e) => setAssignedWorkerId(e.target.value)}
                      required
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-bold shadow-sm ${
                        isDark 
                          ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                          : 'bg-white -300 -800 focus:border-orange-500'
                      }`}
                    >
                      <option value="">-- Select Driver --</option>
                      {workers.filter(w => w.role === 'Driver' && w.isActive).map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 mt-2 text-white font-bold rounded-xl transition-all border ${
                  isDark 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 shadow-cyan-glow' 
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border-orange-500/10 shadow-md shadow-orange-600/10'
                }`}
              >
                Complete Issue & Collect Deposit
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. RECEIVE RETURN / FAST RETURN MODAL */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl animate-scale-in transition-colors duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-cyan-glow' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => {
                setIsReturnModalOpen(false);
                setReturnSearchSerial('');
                setFoundReturnCylinder(null);
              }}
              className={`absolute top-4 right-4 ${isDark ? 'text-slate-500 hover:-300' : 'text-slate-400 hover:-600'}`}
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <ArrowLeftRight className={`h-5 w-5 ${isDark ? 'text-cyan-400' : 'text-emerald-600'}`} />
              Fast Cylinder Return Process
            </h3>
            <p className="text-xs text-slate-500 mb-6">Scan barcode or search serial to refund deposit and settle account.</p>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Cylinder Serial Number / Scan Tag</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 -400" />
                  <input
                    type="text"
                    required
                    placeholder="Scan or type e.g. CYL-240-003"
                    value={returnSearchSerial}
                    onChange={(e) => setReturnSearchSerial(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 border rounded-xl focus:outline-none placeholder:text-slate-400 font-bold shadow-sm ${
                      isDark 
                        ? '-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                        : 'bg-white -300 text-slate-800 focus:border-orange-500'
                    }`}
                    autoFocus
                  />
                </div>
              </div>

              {foundReturnCylinder ? (
                <div className={`border p-4 rounded-xl space-y-3 animate-fade-in text-xs ${
                  isDark ? '-950/50 -800' : '-50 border-slate-200'
                }`}>
                  <div className={`flex justify-between items-start border-b pb-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Cylinder Info</span>
                      <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{foundReturnCylinder.serialNumber}</span>
                      <span className="-400 ml-1.5">({foundReturnCylinder.capacity})</span>
                    </div>
                    <span className={`px-2 py-0.5 border font-bold rounded-full text-[9px] ${
                      isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      Issued Out
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="-400">Customer:</span>
                      <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{foundReturnCylinder.customer?.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="-400">Phone:</span>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{foundReturnCylinder.customer?.customerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="-400">Issue Date:</span>
                      <span className={isDark ? 'text-slate-300' : 'text-slate-700'}><FormattedDate dateString={foundReturnCylinder.customer!.issueDate} /></span>
                    </div>
                    <div className={`flex justify-between border-t pt-2 font-bold ${isDark ? 'text-cyan-400 border-slate-800' : 'text-amber-700 border-slate-100'}`}>
                      <span>Refundable Security Deposit:</span>
                      <span>PKR {foundReturnCylinder.customer?.securityDeposit}</span>
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-lg flex items-start gap-2 mt-2 border ${
                    isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                  }`}>
                    <ShieldCheck className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold uppercase">Ready for Settlement</p>
                      <p className="-400 dark:text-slate-400 text-[10px] leading-relaxed mt-0.5 font-medium">Settle deposit refund. The cylinder will be marked as "Returned (Empty)" and ready for refilling.</p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 mt-2 text-white font-bold rounded-xl transition-all border ${
                      isDark 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 shadow-cyan-glow' 
                        : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border-orange-500/10 shadow-md shadow-orange-600/10'
                    }`}
                  >
                    Confirm Settle & Return
                  </button>
                </div>
              ) : (
                returnSearchSerial.trim() && (
                  <div className={`p-4 border rounded-xl flex items-start gap-2.5 text-xs ${
                    isDark ? 'bg-red-950/20 border-red-900/40 text-red-400' : 'bg-red-50 -100 -700'
                  }`}>
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 animate-bounce" />
                    <div>
                      <p className="font-bold">No Active Cylinder Found</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-normal font-medium">Cylinder is either already in stock, refilling, or serial does not exist. Verify the Serial Number.</p>
                    </div>
                  </div>
                )
              )}
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD CYLINDER MODAL */}
      {isAddCylinderModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-md p-6 relative overflow-hidden shadow-2xl animate-scale-in transition-colors duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-cyan-glow' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setIsAddCylinderModalOpen(false)}
              className={`absolute top-4 right-4 ${isDark ? 'text-slate-500 hover:-300' : 'text-slate-400 hover:-600'}`}
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
              <Database className={`h-5 w-5 ${isDark ? '-400' : '-600'}`} />
              Register New Cylinder
            </h3>
            <p className="text-xs text-slate-500 mb-6">Create inventory cylinder profile for tracking.</p>

            <form onSubmit={handleAddCylinderSubmit} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5">Serial Number / Tag ID</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CYL-240-025"
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-xl focus:outline-none placeholder:text-slate-400 font-bold tracking-wider shadow-sm ${
                    isDark 
                      ? 'bg-slate-950 border-slate-800 -200 focus:border-slate-700' 
                      : 'bg-white -300 text-slate-800 focus:border-orange-500'
                  }`}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Gas Type</label>
                  <select
                    value={newGasType}
                    onChange={(e) => setNewGasType(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-bold shadow-sm ${
                      isDark 
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                        : 'bg-white -300 text-slate-800 focus:border-orange-500'
                    }`}
                  >
                    <option value="Medical Oxygen">Medical Oxygen</option>
                    <option value="Industrial Oxygen">Industrial Oxygen</option>
                    <option value="Argon Gas">Argon Gas</option>
                    <option value="Nitrous Oxide">Nitrous Oxide</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Capacity</label>
                  <select
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-bold shadow-sm ${
                      isDark 
                        ? 'bg-slate-950 border-slate-800 text-slate-200 focus:border-slate-700' 
                        : 'bg-white -300 text-slate-800 focus:border-orange-500'
                    }`}
                  >
                    <option value="240 cu ft">240 cu ft (Jumbo)</option>
                    <option value="40L">40 Liters</option>
                    <option value="10L">10 Liters</option>
                    <option value="24L">24 Liters</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 mt-2 text-white font-bold rounded-xl transition-all border ${
                  isDark 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 shadow-cyan-glow' 
                    : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border-orange-500/10 shadow-md shadow-orange-600/10'
                }`}
              >
                Add Cylinder to Inventory
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. WORKERS & DRIVERS REGISTRY MODAL */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-xl p-6 relative shadow-2xl flex flex-col justify-between max-h-[90vh] overflow-y-auto animate-scale-in transition-colors duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-cyan-glow' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => setIsWorkerModalOpen(false)}
              className={`absolute top-4 right-4 ${isDark ? 'text-slate-500 hover:-300' : 'text-slate-400 hover:-600'}`}
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-1">
                <UserCheck className={`h-5 w-5 ${isDark ? '-400' : 'text-orange-600'}`} />
                Workers & Drivers Management
              </h3>
              <p className="text-xs text-slate-500 mb-6">Register and track drivers and loaders responsible for deliveries.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Driver Registration Form */}
                <div className={`space-y-4 pr-0 md:pr-6 border-r ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'}`}>Register New Worker</h4>
                  <form onSubmit={handleAddWorkerSubmit} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block -500 dark:text-slate-400 font-bold mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Salim Shah"
                        value={newWorkerName}
                        onChange={(e) => setNewWorkerName(e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg focus:outline-none shadow-sm ${
                          isDark 
                            ? 'bg-slate-950 border-slate-800 -200 focus:border-slate-700' 
                            : 'bg-white -300 text-slate-800 focus:border-orange-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block -500 dark:text-slate-400 font-bold mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +923456789012"
                        value={newWorkerPhone}
                        onChange={(e) => setNewWorkerPhone(e.target.value)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg focus:outline-none shadow-sm ${
                          isDark 
                            ? '-950 -800 -200 focus:border-slate-700' 
                            : 'bg-white -300 text-slate-800 focus:border-orange-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block -500 dark:text-slate-400 font-bold mb-1">Role Type</label>
                      <select
                        value={newWorkerRole}
                        onChange={(e) => setNewWorkerRole(e.target.value as any)}
                        className={`w-full px-2.5 py-1.5 border rounded-lg focus:outline-none shadow-sm ${
                          isDark 
                            ? 'bg-slate-950 border-slate-800 -200 focus:border-slate-700' 
                            : 'bg-white -300 text-slate-800 focus:border-orange-500'
                        }`}
                      >
                        <option value="Driver">Driver / Deliveryman</option>
                        <option value="Loader">Store Helper / Loader</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className={`w-full py-2 text-white font-bold rounded-lg transition-colors border shadow-sm ${
                        isDark 
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-500/20 shadow-cyan-glow' 
                          : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 border-orange-500/10'
                      }`}
                    >
                      Save Register Details
                    </button>
                  </form>
                </div>

                {/* Workers List Display */}
                <div className="space-y-4">
                  <h4 className={`text-xs font-bold uppercase tracking-wider border-b pb-1 ${isDark ? 'text-slate-400 border-slate-800' : '-500 border-slate-100'}`}>Active Store Personnel</h4>
                  <div className={`space-y-2 max-h-[220px] overflow-y-auto divide-y ${isDark ? 'divide-slate-800/40' : 'divide-slate-100'}`}>
                    {workers.map((w) => (
                      <div key={w.id} className="pt-2 pb-2 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{w.name}</p>
                          <p className="text-[10px] -400 mt-0.5">{w.phone}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                          w.role === 'Driver' 
                            ? isDark 
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                              : 'bg-blue-50 -700 border-blue-200' 
                            : isDark
                              ? 'bg-slate-800 border-slate-700 text-slate-400'
                              : 'bg-slate-100 text-slate-600 -200'
                        }`}>
                          {w.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
            
            <div className={`border-t mt-6 pt-4 flex justify-end ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => setIsWorkerModalOpen(false)}
                className={`px-4 py-2 border font-bold rounded-xl text-xs sm:text-sm shadow-sm ${
                  isDark 
                    ? '-800 -700 text-slate-300 hover:bg-slate-800' 
                    : 'bg-slate-100 hover:bg-slate-200 -700 border-slate-200'
                }`}
              >
                Close Window
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function CylinderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center text-slate-500 font-semibold">
        Loading Cylinder Management...
      </div>
    }>
      <CylinderPageContent />
    </Suspense>
  );
}
