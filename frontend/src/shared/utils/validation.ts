/**
 * Password validation — mirrors backend strength rules
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 digit
 */

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres')
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una mayúscula')
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe contener al menos una minúscula')
  }
  if (!/\d/.test(password)) {
    errors.push('La contraseña debe contener al menos un número')
  }

  return { valid: errors.length === 0, errors }
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'El email es requerido'
  if (!isValidEmail(email)) return 'Ingrese un email válido'
  return null
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} es requerido`
  return null
}

export function validatePasswordsMatch(password: string, confirm: string): string | null {
  if (password !== confirm) return 'Las contraseñas no coinciden'
  return null
}
