import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CylinderStatus = 
  | 'Filled (In Stock)' 
  | 'Issued to Customer' 
  | 'Returned (Empty)' 
  | 'Under Refill';

export interface CustomerDetails {
  customerName: string;
  customerPhone: string;
  customerCnic: string;
  issueDate: string;
  expectedReturnDate: string;
  securityDeposit: number;
  refillCharges: number;
  
  // Delivery Logistics
  deliveryType: 'Pickup' | 'Delivery';
  assignedWorkerId: string | null;
  deliveryStatus: 'Assigned' | 'Out for Delivery' | 'Delivered' | 'Failed' | 'N/A';
  cashCollected: number; // expected cash to collect from customer
  cashReturned: boolean; // has driver returned it to shop?
  cashAmountReturned: number; // actual cash amount returned by driver
  cashReturnedAt: string | null;
}

export interface Cylinder {
  id: string;
  serialNumber: string;
  capacity: string;
  gasType: string;
  status: CylinderStatus;
  customer?: CustomerDetails;
  updatedAt: string;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  role: 'Driver' | 'Loader';
  isActive: boolean;
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  costPrice: number;
  retailPrice: number;
  stockQuantity: number;
  minThreshold: number;
  unit?: 'piece' | 'kg' | 'meter' | 'coil' | 'bundle' | 'box';
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface HeldCart {
  id: string;
  note: string;
  customerName?: string;
  items: CartItem[];
  createdAt: string;
}

export interface SaleItem {
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costPrice?: number;
}

export interface SalesTransaction {
  id: string;
  receiptNumber: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  items: SaleItem[];
  createdAt: string;
  status?: 'Completed' | 'Refunded';
  refundedAt?: string;
  refundReason?: string;
  khataCustomerId?: string;
}

export interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  balancePayable: number;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Received' | 'Cancelled';
  createdAt: string;
  receivedAt?: string;
}

export interface Expense {
  id: string;
  category: 'Utilities' | 'Rent' | 'Staff Wages' | 'Transportation' | 'Maintenance' | 'Misc';
  amount: number;
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface KhataTransaction {
  id: string;
  type: 'DEBIT_SALE' | 'CREDIT_PAYMENT';
  amount: number;
  reference: string;
  notes?: string;
  date: string;
}

export interface CustomerKhata {
  id: string;
  customerName: string;
  phone: string;
  cnic?: string;
  creditLimit: number;
  currentBalance: number;
  transactions: KhataTransaction[];
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  category: 'POS' | 'INVENTORY' | 'VENDOR' | 'DRAWER' | 'SYSTEM';
  performedBy: string;
  timestamp: string;
  details: string;
}

export interface CashDrawerReconciliation {
  id: string;
  date: string;
  openingFloat: number;
  cashSales: number;
  cashRefunds: number;
  pettyCashExpenses: number;
  expectedClosingCash: number;
  actualClosingCash: number;
  discrepancy: number;
  closedBy: string;
  notes?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'Cashier' | 'Driver';
  avatar?: string;
}

export const registeredUsers: (UserAccount & { password: string })[] = [
  { id: 'u1', username: 'admin', password: 'admin123', name: 'Shahzil Ahmed (Owner)', role: 'Admin' },
  { id: 'u2', username: 'cashier', password: 'cashier123', name: 'Muhammad Bilal (POS)', role: 'Cashier' },
  { id: 'u3', username: 'driver', password: 'driver123', name: 'Zeeshan Khan (Delivery)', role: 'Driver' },
];

interface AppState {
  cylinders: Cylinder[];
  products: Product[];
  sales: SalesTransaction[];
  cart: CartItem[];
  heldCarts: HeldCart[];
  vendors: Vendor[];
  purchaseOrders: PurchaseOrder[];
  expenses: Expense[];
  khatas: CustomerKhata[];
  auditLogs: AuditLog[];
  reconciliations: CashDrawerReconciliation[];
  workers: Worker[];
  openingFloat: number;
  themeMode: 'light' | 'dark';
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  
  // Auth actions
  login: (username: string, password: string) => boolean;
  logout: () => void;
  
  // Cylinder actions
  issueCylinder: (serialNumber: string, details: CustomerDetails) => boolean;
  returnCylinder: (serialNumber: string, notes?: string) => boolean;
  sendToRefill: (serialNumber: string) => boolean;
  completeRefill: (serialNumber: string) => boolean;
  addCylinder: (cylinder: Omit<Cylinder, 'id' | 'status' | 'updatedAt'>) => void;
  
  // Worker & Delivery actions
  settleDriverCash: (serialNumber: string, amountReturned: number) => boolean;
  updateDeliveryStatus: (serialNumber: string, status: CustomerDetails['deliveryStatus']) => boolean;
  addWorker: (name: string, phone: string, role: 'Driver' | 'Loader') => void;
  
