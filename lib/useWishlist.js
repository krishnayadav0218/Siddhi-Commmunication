import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'siddhi_wishlist';

// Device-local wishlist (no backend needed). Starts empty on both server
// and first client render to avoid hydration mismatches, then loads from
// localStorage right after mount.
export function useWishlist() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      // ignore malformed/unavailable storage
    }
  }, []);

  const toggle = useCallback((item) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.name === item.name);
      const next = exists ? prev.filter((p) => p.name !== item.name) : [...prev, item];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        // ignore storage errors (e.g. private browsing / quota)
      }
      return next;
    });
  }, []);

  const isSaved = useCallback((name) => items.some((p) => p.name === name), [items]);

  return { items, toggle, isSaved };
}
