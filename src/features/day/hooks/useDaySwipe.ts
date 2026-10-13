import { useCallback, useRef } from "react"
import type { TouchEvent as ReactTouchEvent } from "react"

export type SwipeDirection = "left" | "right" | null

const THRESHOLD_PX = 60

// `null` = not a swipe (too short, or more vertical than horizontal: scrolls must never be hijacked).
export function swipeDirection(dx: number, dy: number): SwipeDirection {
  if (Math.abs(dx) < THRESHOLD_PX) return null
  if (Math.abs(dx) <= 2 * Math.abs(dy)) return null
  return dx > 0 ? "right" : "left"
}

interface UseDaySwipeOptions {
  onSwipeRight(): void
  /** Callers skip navigation themselves when it would be a no-op (already on today). */
  onSwipeLeft(): void
}

// Only touchstart/touchend are read and preventDefault is never called, so native scrolling is untouched.
// Gestures starting in inputs or `[data-no-swipe]` elements (e.g. scrollable charts) are ignored.
export function useDaySwipe({ onSwipeRight, onSwipeLeft }: UseDaySwipeOptions) {
  const origin = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: ReactTouchEvent<HTMLElement>) => {
    const target = e.target as HTMLElement
    const opensOut = target.closest("input, textarea, select, [contenteditable], [data-no-swipe]")
    const touch = e.touches[0]
    origin.current = opensOut || !touch ? null : { x: touch.clientX, y: touch.clientY }
  }, [])

  const onTouchEnd = useCallback(
    (e: ReactTouchEvent<HTMLElement>) => {
      const start = origin.current
      origin.current = null
      if (!start) return

      const touch = e.changedTouches[0]
      if (!touch) return

      const direction = swipeDirection(touch.clientX - start.x, touch.clientY - start.y)
      if (direction === null) return

      if (direction === "right") onSwipeRight()
      else onSwipeLeft()
    },
    [onSwipeRight, onSwipeLeft],
  )

  return { onTouchStart, onTouchEnd }
}
