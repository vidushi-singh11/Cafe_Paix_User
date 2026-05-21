import { supabase } from './supabase';
import type {
  MenuCategoryWithItems,
  OrderInsert,
  OrderItemInsert,
  OrderItemCustomizationInsert,
  OrderItemAddonInsert,
  OrderWithItems,
} from './database.types';

// ─── MENU ───

export async function fetchMenu(): Promise<MenuCategoryWithItems[]> {
  console.log('Client: Fetching menu from /api/menu...');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch('/api/menu', { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      console.error('Client: Menu fetch failed with status:', res.status);
      throw new Error('Failed to fetch menu');
    }
    const data = await res.json();
    console.log('Client: Menu data received:', data);
    return data.categories || [];
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Client: fetchMenu exception:', err);
    throw err;
  }
}

// ─── ORDERS ───

export interface CartItemForOrder {
  menuItemId: string;
  name: string;
  basePrice: number;
  quantity: number;
  selectedOptions: { optionName: string; valueLabel: string; priceAdjustment: number }[];
  selectedAddons: { addonName: string; addonPrice: number }[];
}

export interface CustomerInfo {
  name: string;
  phone: string;
  tableNumber: string;
  notes?: string;
}

export async function createOrder(
  cartItems: CartItemForOrder[],
  customerInfo: CustomerInfo
): Promise<string> {
  // Calculate totals
  let subtotal = 0;
  for (const item of cartItems) {
    const optionAdj = item.selectedOptions.reduce((s, o) => s + o.priceAdjustment, 0);
    const addonTotal = item.selectedAddons.reduce((s, a) => s + a.addonPrice, 0);
    subtotal += (item.basePrice + optionAdj + addonTotal) * item.quantity;
  }

  // 1. Insert order
  const orderData: OrderInsert = {
    customer_name: customerInfo.name,
    customer_phone: customerInfo.phone,
    table_number: customerInfo.tableNumber,
    subtotal,
    tax_amount: 0,
    total_amount: subtotal,
    notes: customerInfo.notes,
  };

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (orderErr) throw orderErr;

  // 2. Insert order items
  for (const item of cartItems) {
    const optionAdj = item.selectedOptions.reduce((s, o) => s + o.priceAdjustment, 0);
    const addonTotal = item.selectedAddons.reduce((s, a) => s + a.addonPrice, 0);
    const unitPrice = item.basePrice + optionAdj + addonTotal;

    const orderItemData: OrderItemInsert = {
      order_id: order.id,
      menu_item_id: item.menuItemId,
      item_name: item.name,
      item_price: unitPrice,
      quantity: item.quantity,
      line_total: unitPrice * item.quantity,
    };

    const { data: orderItem, error: oiErr } = await supabase
      .from('order_items')
      .insert(orderItemData)
      .select()
      .single();

    if (oiErr) throw oiErr;

    // 3. Insert customizations
    if (item.selectedOptions.length > 0) {
      const customizations: OrderItemCustomizationInsert[] = item.selectedOptions.map((opt) => ({
        order_item_id: orderItem.id,
        option_name: opt.optionName,
        value_label: opt.valueLabel,
        price_adjustment: opt.priceAdjustment,
      }));
      const { error: custErr } = await supabase.from('order_item_customizations').insert(customizations);
      if (custErr) throw custErr;
    }

    // 4. Insert addons
    if (item.selectedAddons.length > 0) {
      const addons: OrderItemAddonInsert[] = item.selectedAddons.map((addon) => ({
        order_item_id: orderItem.id,
        addon_name: addon.addonName,
        addon_price: addon.addonPrice,
      }));
      const { error: addonErr } = await supabase.from('order_item_addons').insert(addons);
      if (addonErr) throw addonErr;
    }
  }

  // 5. Insert payment record (simulated)
  const { error: payErr } = await supabase.from('payments').insert({
    order_id: order.id,
    method: 'online',
    status: 'paid',
    amount: subtotal,
  });
  if (payErr) throw payErr;

  // 6. Upsert customer
  await supabase.from('customers').upsert(
    {
      full_name: customerInfo.name,
      phone: customerInfo.phone,
      total_orders: 1,
    },
    { onConflict: 'phone' }
  );

  return order.id;
}

// ─── ORDER TRACKING ───

export async function fetchOrder(orderId: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        order_item_customizations (*),
        order_item_addons (*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error) {
    console.error('Fetch order error:', error);
    return null;
  }

  return data as OrderWithItems;
}


