import { useAuthStore } from '@shared/stores/authStore'
import { ROLE_PERMISSIONS } from '@shared/constants/permissions'

export function usePermissions() {
  const user = useAuthStore((s) => s.user)
  const role = user?.role ?? null
  const permissions = role ? (ROLE_PERMISSIONS[role] ?? []) : []

  return {
    can: (permission: string) => permissions.includes(permission),
    role,
    permissions,
    isAdmin: role === 'admin',
  }
}
