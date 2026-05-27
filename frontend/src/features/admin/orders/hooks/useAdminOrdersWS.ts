import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@shared/stores/authStore'
import { API_BASE_URL, API_PREFIX } from '@shared/config/constants'

interface WSEventPayload {
  event: string
  data: {
    order_id: string
    old_status?: string
    new_status?: string
    order_numero?: number | null
    timestamp?: string
  }
  timestamp: string
}

interface NewOrderEvent {
  orderId: string
  numero: number | null
}

const MAX_RECONNECT_DELAY = 30_000
const INITIAL_RECONNECT_DELAY = 1_000
const POLLING_INTERVAL = 30_000

interface UseAdminOrdersWSResult {
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  lastEvent: string | null
  newOrder: NewOrderEvent | null
  dismissNewOrder: () => void
}

export function useAdminOrdersWS(onRefresh?: () => void): UseAdminOrdersWSResult {
  const accessToken = useAuthStore((s) => s.accessToken)

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [lastEvent, setLastEvent] = useState<string | null>(null)
  const [newOrder, setNewOrder] = useState<NewOrderEvent | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptRef = useRef(0)
  const mountedRef = useRef(true)

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const startPolling = useCallback(() => {
    if (!pollingRef.current && onRefresh) {
      pollingRef.current = setInterval(() => {
        onRefresh()
      }, POLLING_INTERVAL)
    }
  }, [onRefresh])

  const handleWSEvent = useCallback((payload: WSEventPayload) => {
    setLastEvent(payload.event)

    switch (payload.event) {
      case 'NUEVO_PEDIDO': {
        setNewOrder({
          orderId: payload.data.order_id,
          numero: payload.data.order_numero ?? null,
        })
        onRefresh?.()
        break
      }
      case 'ORDER_STATUS_CHANGED': {
        onRefresh?.()
        break
      }
    }

    setTimeout(() => setLastEvent(null), 3000)
  }, [onRefresh])

  const connectWS = useCallback(() => {
    if (!accessToken || !mountedRef.current) return

    const url = `${API_BASE_URL.replace(/^http/, 'ws')}${API_PREFIX}/admin/pedidos/events?token=${accessToken}`
    const ws = new WebSocket(url)
    wsRef.current = ws

    setConnectionStatus('connecting')

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close()
        return
      }
      setConnectionStatus('connected')
      reconnectAttemptRef.current = 0
      clearPolling()
      onRefresh?.()
    }

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return
      try {
        const payload: WSEventPayload = JSON.parse(event.data)
        handleWSEvent(payload)
      } catch {
        // Silently ignore malformed messages
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setConnectionStatus('disconnected')
      wsRef.current = null
      startPolling()

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
  }, [accessToken, onRefresh, clearPolling, startPolling, handleWSEvent])

  useEffect(() => {
    mountedRef.current = true
    connectWS()

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
      clearPolling()
    }
  }, [accessToken, connectWS, clearPolling])

  const dismissNewOrder = useCallback(() => {
    setNewOrder(null)
  }, [])

  return {
    connectionStatus,
    lastEvent,
    newOrder,
    dismissNewOrder,
  }
}
