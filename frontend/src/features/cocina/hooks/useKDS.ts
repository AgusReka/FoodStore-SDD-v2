import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { get } from '@shared/api/client'
import { ENDPOINTS } from '@shared/api/endpoints'
import { useAuthStore } from '@shared/stores/authStore'
import { API_BASE_URL, API_PREFIX } from '@shared/config/constants'

export interface KDSItemRead {
  nombre: string
  cantidad: number
  personalizacion: string[] | null
  subtotal: number
}

export interface KDSOrderRead {
  id: string
  numero: number | null
  items: KDSItemRead[]
  notas: string | null
  estado: 'confirmado' | 'preparando'
  confirmed_at: string
  tiempo_espera_minutos: number
}

export interface KDSResponse {
  items: KDSOrderRead[]
  por_preparar: number
  en_preparacion: number
}

interface WSEventPayload {
  event: string
  data: {
    order_id: string
    old_status: string
    new_status: string
  }
  timestamp: string
}

// Max delay between reconnection attempts (exponential backoff cap)
const MAX_RECONNECT_DELAY = 30_000
// Initial delay for first reconnection attempt
const INITIAL_RECONNECT_DELAY = 1_000
// Polling interval when WebSocket is disconnected
const POLLING_INTERVAL = 30_000

export function useKDS() {
  const accessToken = useAuthStore((s) => s.accessToken)

  const [orders, setOrders] = useState<KDSOrderRead[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [lastEvent, setLastEvent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reconnectAttemptRef = useRef(0)
  const mountedRef = useRef(true)

  const { data, refetch } = useQuery({
    queryKey: ['cocina', 'pedidos'],
    queryFn: async () => {
      const res = await get<KDSResponse>(ENDPOINTS.COCINA_PEDIDOS)
      return res.data
    },
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (data) {
      setOrders(data.items)
    }
  }, [data])

  const porPreparar = orders.filter((o) => o.estado === 'confirmado').length
  const enPreparacion = orders.filter((o) => o.estado === 'preparando').length

  const clearPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
  }, [])

  const startPolling = useCallback(() => {
    if (!pollingRef.current) {
      pollingRef.current = setInterval(() => {
        refetch()
      }, POLLING_INTERVAL)
    }
  }, [refetch])

  const handleWSEvent = useCallback((payload: WSEventPayload) => {
    switch (payload.event) {
      case 'PEDIDO_CONFIRMADO':
        setLastEvent('PEDIDO_CONFIRMADO')
        refetch()
        setTimeout(() => setLastEvent(null), 3000)
        break
      case 'PEDIDO_EN_PREPARACION':
        setOrders((prev) =>
          prev.map((o) =>
            o.id === payload.data.order_id ? { ...o, estado: 'preparando' as const } : o
          )
        )
        break
      case 'PEDIDO_EN_CAMINO':
      case 'PEDIDO_CANCELADO':
        setOrders((prev) => prev.filter((o) => o.id !== payload.data.order_id))
        break
    }
  }, [refetch])

  const connectWS = useCallback(() => {
    if (!accessToken || !mountedRef.current) return

    const url = `${API_BASE_URL.replace(/^http/, 'ws')}${API_PREFIX}/cocina/events?token=${accessToken}`
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
      refetch()
    }

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return
      try {
        const payload: WSEventPayload = JSON.parse(event.data)
        handleWSEvent(payload)
      } catch {
        setError('Failed to parse WebSocket message')
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setConnectionStatus('disconnected')
      wsRef.current = null
      startPolling()

      // Exponential backoff reconnection
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
      // onclose fires right after onerror, so we handle cleanup there
    }
  }, [accessToken, refetch, clearPolling, startPolling, handleWSEvent])

  useEffect(() => {
    mountedRef.current = true
    connectWS()

    return () => {
      mountedRef.current = false
      // Cleanup all refs
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (wsRef.current) {
        wsRef.current.onclose = null // prevent reconnect on intentional close
        wsRef.current.close()
        wsRef.current = null
      }
      clearPolling()
    }
  }, [accessToken, connectWS, clearPolling])

  return {
    orders,
    porPreparar,
    enPreparacion,
    connectionStatus,
    lastEvent,
    error,
  }
}
