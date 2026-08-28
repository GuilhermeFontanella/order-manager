import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { forgotPassword, loginService } from '../../services/auth'
import { resolveDefaultRoute } from '../../routes'

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
    <div className="flex min-h-screen items-center justify-center bg-[#f5efe1] px-4">
      <form onSubmit={forgotMode ? handleForgotPassword : handleSubmit} className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-900">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500">{forgotMode ? 'Informe seu e-mail para receber o link de recuperação.' : 'Acesse o painel da sua função.'}</p>

        <label htmlFor={forgotMode ? 'forgot-email' : 'login-email'} className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          E-mail
        </label>
        <input
          id={forgotMode ? 'forgot-email' : 'login-email'}
          type="email"
          value={forgotMode ? forgotEmail : email}
          onChange={event => forgotMode ? setForgotEmail(event.target.value) : setEmail(event.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500"
        />

        {!forgotMode && <>
          <label htmlFor="login-password" className="mt-5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Senha</label>
          <input id="login-password" type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-emerald-500" />
        </>}

        {forgotSent && <p className="mt-3 text-sm font-medium text-emerald-700">Se o e-mail estiver cadastrado, você receberá as instruções em instantes.</p>}
        {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}

        {!forgotMode && <div className="mt-3 text-right">
          <button
            type="button"
            onClick={() => { setForgotMode(true); setForgotSent(false); setError('') }}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Esqueci minha senha
          </button>
        </div>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Enviando...' : forgotMode ? 'Enviar instruções' : 'Entrar'}
        </button>
        {forgotMode && <button type="button" onClick={() => { setForgotMode(false); setForgotSent(false); setError('') }} className="mt-3 w-full text-sm font-semibold text-slate-500 hover:text-slate-800">Voltar para o login</button>}
      </form>
    </div>
  )
}
