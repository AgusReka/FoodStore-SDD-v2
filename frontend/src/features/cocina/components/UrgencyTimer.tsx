import { useEffect, useState } from 'react'

interface UrgencyTimerProps {
  confirmedAt: string
}

export function UrgencyTimer({ confirmedAt }: UrgencyTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const calc = () => {
      const now = Date.now()
      const confirmed = new Date(confirmedAt).getTime()
      setElapsed(Math.max(0, Math.floor((now - confirmed) / 60000)))
    }

    calc()
    const id = setInterval(calc, 15000)
    return () => clearInterval(id)
  }, [confirmedAt])

  const isUrgent = elapsed >= 20
  const isWarning = elapsed >= 10 && elapsed < 20

  const colorClass = isUrgent
    ? 'text-red-400'
    : isWarning
      ? 'text-orange-400'
      : 'text-gray-400'

  const urgentClass = isUrgent ? 'animate-pulse' : ''

  return (
    <span className={`inline-flex items-center gap-1 text-sm font-medium ${colorClass} ${urgentClass}`}>
      <span className="text-xs opacity-70">{elapsed}</span>
      <span className="text-xs">min</span>
    </span>
  )
}
