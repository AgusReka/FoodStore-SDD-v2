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
    <div>
      <h3
        style={{
          fontFamily: 'var(--ff-display)',
          fontWeight: 600,
          fontSize: 18,
          margin: '0 0 16px',
          color: 'var(--ink-1)',
        }}
      >
        Cambiar Contraseña
      </h3>

      {success && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(94,138,58,0.1)',
            border: '1px solid rgba(94,138,58,0.2)',
            color: 'var(--leaf)',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          {success}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(230,57,70,0.08)',
            border: '1px solid rgba(230,57,70,0.15)',
            color: 'var(--warm-red)',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 16,
          }}
        >
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {/* Current password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor="current-password"
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}
          >
            Contraseña actual
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
          {fieldErrors.currentPassword && (
            <p style={{ fontSize: 12.5, color: 'var(--warm-red)', margin: '2px 0 0' }}>
              {fieldErrors.currentPassword}
            </p>
          )}
        </div>

        {/* New password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor="new-password"
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}
          >
            Nueva contraseña
          </label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
          {fieldErrors.newPassword && (
            <p style={{ fontSize: 12.5, color: 'var(--warm-red)', margin: '2px 0 0' }}>
              {fieldErrors.newPassword}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label
            htmlFor="confirm-new-password"
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-2)' }}
          >
            Confirmar nueva contraseña
          </label>
          <input
            id="confirm-new-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input"
            placeholder="••••••••"
          />
          {fieldErrors.confirmPassword && (
            <p style={{ fontSize: 12.5, color: 'var(--warm-red)', margin: '2px 0 0' }}>
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isChangingPassword}
          className="btn btn-primary"
          style={{
            alignSelf: 'flex-start',
            opacity: isChangingPassword ? 0.7 : 1,
          }}
        >
          {isChangingPassword ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                style={{ animation: 'spin 0.8s linear infinite' }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray="50"
                  strokeDashoffset="12"
                  strokeLinecap="round"
                />
              </svg>
              Cambiando...
            </>
          ) : (
            'Cambiar Contraseña'
          )}
        </button>
      </form>
    </div>
  )
}

export default ChangePasswordForm
