import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { changePassword } from '../../services/auth'
import { resolveDefaultRoute } from '../../routes'

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

  return <div className="flex min-h-screen items-center justify-center bg-[#f5efe1] px-4"><form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm"><h1 className="text-xl font-extrabold text-slate-900">Crie sua nova senha</h1><p className="mt-1 text-sm text-slate-500">Por segurança, a senha temporária precisa ser alterada antes de continuar.</p><label htmlFor="current-password" className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500">Senha temporária</label><input id="current-password" required type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" /><label htmlFor="new-password" className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nova senha</label><input id="new-password" required type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" /><label htmlFor="confirm-password" className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmar nova senha</label><input id="confirm-password" required type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />{error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}<button type="submit" disabled={saving} className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white disabled:opacity-70">{saving ? 'Salvando...' : 'Salvar nova senha'}</button></form></div>
}