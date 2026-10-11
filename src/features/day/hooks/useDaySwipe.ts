import { useCallback, useRef } from "react"
import type { TouchEvent as ReactTouchEvent } from "react"

export type SwipeDirection = "left" | "right" | null

const THRESHOLD_PX = 60

// Pure decision: does this touch delta count as a horizontal swipe, and which
// way? `null` means "not a swipe" — either too short, or more vertical than
// horizontal (a scroll gesture, which must never be hijacked).
export function swipeDirection(dx: number, dy: number): SwipeDirection {
  if (Math.abs(dx) < THRESHOLD_PX) return null
  if (Math.abs(dx) <= 2 * Math.abs(dy)) return null
  return dx > 0 ? "right" : "left"
}

interface UseDaySwipeOptions {
  /** Swipe right (finger moves right) — previous day. */
  onSwipeRight(): void
  /** Swipe left (finger moves left) — next day. Callers skip the actual
   * navigation themselves when it would be a no-op (e.g. already on today). */
  onSwipeLeft(): void
}

// Touch handlers for the Dashboard content wrapper. Only `touchstart`/`touchend`
// are read — `touchmove` is never touched and `preventDefault` is never called,
// so native vertical scrolling is untouched. Gestures starting inside an input,
// textarea, select, contenteditable, or anything marked `[data-no-swipe]` are
// ignored (e.g. a horizontally-scrollable chart).
//
// Stateless by design: this hook only decides *whether* a gesture was a swipe
// and which way. What (if anything) should animate because of it is the
// caller's call — see `DashboardView`, which keys its slide animation to the
// specific day a swipe landed on so a later, non-swipe day change never
// replays a stale direction.
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
