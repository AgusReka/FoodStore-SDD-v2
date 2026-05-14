import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@shared/stores/authStore'
import { useBreakpoint } from '@shared/hooks/useBreakpoint'
import LoginForm from '@features/auth/LoginForm'

const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const accessToken = useAuthStore((s) => s.accessToken)
  const { isMobile } = useBreakpoint()

  const redirectTo = searchParams.get('redirect') || '/'

  useEffect(() => {
    if (accessToken) {
      navigate(redirectTo, { replace: true })
    }
  }, [accessToken, navigate, redirectTo])

  const content = <LoginForm />

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[var(--bg-elevated)] p-6 flex flex-col justify-center" style={{ fontFamily: 'var(--ff-body)' }}>
        {content}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] relative flex items-center justify-center p-4" style={{ fontFamily: 'var(--ff-body)' }}>
      <div className="ambient" />
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[6px]" />
      <div
        className="relative w-full max-w-[420px] bg-[var(--bg-elevated)] rounded-[var(--r-lg)] p-9 shadow-[var(--shadow-float)]"
        style={{ animation: 'float-up 350ms var(--ease-spring)' }}
      >
        {content}
      </div>
    </div>
  )
}

export default LoginPage
