import Modal from '../../../../components/Modal'
import type { Categoria } from '../../../../services/categorias'
import type { Insumo } from '../../../../services/insumos'
import type { ProdutoDetalhado, ProdutoDetalhadoInput } from '../../../../services/produtos'
import ProdutoForm from './ProdutoForm'

export default function ProdutoFormModal({
  open,
  produto,
  defaultCategoriaId,
  categorias,
  insumosDisponiveis,
  saving,
  error,
  onSubmit,
  onClose,
}: {
  open: boolean
  produto?: ProdutoDetalhado
  defaultCategoriaId?: string
  categorias: Categoria[]
  insumosDisponiveis: Insumo[]
  saving: boolean
  error?: string | null
  onSubmit: (payload: ProdutoDetalhadoInput) => void
  onClose: () => void
}) {
  return (
    <Modal
      open={open}
      title={produto ? 'Editar item' : 'Novo item'}
      description="Cadastre nome, descrição, preço, opções de preparo, fotos e os insumos que o item consome."
      onClose={onClose}
      maxWidth={720}
    >
      {error && <p style={{ color: 'var(--ap-red)', fontSize: 13, marginTop: 0 }}>{error}</p>}
      <ProdutoForm
        key={produto?.id ?? 'new'}
        produto={produto}
        defaultCategoriaId={defaultCategoriaId}
        categorias={categorias}
        insumosDisponiveis={insumosDisponiveis}
        saving={saving}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}
