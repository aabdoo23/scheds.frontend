import { useState, useCallback } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import type { CartItem } from '@/types/seatModeration';

interface ApiCartItem {
  CourseCode?: string;
  Section?: string;
  courseCode?: string;
  section?: string;
}

function normalizeCartItem(item: ApiCartItem): CartItem {
  return {
    courseCode: item.CourseCode ?? item.courseCode ?? '',
    section: item.Section ?? item.section ?? '',
  };
}

export function useSeatModerationCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithCredentials('/api/SeatModeration/cart');
      if (res.ok) {
        const json = await res.json();
        const items = json.cartItems ?? json.CartItems ?? [];
        setCart(items.map(normalizeCartItem));
      } else if (res.status === 401) {
        setCart([]);
      }
    } catch {
      setCart([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(
    async (courseCode: string, section: string) => {
      setActionLoading(true);
      try {
        const res = await fetchWithCredentials('/api/SeatModeration/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseCode, section }),
        });
        if (res.ok) await fetchCart();
        return res.ok;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchCart]
  );

  const removeFromCart = useCallback(
    async (courseCode: string, section: string) => {
      setActionLoading(true);
      try {
        const res = await fetchWithCredentials('/api/SeatModeration/cart/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseCode, section }),
        });
        if (res.ok) await fetchCart();
        return res.ok;
      } finally {
        setActionLoading(false);
      }
    },
    [fetchCart]
  );

  const clearCart = useCallback(async () => {
    setActionLoading(true);
    try {
      const res = await fetchWithCredentials('/api/SeatModeration/cart/clear', {
        method: 'POST',
      });
      if (res.ok) await fetchCart();
      return res.ok;
    } finally {
      setActionLoading(false);
    }
  }, [fetchCart]);

  return { cart, loading, actionLoading, fetchCart, addToCart, removeFromCart, clearCart };
}
