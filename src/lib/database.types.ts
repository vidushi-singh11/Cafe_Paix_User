// Database types for Cafe Paix Supabase schema

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'cash' | 'online';
export type StaffRole = 'admin' | 'manager' | 'barista';

// ─── Row Types ───

export interface CafeSettings {
  id: string;
  cafe_name: string;
  order_prefix: string;
  tax_rate: number;
  opening_time: string;
  closing_time: string;
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  auth_user_id: string | null;
  full_name: string;
  email: string;
  role: StaffRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
  prep_time_minutes: number;
  is_available: boolean;
  display_order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuItemOption {
  id: string;
  menu_item_id: string;
  name: string;
  is_required: boolean;
  display_order: number;
  created_at: string;
}

export interface OptionValue {
  id: string;
  option_id: string;
  label: string;
  price_adjustment: number;
  is_default: boolean;
  display_order: number;
  created_at: string;
}

export interface MenuItemAddon {
  id: string;
  menu_item_id: string;
  name: string;
  price: number;
  is_available: boolean;
  display_order: number;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  table_number: string | null;
  status: OrderStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  estimated_ready_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  item_name: string;
  item_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface OrderItemCustomization {
  id: string;
  order_item_id: string;
  option_name: string;
  value_label: string;
  price_adjustment: number;
  created_at: string;
}

export interface OrderItemAddon {
  id: string;
  order_item_id: string;
  addon_name: string;
  addon_price: number;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Joined / Nested Types ───

export interface OptionValueWithOption extends OptionValue {
  option: MenuItemOption;
}

export interface MenuItemOptionWithValues extends MenuItemOption {
  option_values: OptionValue[];
}

export interface MenuItemWithDetails extends MenuItem {
  menu_item_options: MenuItemOptionWithValues[];
  menu_item_addons: MenuItemAddon[];
}

export interface MenuCategoryWithItems extends MenuCategory {
  menu_items: MenuItemWithDetails[];
}

export interface OrderItemWithDetails extends OrderItem {
  order_item_customizations: OrderItemCustomization[];
  order_item_addons: OrderItemAddon[];
}

export interface OrderWithItems extends Order {
  order_items: OrderItemWithDetails[];
  payments?: Payment[];
  order_status_history?: OrderStatusHistory[];
}

// ─── Insert Types ───

export interface OrderInsert {
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: string;
  subtotal: number;
  tax_amount?: number;
  total_amount: number;
  notes?: string;
}

export interface OrderItemInsert {
  order_id: string;
  menu_item_id?: string;
  item_name: string;
  item_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderItemCustomizationInsert {
  order_item_id: string;
  option_name: string;
  value_label: string;
  price_adjustment?: number;
}

export interface OrderItemAddonInsert {
  order_item_id: string;
  addon_name: string;
  addon_price: number;
}
