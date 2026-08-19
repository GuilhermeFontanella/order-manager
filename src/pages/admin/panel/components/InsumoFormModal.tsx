import Modal from '../../../../components/Modal'
import type { CategoriaInsumo, Insumo, InsumoInput } from '../../../../services/insumos'
import InsumoForm from './InsumoForm'

export default function InsumoFormModal({
  open,
  insumo,
  categorias,
  saving,
  error,
  onSubmit,
  onClose,
}: {
  open: boolean
  insumo?: Insumo
  categorias: CategoriaInsumo[]
  saving: boolean
  error?: string | null
  onSubmit: (payload: InsumoInput) => void
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      title={insumo ? 'Editar insumo' : 'Novo insumo'}
      description="Cadastre os itens usados no preparo (ex: Coca-cola lata 350ml)."
      onClose={onClose}
      maxWidth={620}
    >
      {error && <p style={{ color: 'var(--ap-red)', fontSize: 13, marginTop: 0 }}>{error}</p>}
      <InsumoForm key={insumo?.id ?? 'new'} insumo={insumo} categorias={categorias} saving={saving} onSubmit={onSubmit} onCancel={onClose} />
    </Modal>
  )
}
