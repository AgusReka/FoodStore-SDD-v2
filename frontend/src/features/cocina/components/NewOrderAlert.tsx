import { useEffect, useRef, useState } from 'react'

interface NewOrderAlertProps {
  lastEvent: string | null
}

const SOUND_KEY = 'kds-sound-enabled'

export function NewOrderAlert({ lastEvent }: NewOrderAlertProps) {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem(SOUND_KEY) !== 'false'
  })
  const [visible, setVisible] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    if (lastEvent === 'PEDIDO_CONFIRMADO') {
      setVisible(true)
      if (soundEnabled) {
        playBeep()
      }
      const id = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(id)
    }
  }, [lastEvent, soundEnabled])

  function playBeep() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext()
      }
      const ctx = audioCtxRef.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } catch {
      // Audio not available
    }
  }

  function toggleSound() {
    const next = !soundEnabled
    setSoundEnabled(next)
    localStorage.setItem(SOUND_KEY, String(next))
  }

  if (!visible && !soundEnabled) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      {visible && (
        <div className="animate-pulse rounded bg-amber-500/20 px-3 py-1 text-sm font-medium text-amber-400 transition-opacity duration-500">
          ¡Nuevo pedido!
        </div>
      )}
      <button
        onClick={toggleSound}
        className="rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
        title={soundEnabled ? 'Desactivar sonido' : 'Activar sonido'}
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  )
}
