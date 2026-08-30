import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { forgotPassword, loginService } from '../../services/auth'
import { resolveDefaultRoute } from '../../routes'
import StaffThemeShell from '../../components/ember/StaffThemeShell'
import ThemeToggle from '../../components/ember/ThemeToggle'
import TextField from '../../components/ember/TextField'
import Button from '../../components/ember/Button'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleForgotPassword(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await forgotPassword(forgotEmail.trim().toLowerCase())
      setForgotSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível solicitar a recuperação.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    setError('')
    setIsSubmitting(true)

    try {
      const { accessToken, user } = await loginService({ email: email.trim(), senha: password })
      login(accessToken, user)
      navigate(resolveDefaultRoute(true, user.papel), { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Não foi possível realizar o login.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <StaffThemeShell>
      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div aria-hidden style={{ position: 'absolute', top: -140, left: -100, width: 460, height: 460, background: 'var(--gradient-ember-glow)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <ThemeToggle />
        </div>

        <form
          onSubmit={forgotMode ? handleForgotPassword : handleSubmit}
          className="relative w-full max-w-sm p-8"
          style={{ borderRadius: 'var(--r-sheet)', background: 'var(--surface-sheet)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', boxShadow: 'var(--ring-inner), var(--shadow-card)' }}
        >
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Entrar</h1>
          <p className="mt-1" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            {forgotMode ? 'Informe seu e-mail para receber o link de recuperação.' : 'Acesse o painel da sua função.'}
          </p>

          <div className="mt-6">
            <TextField
              id={forgotMode ? 'forgot-email' : 'login-email'}
              label="E-mail"
              type="email"
              value={forgotMode ? forgotEmail : email}
              onChange={event => forgotMode ? setForgotEmail(event.target.value) : setEmail(event.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          {!forgotMode && (
            <div className="mt-5">
              <TextField
                id="login-password" label="Senha" type="password"
                value={password} onChange={event => setPassword(event.target.value)}
                placeholder="••••••••" autoComplete="current-password"
              />
            </div>
          )}

          {forgotSent && <p className="mt-3" style={{ font: 'var(--text-body)', color: 'var(--success)' }}>Se o e-mail estiver cadastrado, você receberá as instruções em instantes.</p>}
          {error && <p className="mt-3" style={{ font: 'var(--text-body)', color: 'var(--danger)' }}>{error}</p>}

          {!forgotMode && (
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() => { setForgotMode(true); setForgotSent(false); setError('') }}
                style={{ font: 'var(--text-label)', color: 'var(--accent-quiet)' }}
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          <Button type="submit" fullWidth size="lg" disabled={isSubmitting} style={{ marginTop: 'var(--sp-6)' }}>
            {isSubmitting ? 'Enviando...' : forgotMode ? 'Enviar instruções' : 'Entrar'}
          </Button>
          {forgotMode && (
            <button
              type="button"
              onClick={() => { setForgotMode(false); setForgotSent(false); setError('') }}
              className="mt-3 w-full text-center"
              style={{ font: 'var(--text-label)', color: 'var(--text-muted)' }}
            >
              Voltar para o login
            </button>
          )}
        </form>
      </div>
    </StaffThemeShell>
  )
}
