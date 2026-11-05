import { useEffect, useRef } from 'react'

export function useInactivityLogout({ timeoutMinutes, onTimeout, enabled = true }) {
  const onTimeoutRef = useRef(onTimeout)

  useEffect(() => {
    onTimeoutRef.current = onTimeout
  }, [onTimeout])

  useEffect(() => {
    const minutes = Number(timeoutMinutes)

    if (!enabled || !Number.isFinite(minutes) || minutes <= 0) {
      return undefined
    }

    const timeoutMs = minutes * 60 * 1000
    let lastActivityAt = Date.now()
    let timeoutId

    function restartTimer() {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(
        () => onTimeoutRef.current?.(),
        timeoutMs,
      )
    }

    function handleActivity() {
      lastActivityAt = Date.now()
      restartTimer()
    }

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return
      if (Date.now() - lastActivityAt >= timeoutMs) {
        window.clearTimeout(timeoutId)
        onTimeoutRef.current?.()
      }
    }

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'wheel',
    ]

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true })
    })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    restartTimer()

    return () => {
      window.clearTimeout(timeoutId)
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity)
      })
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [enabled, timeoutMinutes])
}
