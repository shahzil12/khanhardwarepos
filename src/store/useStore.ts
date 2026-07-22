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
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface SaleItem {
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
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
}

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: 'Admin' | 'Cashier' | 'Driver';
  avatar?: string;
}

export const demoUsers: (UserAccount & { password: string })[] = [
  { id: 'u1', username: 'admin', password: 'admin123', name: 'Shahzil Ahmed (Owner)', role: 'Admin' },
  { id: 'u2', username: 'cashier', password: 'cashier123', name: 'Muhammad Bilal (POS)', role: 'Cashier' },
  { id: 'u3', username: 'driver', password: 'driver123', name: 'Zeeshan Khan (Delivery)', role: 'Driver' },
];

interface AppState {
  cylinders: Cylinder[];
  products: Product[];
  sales: SalesTransaction[];
  cart: CartItem[];
  workers: Worker[];
  themeMode: 'light' | 'dark';
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  
  // Auth actions
  login: (username: string, password: string) => boolean;
  loginAsDemo: (role: 'Admin' | 'Cashier' | 'Driver') => void;
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
  
  // POS actions
  addToCart: (productOrBarcode: Product | string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkoutCart: (discount: number, taxRate: number, paymentMethod: string) => SalesTransaction | null;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProductStock: (id: string, newStock: number) => void;
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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      cylinders: initialCylinders,
      products: initialProducts,
      sales: [],
      cart: [],
      workers: initialWorkers,
      themeMode: 'light',
      currentUser: demoUsers[0],
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

      checkoutCart: (discount, taxRate, paymentMethod) => {
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
          totalPrice: item.product.retailPrice * item.quantity
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
          createdAt: new Date().toISOString()
        };

        // Deduct inventory quantities
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

          return {
            products: updatedProducts,
            sales: [newSale, ...state.sales],
            cart: [] // Clear cart after successful checkout
          };
        });

        return newSale;
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
      },

      updateProductStock: (id, newStock) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, stockQuantity: newStock } : p
          )
        }));
      },

      toggleThemeMode: () => {
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light'
        }));
      },

      login: (username, password) => {
        const found = demoUsers.find(
          (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
        );
        if (found) {
          const { password: _, ...user } = found;
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      loginAsDemo: (role) => {
        const found = demoUsers.find((u) => u.role === role) || demoUsers[0];
        const { password: _, ...user } = found;
        set({ currentUser: user, isAuthenticated: true });
      },

      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      }
    }),
    {
      name: 'khan-hardware-pos-storage' // Persist data in localStorage
    }
  )
);
