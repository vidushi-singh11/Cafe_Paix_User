'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMenu } from '@/lib/data';
import type { MenuCategoryWithItems } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';

export function useMenu() {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('useMenu: Setting up real-time channels...');
    const handleUpdate = () => {
      console.log('useMenu: Menu update detected, invalidating query...');
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    };

    const channels = [
      supabase.channel('public:menu_items')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, handleUpdate)
        .subscribe((status) => console.log('useMenu: items channel status:', status)),
      supabase.channel('public:menu_categories')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_categories' }, handleUpdate)
        .subscribe((status) => console.log('useMenu: categories channel status:', status)),
      supabase.channel('public:menu_item_options')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_item_options' }, handleUpdate)
        .subscribe((status) => console.log('useMenu: options channel status:', status)),
      supabase.channel('public:option_values')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'option_values' }, handleUpdate)
        .subscribe((status) => console.log('useMenu: values channel status:', status)),
      supabase.channel('public:menu_item_addons')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_item_addons' }, handleUpdate)
        .subscribe((status) => console.log('useMenu: addons channel status:', status)),
    ];

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [queryClient]);

  return useQuery<MenuCategoryWithItems[]>({
    queryKey: ['menu'],
    queryFn: fetchMenu,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
