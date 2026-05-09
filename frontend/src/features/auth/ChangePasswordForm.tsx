import { useState, useEffect, type FormEvent } from 'react'
import { useAuth } from '@shared/hooks/useAuth'
import { validateRequired, validatePassword, validatePasswordsMatch } from '@shared/utils/validation'

const ChangePasswordForm = () => {
  const { changePassword, isChangingPassword, changePasswordError, changePasswordData } = useAuth()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | null>>({})

  const errorMessage = changePasswordError instanceof Error ? changePasswordError.message : null

  useEffect(() => {
    if (changePasswordData) {
      setSuccess(changePasswordData.message || 'Contraseña cambiada exitosamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setFieldErrors({})
    }
  }, [changePasswordData])

  const validate = (): boolean => {
    const pwResult = validatePassword(newPassword)
    const errors: Record<string, string | null> = {
      currentPassword: validateRequired(currentPassword, 'La contraseña actual'),
      newPassword: pwResult.valid ? null : pwResult.errors[0],
      confirmPassword: validatePasswordsMatch(newPassword, confirmPassword),
    }
    setFieldErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSuccess(null)
    if (!validate()) return
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
    } catch {
      // changePasswordError is set by the mutation
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-bg-tertiary shadow-lg rounded-xl p-8">
      <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Cambiar Contraseña</h2>
      {success && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-4">
          {success}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
          {errorMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="current-password" className="block text-text-secondary mb-1">Contraseña actual</label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 bg-bg-secondary border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent placeholder-text-tertiary"
            placeholder="••••••••"
          />
          {fieldErrors.currentPassword && <p className="text-red-400 text-sm mt-1">{fieldErrors.currentPassword}</p>}
        </div>
        <div>
          <label htmlFor="new-password" className="block text-text-secondary mb-1">Nueva contraseña</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 bg-bg-secondary border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent placeholder-text-tertiary"
            placeholder="••••••••"
          />
          {fieldErrors.newPassword && <p className="text-red-400 text-sm mt-1">{fieldErrors.newPassword}</p>}
        </div>
        <div>
          <label htmlFor="confirm-new-password" className="block text-text-secondary mb-1">Confirmar nueva contraseña</label>
          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 bg-bg-secondary border border-gray-700 rounded-lg text-text-primary focus:outline-none focus:border-accent placeholder-text-tertiary"
            placeholder="••••••••"
          />
          {fieldErrors.confirmPassword && <p className="text-red-400 text-sm mt-1">{fieldErrors.confirmPassword}</p>}
        </div>
        <button
          type="submit"
          disabled={isChangingPassword}
          className="w-full bg-accent hover:bg-accent-light text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isChangingPassword && (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          Cambiar Contraseña
        </button>
      </form>
    </div>
  )
}

export default ChangePasswordForm
