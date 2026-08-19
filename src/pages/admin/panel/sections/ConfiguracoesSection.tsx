import { Settings } from 'lucide-react'
import SectionPlaceholder from '../components/SectionPlaceholder'

export default function ConfiguracoesSection() {
  return (
    <SectionPlaceholder
      icon={Settings}
      title="Configurações"
      description="Aparência, horários, mesas e formas de pagamento chegam numa próxima etapa deste painel."
    />
  )
}
