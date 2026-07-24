import { Link } from 'react-router-dom'
import { Monitor } from 'lucide-react'

export default function CounterNavLink() {
  return (
    <Link
      to="/counter"
      className="inline-flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
    >
      <Monitor className="h-5 w-5" />
      Painel do Balcão
    </Link>
  )
}
