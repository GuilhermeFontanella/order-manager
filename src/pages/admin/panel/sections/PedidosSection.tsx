import { Receipt } from 'lucide-react'
import SectionPlaceholder from '../components/SectionPlaceholder'

export default function PedidosSection() {
  return (
    <SectionPlaceholder
      icon={Receipt}
      title="Pedidos"
      description="A listagem e o filtro de pedidos por status chegam numa próxima etapa deste painel."
    />
  )
}
