import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItemOption {
  optionName: string;
  valueName: string;
  priceAdjustment: number;
}

export interface CartItemAddon {
  addonName: string;
  price: number;
}

export interface CartItem {
  cartItemId: string; // Unique per line
  itemId: string;     // Database ID
  name: string;
  basePrice: number;
  quantity: number;
  options: CartItemOption[];
  addons: CartItemAddon[];
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

interface CafeStore {
  cart: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotals: () => { subtotal: number; tax: number; total: number; itemCount: number };
  
  // Customer Info
  customerName: string;
  customerPhone: string;
  tableNumber: string;
  setCustomerInfo: (name: string, phone: string, table: string) => void;
}

export const useStore = create<CafeStore>()(
  persist(
    (set, get) => ({
      cart: [],
      customerName: "",
      customerPhone: "",
      tableNumber: "",
      
      setCustomerInfo: (name, phone, table) =>
        set({ customerName: name, customerPhone: phone, tableNumber: table }),
        
      addItem: (item) =>
        set((state) => {
          // Check if identical item (same ID) exists to just increment qty
          const existing = state.cart.find((i) => i.cartItemId === item.cartItemId);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.cartItemId === item.cartItemId
                  ? { 
                      ...i, 
                      quantity: i.quantity + item.quantity, 
                      totalPrice: i.unitPrice * (i.quantity + item.quantity) 
                    }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),
        
      removeItem: (cartItemId) =>
        set((state) => ({
          cart: state.cart.filter((i) => i.cartItemId !== cartItemId),
        })),
        
      updateQuantity: (cartItemId, quantity) =>
        set((state) => {
          if (quantity < 1) {
            return { cart: state.cart.filter((i) => i.cartItemId !== cartItemId) };
          }
          return {
            cart: state.cart.map((i) =>
              i.cartItemId === cartItemId 
                ? { ...i, quantity, totalPrice: i.unitPrice * quantity } 
                : i
            ),
          };
        }),
        
      clearCart: () => set({ cart: [] }),
      
      getTotals: () => {
        const state = get();
        const subtotal = state.cart.reduce((acc, item) => acc + item.totalPrice, 0);
        const itemCount = state.cart.reduce((acc, item) => acc + item.quantity, 0);
        // Assuming 5% tax or based on settings. Hardcoding 5% for now.
        const tax = subtotal * 0.05;
        return { subtotal, tax, total: subtotal + tax, itemCount };
      },
    }),
    {
      name: "cafe-paix-cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
