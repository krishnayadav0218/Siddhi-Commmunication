import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'siddhi_recently_viewed_v1';
const MAX_ITEMS = 8;

function read() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function write(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
}

export function useRecentlyViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const recordView = useCallback((product) => {
    setItems((prev) => {
      const withoutCurrent = prev.filter((p) => p.id !== product.id);
      const next = [
        { id: product.id, name: product.name, icon: product.icon, priceFrom: product.priceFrom, categoryKey: product.categoryKey },
        ...withoutCurrent,
      ].slice(0, MAX_ITEMS);
      write(next);
      return next;
    });
  }, []);

  return { items, recordView };
}
