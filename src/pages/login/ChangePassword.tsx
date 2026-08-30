import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { changePassword } from '../../services/auth'
import { resolveDefaultRoute } from '../../routes'
import StaffThemeShell from '../../components/ember/StaffThemeShell'
import ThemeToggle from '../../components/ember/ThemeToggle'
import TextField from '../../components/ember/TextField'
import Button from '../../components/ember/Button'

export default function ChangePassword() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (newPassword.length < 8) return setError('A nova senha deve ter pelo menos 8 caracteres.')
    if (newPassword !== confirmation) return setError('A confirmação não confere.')
    setSaving(true)
    setError('')
    try {
      await changePassword({ senhaAtual: currentPassword, novaSenha: newPassword })
      await refreshUser()
      navigate(resolveDefaultRoute(true, user?.papel ?? null), { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível alterar a senha.')
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
          <h1 style={{ font: 'var(--text-h1)', color: 'var(--text-primary)' }}>Crie sua nova senha</h1>
          <p className="mt-1" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)' }}>
            Por segurança, a senha temporária precisa ser alterada antes de continuar.
          </p>

          <div className="mt-6 space-y-5">
            <TextField
              id="current-password" label="Senha temporária" required type="password"
              value={currentPassword} onChange={event => setCurrentPassword(event.target.value)}
            />
            <TextField
              id="new-password" label="Nova senha" required type="password"
              value={newPassword} onChange={event => setNewPassword(event.target.value)}
            />
            <TextField
              id="confirm-password" label="Confirmar nova senha" required type="password"
              value={confirmation} onChange={event => setConfirmation(event.target.value)}
            />
          </div>

          {error && <p className="mt-3" style={{ font: 'var(--text-body)', color: 'var(--danger)' }}>{error}</p>}

          <Button type="submit" fullWidth size="lg" disabled={saving} style={{ marginTop: 'var(--sp-6)' }}>
            {saving ? 'Salvando...' : 'Salvar nova senha'}
          </Button>
        </form>
      </div>
    </StaffThemeShell>
  )
}