  // POS & Hold Cart actions
  addToCart: (productOrBarcode: Product | string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  holdCart: (note: string, customerName?: string) => boolean;
  resumeCart: (heldCartId: string) => boolean;
  deleteHeldCart: (heldCartId: string) => void;
  checkoutCart: (discount: number, taxRate: number, paymentMethod: string, khataCustomerId?: string) => SalesTransaction | null;
  refundTransaction: (transactionId: string, reason?: string) => boolean;
  
  // Vendor & Procurement actions
  addVendor: (vendor: Omit<Vendor, 'id' | 'createdAt' | 'balancePayable'>) => void;
  createPurchaseOrder: (vendorId: string, items: { productId: string; quantity: number; unitCost: number }[]) => PurchaseOrder | null;
  receiveGoodsNote: (poId: string) => boolean;
  recordVendorPayment: (vendorId: string, amount: number, notes?: string) => boolean;
  
  // Expense & Cash Drawer actions
  addExpense: (category: Expense['category'], amount: number, description: string) => void;
  setOpeningFloat: (amount: number) => void;
  reconcileCashDrawer: (actualCash: number, notes?: string) => CashDrawerReconciliation;
  
  // Customer Khata actions
  addKhataCustomer: (name: string, phone: string, cnic?: string, creditLimit?: number) => CustomerKhata;
  recordKhataPayment: (khataId: string, amount: number, reference: string) => boolean;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProductStock: (id: string, newStock: number) => void;
  adjustProductStock: (id: string, newStock: number, reason: string) => void;
  
  // System actions
  logAuditEvent: (action: string, category: AuditLog['category'], details: string) => void;
  toggleThemeMode: () => void;
}

// Initial Mock Workers
const initialWorkers: Worker[] = [
  { id: 'w1', name: 'Zeeshan Khan', phone: '+923055556666', role: 'Driver', isActive: true },
  { id: 'w2', name: 'Kamran Ali', phone: '+923134449999', role: 'Driver', isActive: true },
  { id: 'w3', name: 'Bilal Sajid', phone: '+923218887777', role: 'Loader', isActive: true }
];

// Initial Mock Cylinder Data
const initialCylinders: Cylinder[] = [
  {
    id: 'c1',
    serialNumber: 'CYL-240-001',
    capacity: '240 cu ft',
    gasType: 'Medical Oxygen',
    status: 'Filled (In Stock)',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c2',
    serialNumber: 'CYL-040-002',
    capacity: '40L',
    gasType: 'Industrial Oxygen',
    status: 'Filled (In Stock)',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c3',
    serialNumber: 'CYL-240-003',
    capacity: '240 cu ft',
    gasType: 'Medical Oxygen',
    status: 'Issued to Customer',
    customer: {
      customerName: 'Ahmad Bilal',
      customerPhone: '+923001234567',
      customerCnic: '35201-1234567-9',
      issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      expectedReturnDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days in future
      securityDeposit: 15000,
      refillCharges: 2500,
      deliveryType: 'Pickup',
      assignedWorkerId: null,
      deliveryStatus: 'N/A',
      cashCollected: 17500,
      cashReturned: true,
      cashAmountReturned: 17500,
      cashReturnedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c4',
    serialNumber: 'CYL-040-004',
    capacity: '40L',
    gasType: 'Medical Oxygen',
    status: 'Issued to Customer',
    customer: {
      customerName: 'Dr. Yasmin Khan (City Hospital)',
      customerPhone: '+923129876543',
      customerCnic: '35202-9876543-2',
      issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
      expectedReturnDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (OVERDUE!)
      securityDeposit: 12000,
      refillCharges: 2200,
      deliveryType: 'Delivery',
      assignedWorkerId: 'w1', // Zeeshan Khan
      deliveryStatus: 'Delivered',
      cashCollected: 14200, // Expected amount: 12000 + 2200
      cashReturned: false,
      cashAmountReturned: 0,
      cashReturnedAt: null
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c5',
    serialNumber: 'CYL-010-005',
    capacity: '10L',
    gasType: 'Medical Oxygen',
    status: 'Returned (Empty)',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c6',
    serialNumber: 'CYL-240-006',
    capacity: '240 cu ft',
    gasType: 'Industrial Oxygen',
    status: 'Under Refill',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c7',
    serialNumber: 'CYL-040-007',
    capacity: '40L',
    gasType: 'Medical Oxygen',
    status: 'Issued to Customer',
    customer: {
      customerName: 'Muhammad Ali',
      customerPhone: '+923334445556',
      customerCnic: '34101-2345678-1',
      issueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
      expectedReturnDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday (OVERDUE!)
      securityDeposit: 15000,
      refillCharges: 2500,
      deliveryType: 'Delivery',
      assignedWorkerId: 'w2', // Kamran Ali
      deliveryStatus: 'Delivered',
      cashCollected: 17500,
      cashReturned: false,
      cashAmountReturned: 0,
      cashReturnedAt: null
    },
    updatedAt: new Date().toISOString()
  },
  {
    id: 'c8',
    serialNumber: 'CYL-010-008',
    capacity: '10L',
    gasType: 'Industrial Oxygen',
    status: 'Filled (In Stock)',
    updatedAt: new Date().toISOString()
  }
];

const initialProducts: Product[] = [
  {
    id: 'p1',
    barcode: '100000001',
    name: 'PVC Pipe 3-inch (10ft)',
    category: 'Plumbing',
    costPrice: 450,
    retailPrice: 650,
    stockQuantity: 45,
    minThreshold: 15,
    description: 'High-grade PVC plumbing pipe, weather resistant.'
  },
  {
    id: 'p2',
    barcode: '100000002',
    name: 'Steel Screws Box (100pcs)',
    category: 'Fasteners',
    costPrice: 120,
    retailPrice: 200,
    stockQuantity: 80,
    minThreshold: 20,
    description: '1.5 inch self-tapping drywall and wood steel screws.'
  },
  {
    id: 'p3',
    barcode: '100000003',
    name: 'Ingco Claw Hammer 16oz',
    category: 'Hand Tools',
    costPrice: 850,
    retailPrice: 1250,
    stockQuantity: 8,
    minThreshold: 10, // LOW STOCK!
    description: 'Ergonomic fiberglass handle carbon steel head hammer.'
  },
  {
    id: 'p4',
    barcode: '100000004',
    name: 'Teflon Thread Seal Tape',
    category: 'Plumbing',
    costPrice: 25,
    retailPrice: 50,
    stockQuantity: 120,
    minThreshold: 30,
    description: 'Standard plumber tape for leak-proof pipe threads.'
  },
  {
    id: 'p5',
    barcode: '100000005',
    name: 'Electric Wire 3/29 (90m)',
    category: 'Electrical',
    costPrice: 4200,
    retailPrice: 5400,
    stockQuantity: 4,
    minThreshold: 5, // LOW STOCK!
    description: 'Pure copper electric wire coil for residential wiring.'
  },
  {
    id: 'p6',
    barcode: '100000006',
    name: 'Adjustable Wrench 10-inch',
    category: 'Hand Tools',
    costPrice: 600,
    retailPrice: 950,
    stockQuantity: 15,
    minThreshold: 8,
    description: 'Heavy duty chrome vanadium steel adjustable spanner.'
  },
  {
    id: 'p7',
    barcode: '100000007',
    name: 'Screwdriver Set (6pcs)',
    category: 'Hand Tools',
    costPrice: 450,
    retailPrice: 750,
    stockQuantity: 3,
    minThreshold: 5, // LOW STOCK!
    description: 'Magnetic tip flat & phillips insulated screwdriver set.'
  },
  {
    id: 'p8',
    barcode: '100000008',
    name: 'LED Bulb 12W (E27)',
    category: 'Electrical',
    costPrice: 180,
    retailPrice: 280,
    stockQuantity: 50,
    minThreshold: 15,
    description: 'Energy saver daylight white LED bulb.'
  }
];

const initialSales: SalesTransaction[] = [
  {
    id: 's_101',
    receiptNumber: 'KH-2026-0001',
    subtotal: 6350,
    discount: 0,
    tax: 1079.5,
    total: 7429.5,
    paymentMethod: 'Cash',
    status: 'Completed',
    items: [
      { productId: 'p6', productName: 'Adjustable Wrench 10-inch', quantity: 1, unitPrice: 950, totalPrice: 950, costPrice: 600 },
      { productId: 'p5', productName: 'Electric Wire 3/29 (90m)', quantity: 1, unitPrice: 5400, totalPrice: 5400, costPrice: 4200 }
    ],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 's_102',
    receiptNumber: 'KH-2026-0002',
    subtotal: 2500,
    discount: 0,
    tax: 425,
    total: 2925,
    paymentMethod: 'Card',
    status: 'Completed',
    items: [
      { productId: 'p3', productName: 'Ingco Claw Hammer 16oz', quantity: 2, unitPrice: 1250, totalPrice: 2500, costPrice: 850 }
    ],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 's_103',
    receiptNumber: 'KH-2026-0003',
    subtotal: 1300,
    discount: 0,
    tax: 221,
    total: 1521,
    paymentMethod: 'Cash',
    status: 'Completed',
    items: [
      { productId: 'p1', productName: 'PVC Pipe 3-inch (10ft)', quantity: 2, unitPrice: 650, totalPrice: 1300, costPrice: 450 }
    ],
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
  }
];

const initialVendors: Vendor[] = [
  { id: 'v1', companyName: 'Pak Hardware Supplies Ltd.', contactPerson: 'Tariq Mehmood', phone: '+923005551122', email: 'tariq@pakhardware.pk', balancePayable: 45000, createdAt: new Date().toISOString() },
  { id: 'v2', companyName: 'Master Pipe & Sanitary Works', contactPerson: 'Asif Chaudhry', phone: '+923214443322', email: 'sales@masterpipes.pk', balancePayable: 120000, createdAt: new Date().toISOString() },
  { id: 'v3', companyName: 'National Oxygen Gas Depot', contactPerson: 'Imran Shah', phone: '+923337778899', email: 'imran@nationalgas.pk', balancePayable: 85000, createdAt: new Date().toISOString() }
];

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po_1',
    poNumber: 'PO-2026-0001',
    vendorId: 'v1',
    vendorName: 'Pak Hardware Supplies Ltd.',
    items: [
      { productId: 'p3', productName: 'Ingco Claw Hammer 16oz', quantity: 10, unitCost: 850, totalCost: 8500 },
      { productId: 'p6', productName: 'Adjustable Wrench 10-inch', quantity: 10, unitCost: 600, totalCost: 6000 }
    ],
    totalAmount: 14500,
    status: 'Received',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'po_2',
    poNumber: 'PO-2026-0002',
    vendorId: 'v2',
    vendorName: 'Master Pipe & Sanitary Works',
    items: [
      { productId: 'p1', productName: 'PVC Pipe 3-inch (10ft)', quantity: 50, unitCost: 450, totalCost: 22500 }
    ],
    totalAmount: 22500,
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialExpenses: Expense[] = [
  { id: 'e1', category: 'Rent', amount: 35000, description: 'Monthly Shop Space Rent (Feb 2026)', createdBy: 'Shahzil Ahmed (Owner)', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'e2', category: 'Utilities', amount: 14500, description: 'Electricity Bill LESCO', createdBy: 'Shahzil Ahmed (Owner)', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'e3', category: 'Transportation', amount: 3200, description: 'Delivery van diesel fuel fill-up', createdBy: 'Muhammad Bilal (POS)', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const initialKhatas: CustomerKhata[] = [
  {
    id: 'k1',
    customerName: 'Chaudhry Construction Co.',
    phone: '+923009988776',
    cnic: '35201-8899776-5',
    creditLimit: 150000,
    currentBalance: 42500,
    transactions: [
      { id: 'kt_1', type: 'DEBIT_SALE', amount: 42500, reference: 'KH-2026-0004', notes: 'Building materials on 15-day credit', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'k2',
    customerName: 'City Hospital Oxygen Wing',
    phone: '+923129876543',
    cnic: '35202-9876543-2',
    creditLimit: 200000,
    currentBalance: 68000,
    transactions: [
      { id: 'kt_2', type: 'DEBIT_SALE', amount: 68000, reference: 'KH-2026-0005', notes: 'Emergency medical oxygen cylinder refills', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
    ],
    updatedAt: new Date().toISOString()
  }
];

const initialAuditLogs: AuditLog[] = [
  { id: 'al_1', action: 'SYSTEM_STARTUP', category: 'SYSTEM', performedBy: 'System', timestamp: new Date().toISOString(), details: 'KhanHardware POS Enterprise Engine Initialized' }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cylinders: initialCylinders,
      products: initialProducts,
      sales: initialSales,
      cart: [],
      heldCarts: [],
      vendors: initialVendors,
      purchaseOrders: initialPurchaseOrders,
      expenses: initialExpenses,
      khatas: initialKhatas,
      auditLogs: initialAuditLogs,
      reconciliations: [],
      workers: initialWorkers,
      openingFloat: 5000,
      themeMode: 'light',
      currentUser: registeredUsers[0],
      isAuthenticated: true,

      // Cylinder status changes
      issueCylinder: (serialNumber, details) => {
        let success = false;
        set((state) => {
          const cylinderIndex = state.cylinders.findIndex(
            (c) => c.serialNumber.toLowerCase() === serialNumber.toLowerCase()
          );
          if (cylinderIndex === -1) return {};
          
          const cylinder = state.cylinders[cylinderIndex];
          if (cylinder.status !== 'Filled (In Stock)') return {};

          const updatedCylinders = [...state.cylinders];
          updatedCylinders[cylinderIndex] = {
            ...cylinder,
            status: 'Issued to Customer',
            customer: details,
            updatedAt: new Date().toISOString()
          };

          success = true;
          return { cylinders: updatedCylinders };
        });
        return success;
      },

      returnCylinder: (serialNumber, notes) => {
        let success = false;
        set((state) => {
          const cylinderIndex = state.cylinders.findIndex(
            (c) => c.serialNumber.toLowerCase() === serialNumber.toLowerCase()
          );
          if (cylinderIndex === -1) return {};

          const cylinder = state.cylinders[cylinderIndex];
          if (cylinder.status !== 'Issued to Customer') return {};

          const updatedCylinders = [...state.cylinders];
          updatedCylinders[cylinderIndex] = {
            ...cylinder,
            status: 'Returned (Empty)',
            customer: undefined, // Clear customer data on settle/return
            updatedAt: new Date().toISOString()
          };

          success = true;
          return { cylinders: updatedCylinders };
        });
        return success;
      },

      sendToRefill: (serialNumber) => {
        let success = false;
        set((state) => {
          const cylinderIndex = state.cylinders.findIndex(
            (c) => c.serialNumber.toLowerCase() === serialNumber.toLowerCase()
          );
          if (cylinderIndex === -1) return {};

          const cylinder = state.cylinders[cylinderIndex];
          if (cylinder.status !== 'Returned (Empty)') return {};

          const updatedCylinders = [...state.cylinders];
          updatedCylinders[cylinderIndex] = {
            ...cylinder,
            status: 'Under Refill',
            updatedAt: new Date().toISOString()
          };

          success = true;
          return { cylinders: updatedCylinders };
        });
        return success;
      },

      completeRefill: (serialNumber) => {
        let success = false;
        set((state) => {
          const cylinderIndex = state.cylinders.findIndex(
            (c) => c.serialNumber.toLowerCase() === serialNumber.toLowerCase()
          );
          if (cylinderIndex === -1) return {};

          const cylinder = state.cylinders[cylinderIndex];
          if (cylinder.status !== 'Under Refill') return {};

          const updatedCylinders = [...state.cylinders];
          updatedCylinders[cylinderIndex] = {
            ...cylinder,
            status: 'Filled (In Stock)',
            updatedAt: new Date().toISOString()
          };

          success = true;
          return { cylinders: updatedCylinders };
        });
        return success;
      },

      addCylinder: (cylinderData) => {
        set((state) => {
          const newCylinder: Cylinder = {
            id: `c_${Date.now()}`,
            ...cylinderData,
            status: 'Filled (In Stock)',
            updatedAt: new Date().toISOString()
          };
          return { cylinders: [newCylinder, ...state.cylinders] };
        });
      },

      // Worker & Delivery Actions
      settleDriverCash: (serialNumber, amountReturned) => {
        let success = false;
        set((state) => {
          const cylinderIndex = state.cylinders.findIndex(
            (c) => c.serialNumber.toLowerCase() === serialNumber.toLowerCase()
          );
          if (cylinderIndex === -1) return {};

          const cylinder = state.cylinders[cylinderIndex];
          if (cylinder.status !== 'Issued to Customer' || !cylinder.customer) return {};

          const updatedCylinders = [...state.cylinders];
          updatedCylinders[cylinderIndex] = {
            ...cylinder,
            customer: {
              ...cylinder.customer,
              cashReturned: true,
              cashAmountReturned: amountReturned,
              cashReturnedAt: new Date().toISOString()
            },
            updatedAt: new Date().toISOString()
          };

          success = true;
          return { cylinders: updatedCylinders };
        });
        return success;
      },

      updateDeliveryStatus: (serialNumber, status) => {
        let success = false;
        set((state) => {
          const cylinderIndex = state.cylinders.findIndex(
            (c) => c.serialNumber.toLowerCase() === serialNumber.toLowerCase()
          );
          if (cylinderIndex === -1) return {};

          const cylinder = state.cylinders[cylinderIndex];
          if (cylinder.status !== 'Issued to Customer' || !cylinder.customer) return {};

          const updatedCylinders = [...state.cylinders];
          updatedCylinders[cylinderIndex] = {
            ...cylinder,
            customer: {
              ...cylinder.customer,
              deliveryStatus: status
            },
            updatedAt: new Date().toISOString()
          };

          success = true;
          return { cylinders: updatedCylinders };
        });
        return success;
      },

      addWorker: (name, phone, role) => {
        set((state) => {
          const newWorker: Worker = {
            id: `w_${Date.now()}`,
            name,
            phone,
            role,
            isActive: true
          };
          return { workers: [...state.workers, newWorker] };
        });
      },

      // POS Actions
      addToCart: (productOrBarcode) => {
        set((state) => {
          let productToAdd: Product | undefined;
          
          if (typeof productOrBarcode === 'string') {
            productToAdd = state.products.find(
              (p) => p.barcode === productOrBarcode || p.name.toLowerCase().includes(productOrBarcode.toLowerCase())
            );
          } else {
            productToAdd = productOrBarcode;
          }

          if (!productToAdd) return {};

          const existingCartIndex = state.cart.findIndex(
            (item) => item.product.id === productToAdd!.id
          );

          const updatedCart = [...state.cart];
          if (existingCartIndex !== -1) {
            updatedCart[existingCartIndex] = {
              ...updatedCart[existingCartIndex],
              quantity: updatedCart[existingCartIndex].quantity + 1
            };
          } else {
            updatedCart.push({
              product: productToAdd,
              quantity: 1
            });
          }

          return { cart: updatedCart };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId)
        }));
      },

      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        }));
      },

      clearCart: () => set({ cart: [] }),

      // POS & Hold Cart Actions
      holdCart: (note, customerName) => {
        const cart = get().cart;
        if (cart.length === 0) return false;

        const newHeldCart: HeldCart = {
          id: `hc_${Date.now()}`,
          note: note || 'Held Transaction',
          customerName: customerName || 'Walk-in Customer',
          items: [...cart],
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          heldCarts: [newHeldCart, ...state.heldCarts],
          cart: [] // Clear active cart after holding
        }));

        get().logAuditEvent('HOLD_CART', 'POS', `Cart held with ${cart.length} items (${note || 'No note'})`);
        return true;
      },

