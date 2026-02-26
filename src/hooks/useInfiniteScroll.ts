"use client";

import { useEffect, useRef, type RefObject } from "react";

const SENTINEL_OFFSET_FROM_END = 3;

export interface UseInfiniteScrollOptions<T> {
  /** Loaded items to display */
  items: T[];
  /** Whether more data is available to fetch */
  hasMore: boolean;
  /** Whether a fetch is in progress (to avoid duplicate requests) */
  isLoading: boolean;
  /** Callback to fetch the next page. Receives number of items to fetch. */
  loadMore: (numItems: number) => void;
  /** Number of items per page for loadMore (default 20) */
  pageSize?: number;
}

export interface UseInfiniteScrollResult {
  /** Ref to attach to the sentinel element – place before 3rd item from end */
  sentinelRef: RefObject<HTMLDivElement | null>;
  /** Index in the items array before which the sentinel should be rendered */
  sentinelIndex: number;
}

function isLoadable(status: {
  hasMore: boolean;
  isLoading: boolean;
}): status is { hasMore: true; isLoading: false } {
  return status.hasMore && !status.isLoading;
}

/**
 * Reusable infinite scroll hook using Intersection Observer.
 * Triggers loadMore when the sentinel (placed before the 3rd element from the end) becomes visible.
 *
 * @example
 * ```tsx
 * const { results, status, loadMore } = usePaginatedQuery(...);
 * const { sentinelRef, sentinelIndex } = useInfiniteScroll({
 *   items: results ?? [],
 *   hasMore: status === "CanLoadMore",
 *   isLoading: status === "LoadingMore" || status === "LoadingFirstPage",
 *   loadMore,
 *   pageSize: 20,
 * });
 *
 * return (
 *   <ul>
 *     {items.map((item, i) => (
 *       <Fragment key={item.id}>
 *         {i === sentinelIndex && <div ref={sentinelRef} aria-hidden />}
 *         <li>...</li>
 *       </Fragment>
 *     ))}
 *   </ul>
 * );
 * ```
 */
export function useInfiniteScroll<T>({
  items,
  hasMore,
  isLoading,
  loadMore,
  pageSize = 20,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (sentinel === null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && isLoadable({ hasMore, isLoading })) {
          loadMore(pageSize);
        }
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadMore, pageSize]);

  const sentinelIndex = Math.max(0, items.length - SENTINEL_OFFSET_FROM_END);

  return { sentinelRef, sentinelIndex };
}
