import { useEffect, useRef, useState, useCallback } from 'react'

interface UseIntersectionObserverOptions {
  /** The element that is used as the viewport for checking visibility. Defaults to the browser viewport. */
  root?: Element | null
  /** Margin around the root. Can have values similar to CSS margin (e.g. "200px 0px"). */
  rootMargin?: string
  /** A number between 0 and 1 indicating the percentage of the target's visibility needed to trigger. */
  threshold?: number | number[]
  /** Whether the observer should start observing immediately. */
  enabled?: boolean
}

interface UseIntersectionObserverReturn {
  /** Ref to attach to the target element you want to observe. */
  ref: React.RefObject<HTMLDivElement | null>
  /** Whether the target element is currently intersecting. */
  isIntersecting: boolean
  /** The full IntersectionObserverEntry, if available. */
  entry: IntersectionObserverEntry | null
}

/**
 * A reusable hook that wraps the IntersectionObserver API.
 *
 * @example
 * ```tsx
 * // Basic visibility detection
 * const { ref, isIntersecting } = useIntersectionObserver()
 *
 * // Infinite scroll
 * const { ref } = useIntersectionObserver({
 *   rootMargin: '200px',
 *   enabled: hasMore && !loading,
 *   onIntersect: () => loadMore(),
 * })
 *
 * return <div ref={ref} />
 * ```
 */
export function useIntersectionObserver(
  options: UseIntersectionObserverOptions & {
    /** Callback fired when the target enters the viewport. */
    onIntersect?: () => void
  } = {}
): UseIntersectionObserverReturn {
  const {
    root = null,
    rootMargin = '0px',
    threshold = 0,
    enabled = true,
    onIntersect,
  } = options

  const ref = useRef<HTMLDivElement>(null)
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null)
  const onIntersectRef = useRef(onIntersect)

  // Keep the callback ref fresh without re-creating the observer
  useEffect(() => {
    onIntersectRef.current = onIntersect
  }, [onIntersect])

  const isIntersecting = entry?.isIntersecting ?? false

  useEffect(() => {
    const target = ref.current
    if (!target || !enabled) {
      setEntry(null)
      return
    }

    const observer = new IntersectionObserver(
      ([observedEntry]) => {
        setEntry(observedEntry)

        if (observedEntry.isIntersecting) {
          onIntersectRef.current?.()
        }
      },
      { root, rootMargin, threshold }
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [root, rootMargin, threshold, enabled])

  return { ref, isIntersecting, entry }
}

/**
 * A thin wrapper around `useIntersectionObserver` purpose-built for infinite scroll.
 * Includes built-in guard against duplicate fetches while a load is in progress.
 *
 * @example
 * ```tsx
 * const { ref } = useInfiniteScroll({
 *   loadMore: () => fetchNextPage(),
 *   hasMore: data.hasNextPage,
 *   loading: isFetchingNextPage,
 *   rootMargin: '300px',
 * })
 *
 * return (
 *   <>
 *     {items.map(item => <Card key={item.id} />)}
 *     <div ref={ref} />
 *   </>
 * )
 * ```
 */
export function useInfiniteScroll(options: {
  /** Async function to load the next page of data. */
  loadMore: () => Promise<void> | void
  /** Whether there are more items to load. */
  hasMore: boolean
  /** Whether a load is currently in progress. */
  loading: boolean
  /** Margin around the viewport to trigger early. Defaults to "200px 0px". */
  rootMargin?: string
  /** Intersection threshold. Defaults to 0.1. */
  threshold?: number
}) {
  const { loadMore, hasMore, loading, rootMargin = '600px 0px', threshold = 0.1 } = options
  const isLoadingRef = useRef(false)

  const handleIntersect = useCallback(() => {
    if (isLoadingRef.current || loading || !hasMore) return

    isLoadingRef.current = true
    Promise.resolve(loadMore()).finally(() => {
      isLoadingRef.current = false
    })
  }, [loadMore, hasMore, loading])

  return useIntersectionObserver({
    rootMargin,
    threshold,
    enabled: hasMore && !loading,
    onIntersect: handleIntersect,
  })
}