      resumeCart: (heldCartId) => {
        const heldCart = get().heldCarts.find((hc) => hc.id === heldCartId);
        if (!heldCart) return false;

        set((state) => ({
          cart: [...heldCart.items],
          heldCarts: state.heldCarts.filter((hc) => hc.id !== heldCartId)
        }));

        get().logAuditEvent('RESUME_CART', 'POS', `Resumed held cart ${heldCartId}`);
        return true;
      },

      deleteHeldCart: (heldCartId) => {
        set((state) => ({
          heldCarts: state.heldCarts.filter((hc) => hc.id !== heldCartId)
        }));
        get().logAuditEvent('DELETE_HELD_CART', 'POS', `Deleted held cart ${heldCartId}`);
      },

      checkoutCart: (discount, taxRate, paymentMethod, khataCustomerId) => {
        const cart = get().cart;
        if (cart.length === 0) return null;

        const subtotal = cart.reduce((sum, item) => sum + item.product.retailPrice * item.quantity, 0);
        const discountAmount = discount;
        const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
        const total = subtotal - discountAmount + taxAmount;
        
        const receiptNumber = `KH-${new Date().getFullYear()}-${String(get().sales.length + 1).padStart(4, '0')}`;

        const saleItems: SaleItem[] = cart.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.retailPrice,
          totalPrice: item.product.retailPrice * item.quantity,
          costPrice: item.product.costPrice
        }));

        const newSale: SalesTransaction = {
          id: `s_${Date.now()}`,
          receiptNumber,
          subtotal,
          discount: discountAmount,
          tax: taxAmount,
          total,
          paymentMethod,
          items: saleItems,
          status: 'Completed',
          createdAt: new Date().toISOString(),
          khataCustomerId
        };

        // Deduct inventory quantities & update Khata if applicable
        set((state) => {
          const updatedProducts = state.products.map((prod) => {
            const cartItem = cart.find((item) => item.product.id === prod.id);
            if (cartItem) {
              return {
                ...prod,
                stockQuantity: Math.max(0, prod.stockQuantity - cartItem.quantity)
              };
            }
            return prod;
          });

          // Update Customer Khata if payment method is Khata / Credit
          let updatedKhatas = [...state.khatas];
          if (paymentMethod.includes('Khata') && khataCustomerId) {
            const khataIndex = updatedKhatas.findIndex((k) => k.id === khataCustomerId);
            if (khataIndex !== -1) {
              const targetKhata = updatedKhatas[khataIndex];
              const newTransaction: KhataTransaction = {
                id: `kt_${Date.now()}`,
                type: 'DEBIT_SALE',
                amount: total,
                reference: receiptNumber,
                notes: `POS Credit Purchase (${cart.length} items)`,
                date: new Date().toISOString()
              };
              updatedKhatas[khataIndex] = {
                ...targetKhata,
                currentBalance: targetKhata.currentBalance + total,
                transactions: [newTransaction, ...targetKhata.transactions],
                updatedAt: new Date().toISOString()
              };
            }
          }

          return {
            products: updatedProducts,
            sales: [newSale, ...state.sales],
            khatas: updatedKhatas,
            cart: [] // Clear cart after successful checkout
          };
        });

        get().logAuditEvent('CHECKOUT', 'POS', `Completed sale ${receiptNumber} (${paymentMethod}) for PKR ${total}`);
        return newSale;
      },

      refundTransaction: (transactionId, reason) => {
        let success = false;
        set((state) => {
          const saleIndex = state.sales.findIndex(
            (s) => s.id === transactionId || s.receiptNumber === transactionId
          );
          if (saleIndex === -1) return {};

          const sale = state.sales[saleIndex];
          if (sale.status === 'Refunded') return {};

          const updatedSales = [...state.sales];
          updatedSales[saleIndex] = {
            ...sale,
            status: 'Refunded',
            refundedAt: new Date().toISOString(),
            refundReason: reason || 'Customer requested refund'
          };

          // Restore product stock quantities
          const updatedProducts = state.products.map((prod) => {
            const itemToRestore = sale.items.find((i) => i.productId === prod.id);
            if (itemToRestore) {
              return {
                ...prod,
                stockQuantity: prod.stockQuantity + itemToRestore.quantity
              };
            }
            return prod;
          });

          success = true;
          return {
            sales: updatedSales,
            products: updatedProducts
          };
        });

        if (success) {
          get().logAuditEvent('REFUND', 'POS', `Refunded transaction ${transactionId}: ${reason}`);
        }
        return success;
      },

      // Vendor & Procurement Actions
      addVendor: (vendorData) => {
        set((state) => {
          const newVendor: Vendor = {
            id: `v_${Date.now()}`,
            ...vendorData,
            balancePayable: 0,
            createdAt: new Date().toISOString()
          };
          return { vendors: [...state.vendors, newVendor] };
        });
        get().logAuditEvent('ADD_VENDOR', 'VENDOR', `Registered new vendor: ${vendorData.companyName}`);
      },

      createPurchaseOrder: (vendorId, items) => {
        const vendor = get().vendors.find((v) => v.id === vendorId);
        if (!vendor || items.length === 0) return null;

        const poItems: PurchaseOrderItem[] = items.map((i) => {
          const prod = get().products.find((p) => p.id === i.productId);
          return {
            productId: i.productId,
            productName: prod ? prod.name : 'Unknown Product',
            quantity: i.quantity,
            unitCost: i.unitCost,
            totalCost: i.quantity * i.unitCost
          };
        });

        const totalAmount = poItems.reduce((sum, item) => sum + item.totalCost, 0);
        const poNumber = `PO-${new Date().getFullYear()}-${String(get().purchaseOrders.length + 1).padStart(4, '0')}`;

        const newPO: PurchaseOrder = {
          id: `po_${Date.now()}`,
          poNumber,
          vendorId: vendor.id,
          vendorName: vendor.companyName,
          items: poItems,
          totalAmount,
          status: 'Pending',
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          purchaseOrders: [newPO, ...state.purchaseOrders]
        }));

        get().logAuditEvent('CREATE_PO', 'VENDOR', `Created ${poNumber} for ${vendor.companyName} (PKR ${totalAmount})`);
        return newPO;
      },

      receiveGoodsNote: (poId) => {
        let success = false;
        set((state) => {
          const poIndex = state.purchaseOrders.findIndex((po) => po.id === poId);
          if (poIndex === -1) return {};

          const po = state.purchaseOrders[poIndex];
          if (po.status === 'Received') return {};

          const updatedPOs = [...state.purchaseOrders];
          updatedPOs[poIndex] = {
            ...po,
            status: 'Received',
            receivedAt: new Date().toISOString()
          };

          // Increment product stock quantities
          const updatedProducts = state.products.map((prod) => {
            const poItem = po.items.find((i) => i.productId === prod.id);
            if (poItem) {
              return {
                ...prod,
                stockQuantity: prod.stockQuantity + poItem.quantity,
                costPrice: poItem.unitCost // Update cost price to latest vendor cost
              };
            }
            return prod;
          });

          // Increase Vendor Payable Balance
          const updatedVendors = state.vendors.map((v) => {
            if (v.id === po.vendorId) {
              return {
                ...v,
                balancePayable: v.balancePayable + po.totalAmount
              };
            }
            return v;
          });

          success = true;
          return {
            purchaseOrders: updatedPOs,
            products: updatedProducts,
            vendors: updatedVendors
          };
        });

        if (success) {
          get().logAuditEvent('RECEIVE_GRN', 'VENDOR', `Goods Received Note (GRN) processed for PO ${poId}. Stock auto-updated.`);
        }
        return success;
      },

      recordVendorPayment: (vendorId, amount, notes) => {
        let success = false;
        set((state) => {
          const vIndex = state.vendors.findIndex((v) => v.id === vendorId);
          if (vIndex === -1) return {};

          const vendor = state.vendors[vIndex];
          const updatedVendors = [...state.vendors];
          updatedVendors[vIndex] = {
            ...vendor,
            balancePayable: Math.max(0, vendor.balancePayable - amount)
          };

          success = true;
          return { vendors: updatedVendors };
        });

        if (success) {
          get().logAuditEvent('VENDOR_PAYMENT', 'VENDOR', `Paid PKR ${amount} to vendor ${vendorId}: ${notes || 'Payment settlement'}`);
        }
        return success;
      },

      // Expense & Cash Drawer Actions
      addExpense: (category, amount, description) => {
        const currentUser = get().currentUser;
        const newExpense: Expense = {
          id: `e_${Date.now()}`,
          category,
          amount,
          description,
          createdBy: currentUser ? currentUser.name : 'Store Manager',
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          expenses: [newExpense, ...state.expenses]
        }));

        get().logAuditEvent('ADD_EXPENSE', 'DRAWER', `Logged expense PKR ${amount} (${category}: ${description})`);
      },

      setOpeningFloat: (amount) => {
        set({ openingFloat: amount });
        get().logAuditEvent('SET_OPENING_FLOAT', 'DRAWER', `Set cash drawer opening float to PKR ${amount}`);
      },

      reconcileCashDrawer: (actualCash, notes) => {
        const currentUser = get().currentUser;
        const sales = get().sales;
        const expenses = get().expenses;
        const openingFloat = get().openingFloat;

        // Today's Cash Sales
        const today = new Date().toISOString().split('T')[0];
        const cashSales = sales
          .filter((s) => s.createdAt.startsWith(today) && s.paymentMethod === 'Cash' && s.status === 'Completed')
          .reduce((sum, s) => sum + s.total, 0);

        const cashRefunds = sales
          .filter((s) => s.refundedAt && s.refundedAt.startsWith(today) && s.paymentMethod === 'Cash')
          .reduce((sum, s) => sum + s.total, 0);

        const pettyExpenses = expenses
          .filter((e) => e.createdAt.startsWith(today))
          .reduce((sum, e) => sum + e.amount, 0);

        const expectedClosingCash = openingFloat + cashSales - cashRefunds - pettyExpenses;
        const discrepancy = actualCash - expectedClosingCash;

        const newRec: CashDrawerReconciliation = {
          id: `cdr_${Date.now()}`,
          date: today,
          openingFloat,
          cashSales,
          cashRefunds,
          pettyCashExpenses: pettyExpenses,
          expectedClosingCash,
          actualClosingCash: actualCash,
          discrepancy,
          closedBy: currentUser ? currentUser.name : 'Store Manager',
          notes
        };

        set((state) => ({
          reconciliations: [newRec, ...state.reconciliations]
        }));

        get().logAuditEvent('RECONCILE_DRAWER', 'DRAWER', `Closed drawer. Expected: PKR ${expectedClosingCash}, Actual: PKR ${actualCash}, Variance: PKR ${discrepancy}`);
        return newRec;
      },

      // Customer Khata Actions
      addKhataCustomer: (name, phone, cnic, creditLimit = 50000) => {
        const newKhata: CustomerKhata = {
          id: `k_${Date.now()}`,
          customerName: name,
          phone,
          cnic,
          creditLimit,
          currentBalance: 0,
          transactions: [],
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          khatas: [newKhata, ...state.khatas]
        }));

        get().logAuditEvent('ADD_KHATA_CUSTOMER', 'POS', `Created Khata credit ledger for ${name} (Limit: PKR ${creditLimit})`);
        return newKhata;
      },

      recordKhataPayment: (khataId, amount, reference) => {
        let success = false;
        set((state) => {
          const kIndex = state.khatas.findIndex((k) => k.id === khataId);
          if (kIndex === -1) return {};

          const khata = state.khatas[kIndex];
          const paymentTx: KhataTransaction = {
            id: `kt_${Date.now()}`,
            type: 'CREDIT_PAYMENT',
            amount,
            reference: reference || 'Cash Collection Receipt',
            notes: 'Customer debt clearance payment',
            date: new Date().toISOString()
          };

          const updatedKhatas = [...state.khatas];
          updatedKhatas[kIndex] = {
            ...khata,
            currentBalance: Math.max(0, khata.currentBalance - amount),
            transactions: [paymentTx, ...khata.transactions],
            updatedAt: new Date().toISOString()
          };

          success = true;
          return { khatas: updatedKhatas };
        });

        if (success) {
          get().logAuditEvent('KHATA_PAYMENT', 'POS', `Collected PKR ${amount} payment for Khata account ${khataId}`);
        }
        return success;
      },

      // Product Actions
      addProduct: (productData) => {
        set((state) => {
          const newProduct: Product = {
            id: `p_${Date.now()}`,
            ...productData
          };
          return { products: [...state.products, newProduct] };
        });
        get().logAuditEvent('ADD_PRODUCT', 'INVENTORY', `Added product ${productData.name} (${productData.barcode})`);
      },

      updateProductStock: (id, newStock) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, stockQuantity: newStock } : p
          )
        }));
      },

      adjustProductStock: (id, newStock, reason) => {
        set((state) => {
          const prod = state.products.find((p) => p.id === id);
          if (prod) {
            get().logAuditEvent('STOCK_ADJUSTMENT', 'INVENTORY', `Adjusted ${prod.name} stock from ${prod.stockQuantity} to ${newStock}. Reason: ${reason}`);
          }
          return {
            products: state.products.map((p) =>
              p.id === id ? { ...p, stockQuantity: newStock } : p
            )
          };
        });
      },

      // System Actions
      logAuditEvent: (action, category, details) => {
        const currentUser = get().currentUser;
        const newLog: AuditLog = {
          id: `al_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          action,
          category,
          performedBy: currentUser ? currentUser.name : 'System User',
          timestamp: new Date().toISOString(),
          details
        };

        set((state) => ({
          auditLogs: [newLog, ...state.auditLogs]
        }));
      },

      toggleThemeMode: () => {
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light'
        }));
      },

      login: (username, password) => {
        const found = registeredUsers.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        if (found) {
          const { password: _, ...user } = found;
          set({ currentUser: user, isAuthenticated: true });
          get().logAuditEvent('USER_LOGIN', 'SYSTEM', `User ${user.name} logged in.`);
          return true;
        }
        return false;
      },

      logout: () => {
        const currentUser = get().currentUser;
        if (currentUser) {
          get().logAuditEvent('USER_LOGOUT', 'SYSTEM', `User ${currentUser.name} logged out.`);
        }
        set({ currentUser: null, isAuthenticated: false });
      }
    }),
    {
      name: 'khan-hardware-pos-storage' // Persist data in localStorage
    }
  )
);
