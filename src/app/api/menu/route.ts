import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { MenuItemWithDetails, MenuItemOptionWithValues, OptionValue, MenuItemAddon } from '@/lib/database.types';

export async function GET() {
  console.log('API: Fetching menu...');
  try {
    const { data: categories, error: catErr } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (catErr) {
      console.error('API: Category fetch error:', catErr);
      throw catErr;
    }
    console.log(`API: Found ${categories?.length || 0} categories`);
    
    if (!categories) return NextResponse.json({ categories: [] });

    const { data: items, error: itemErr } = await supabase
      .from('menu_items')
      .select(`
        *,
        menu_item_options (
          *,
          option_values (*)
        ),
        menu_item_addons (*)
      `)
      .is('deleted_at', null)
      .eq('is_available', true)
      .order('display_order');

    if (itemErr) {
      console.error('API: Items fetch error:', itemErr);
      throw itemErr;
    }
    console.log(`API: Found ${items?.length || 0} items`);

    const rawItems = (items || []) as unknown as (MenuItemWithDetails & { category_id: string })[];

    const result = categories.map((cat) => {
      const catItems = rawItems
        .filter((item) => item.category_id === cat.id)
        .map((item) => ({
          ...item,
          base_price: typeof item.base_price === 'string' ? parseFloat(item.base_price) : item.base_price,
          menu_item_options: (item.menu_item_options || []).map((opt: MenuItemOptionWithValues) => ({
            ...opt,
            option_values: (opt.option_values || [])
              .map((v: OptionValue) => ({ 
                ...v, 
                price_adjustment: typeof v.price_adjustment === 'string' ? parseFloat(v.price_adjustment as string) : v.price_adjustment 
              }))
              .sort((a: OptionValue, b: OptionValue) => a.display_order - b.display_order),
          })).sort((a: MenuItemOptionWithValues, b: MenuItemOptionWithValues) => a.display_order - b.display_order),
          menu_item_addons: (item.menu_item_addons || [])
            .map((a: MenuItemAddon) => ({ 
              ...a, 
              price: typeof a.price === 'string' ? parseFloat(a.price) : a.price 
            }))
            .sort((a: MenuItemAddon, b: MenuItemAddon) => a.display_order - b.display_order),
        }));

      return {
        id: cat.id,
        name: cat.name,
        display_order: cat.display_order,
        is_active: cat.is_active,
        menu_items: catItems,
      };
    }).filter(cat => cat.menu_items.length > 0); // Hide empty categories

    return NextResponse.json({ categories: result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
