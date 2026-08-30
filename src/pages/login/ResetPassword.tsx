import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../services/auth'
import StaffThemeShell from '../../components/ember/StaffThemeShell'
import ThemeToggle from '../../components/ember/ThemeToggle'
import TextField from '../../components/ember/TextField'
import Button from '../../components/ember/Button'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!token) return setError('Link de recuperação inválido.')
    if (password.length < 8) return setError('A nova senha deve ter pelo menos 8 caracteres.')
    if (password !== confirmation) return setError('A confirmação não confere.')
    setSaving(true)
    setError('')
    try {
      await resetPassword({ token, novaSenha: password })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível redefinir a senha.')
    } finally {
      setSaving(false)
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
          onSubmit={handleSubmit}
          className="relative w-full max-w-sm p-8"
          style={{ borderRadius: 'var(--r-sheet)', background: 'var(--surface-sheet)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)', boxShadow: 'var(--ring-inner), var(--shadow-card)' }}
        >
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Redefinir senha</h1>
          {success ? (
            <>
              <p className="mt-2" style={{ font: 'var(--text-body)', color: 'var(--success)' }}>Sua senha foi redefinida com sucesso.</p>
              <Button fullWidth size="lg" style={{ marginTop: 'var(--sp-6)' }} onClick={() => navigate('/login')}>Ir para o login</Button>
            </>
          ) : (
            <>
              <p className="mt-1" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>Escolha uma nova senha para acessar o sistema.</p>
              <div className="mt-6 space-y-5">
                <TextField
                  id="reset-password" label="Nova senha" required minLength={8} type="password"
                  value={password} onChange={event => setPassword(event.target.value)}
                />
                <TextField
                  id="reset-confirmation" label="Confirmar nova senha" required type="password"
                  value={confirmation} onChange={event => setConfirmation(event.target.value)}
                />
              </div>
              {error && <p className="mt-3" style={{ font: 'var(--text-body)', color: 'var(--danger)' }}>{error}</p>}
              <Button type="submit" fullWidth size="lg" disabled={saving} style={{ marginTop: 'var(--sp-6)' }}>
                {saving ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </>
          )}
        </form>
      </div>
    </StaffThemeShell>
  )
}
