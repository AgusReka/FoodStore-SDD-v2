import type { ReactNode } from 'react'
import { usePermissions } from '@shared/hooks/usePermissions'

interface CanProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

export function Can({ permission, children, fallback = null }: CanProps) {
  const { can } = usePermissions()
  if (can(permission)) return <>{children}</>
  return <>{fallback}</>
}
