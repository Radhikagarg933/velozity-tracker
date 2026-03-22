import { useState, useCallback } from 'react';

const BUFFER = 5; // rows above and below visible area

export interface VirtualItem<T> {
  item: T;
  index: number;
  offsetTop: number;
}

export interface VirtualScrollResult<T> {
  virtualItems: VirtualItem<T>[];
  totalHeight: number;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

/**
 * Custom virtual scrolling hook.
 *
 * Only renders rows in the visible viewport ± BUFFER rows.
 * The total height of the container is maintained via an inner spacer div,
 * so the scrollbar and scroll position remain correct at all times.
 *
 * @param items       Full array of items to virtualize
 * @param itemHeight  Fixed height of each row in pixels
 * @param containerH  Visible height of the scroll container in pixels
 */
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerH: number
): VirtualScrollResult<T> {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerH / itemHeight);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - BUFFER);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + BUFFER * 2
  );

  const virtualItems: VirtualItem<T>[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({
      item: items[i],
      index: i,
      offsetTop: i * itemHeight,
    });
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return { virtualItems, totalHeight, handleScroll };
}
