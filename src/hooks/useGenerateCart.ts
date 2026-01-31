import { useState, useCallback, useEffect } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import type { CustomCartItem } from '@/types/generate';

const CART_STORAGE_KEY = 'scheds-generate-cart';

function loadCartFromStorage(): CustomCartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(cart: CustomCartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // ignore
  }
}

function hasCustomSelection(item: CustomCartItem): boolean {
  const has = (arr: string[] | undefined) => Array.isArray(arr) && arr.length > 0;
  return (
    has(item.excludedMainSections) ||
    has(item.excludedSubSections) ||
    has(item.excludedProfessors) ||
    has(item.excludedTAs)
  );
}

export function useGenerateCart() {
  const [cart, setCart] = useState<CustomCartItem[]>(loadCartFromStorage);
  const [liveSearchLoading, setLiveSearchLoading] = useState(false);

  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = useCallback(
    async (item: CustomCartItem, useLiveData: boolean) => {
      const normalized: CustomCartItem = {
        courseCode: item.courseCode,
        courseName: item.courseName,
        excludedMainSections: item.excludedMainSections?.filter(Boolean),
        excludedSubSections: item.excludedSubSections?.filter(Boolean),
        excludedProfessors: item.excludedProfessors?.filter(Boolean),
        excludedTAs: item.excludedTAs?.filter(Boolean),
      };

      const persist = () => {
        setCart((prev) => {
          const existing = prev.find((c) => c.courseCode === normalized.courseCode);
          const next = existing
            ? prev.map((c) => (c.courseCode === normalized.courseCode ? normalized : c))
            : [...prev, normalized];
          return next;
        });
      };

      if (useLiveData) {
        setLiveSearchLoading(true);
        try {
          const searchRes = await fetchWithCredentials(
            `/api/coursebase/search/${encodeURIComponent(normalized.courseCode)}`
          );
          if (searchRes.ok) persist();
        } catch {
          persist();
        } finally {
          setLiveSearchLoading(false);
        }
      } else {
        persist();
      }
    },
    []
  );

  const removeFromCart = useCallback((item: CustomCartItem) => {
    setCart((prev) => prev.filter((c) => c.courseCode !== item.courseCode));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  return {
    cart,
    liveSearchLoading,
    addToCart,
    removeFromCart,
    clearCart,
    hasCustomSelection,
  };
}
