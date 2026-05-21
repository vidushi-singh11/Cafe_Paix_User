'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchOrder } from '@/lib/data';
import type { OrderWithItems } from '@/lib/database.types';

export function useOrderTracking(orderId: string | null) {
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    // Initial fetch
    const load = async () => {
      const data = await fetchOrder(orderId);
      if (!data) {
        setError('Order not found.');
      } else {
        setOrder(data);
      }
      setLoading(false);
    };
    load();

    // Realtime subscription
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
        async () => {
          // Re-fetch full order with items on any update
          const updated = await fetchOrder(orderId);
          if (updated) setOrder(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  return { order, loading, error };
}
