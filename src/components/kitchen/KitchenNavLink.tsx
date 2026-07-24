import { Link } from 'react-router-dom'
import { ChefHat } from 'lucide-react'

export default function KitchenNavLink() {
  return (
    <Link
      to="/kitchen"
      className="inline-flex items-center gap-3 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
    >
      <ChefHat className="h-5 w-5" />
      Painel da Cozinha
    </Link>
  )
}
