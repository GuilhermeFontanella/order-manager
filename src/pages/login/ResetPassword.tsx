import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../../services/auth'

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

  return <div className="flex min-h-screen items-center justify-center bg-[#f5efe1] px-4"><form onSubmit={handleSubmit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm"><h1 className="text-xl font-extrabold text-slate-900">Redefinir senha</h1>{success ? <><p className="mt-2 text-sm text-emerald-700">Sua senha foi redefinida com sucesso.</p><button type="button" onClick={() => navigate('/login')} className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white">Ir para o login</button></> : <><p className="mt-1 text-sm text-slate-500">Escolha uma nova senha para acessar o sistema.</p><label htmlFor="reset-password" className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500">Nova senha</label><input id="reset-password" required minLength={8} type="password" value={password} onChange={event => setPassword(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" /><label htmlFor="reset-confirmation" className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Confirmar nova senha</label><input id="reset-confirmation" required type="password" value={confirmation} onChange={event => setConfirmation(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />{error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}<button type="submit" disabled={saving} className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white disabled:opacity-70">{saving ? 'Salvando...' : 'Salvar nova senha'}</button></>}</form></div>
}