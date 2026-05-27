import { useCallback, useEffect, useRef } from 'react'
import { useAuthStore } from '@shared/stores/authStore'
import { API_BASE_URL, API_PREFIX } from '@shared/config/constants'

interface WSEventPayload {
  event: string
  data: {
    order_id: string
    old_status: string
    new_status: string
    timestamp?: string
  }
  timestamp: string
}

const MAX_RECONNECT_DELAY = 30_000
const INITIAL_RECONNECT_DELAY = 1_000

export function useOrderWS(orderId: string | undefined, onStatusChanged?: () => void) {
  const accessToken = useAuthStore((s) => s.accessToken)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptRef = useRef(0)
  const mountedRef = useRef(true)

  const connectWS = useCallback(() => {
    if (!accessToken || !orderId || !mountedRef.current) return

    const url = `${API_BASE_URL.replace(/^http/, 'ws')}${API_PREFIX}/pedidos/${orderId}/events?token=${accessToken}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close()
        return
      }
      reconnectAttemptRef.current = 0
    }

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return
      try {
        const payload: WSEventPayload = JSON.parse(event.data)
        if (payload.event === 'ORDER_STATUS_CHANGED' && onStatusChanged) {
          onStatusChanged()
        }
      } catch {
        // Silently ignore malformed messages
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      wsRef.current = null

      const attempt = reconnectAttemptRef.current
      const delay = Math.min(
        INITIAL_RECONNECT_DELAY * Math.pow(2, attempt),
        MAX_RECONNECT_DELAY
      )
      reconnectAttemptRef.current = attempt + 1

      reconnectTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          connectWS()
        }
      }, delay)
    }

    ws.onerror = () => {
      // onclose fires after onerror
    }
  }, [accessToken, orderId, onStatusChanged])

  useEffect(() => {
    mountedRef.current = true
    if (orderId) {
      connectWS()
    }

    return () => {
      mountedRef.current = false
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connectWS, orderId])
}
