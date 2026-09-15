import Modal from '../../../../components/Modal'
import { resolveMediaUrl } from '../../../../services/apiClient'
import { fmt } from '../../../../data/menu'
import type { ProdutoDetalhado } from '../../../../services/produtos'

export default function ProdutoDetalheModal({
  open,
  produto,
  onEdit,
  onDelete,
  onClose,
}: {
  open: boolean
  produto: ProdutoDetalhado | null
  onEdit: (produto: ProdutoDetalhado) => void
  onDelete: (produto: ProdutoDetalhado) => void
  onClose: () => void
}) {
  if (!produto) return null

  return (
    <Modal open={open} title={produto.nome} onClose={onClose} maxWidth={480}>
      <div className="ap-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="ap-field">
          <span className="ap-field-label">Preço</span>
          <input className="ap-input" value={fmt(Math.round(parseFloat(produto.preco) * 100))} disabled />
        </div>
        <div className="ap-field">
          <span className="ap-field-label">Status</span>
          {produto.disponivel ? (
            <span className="ap-ranked-value is-plain">Visível</span>
          ) : (
            <span className="ap-badge-low-stock" style={{ marginLeft: 0, width: 'fit-content' }}>Oculto</span>
          )}
        </div>
      </div>

      <div className="ap-field" style={{ marginTop: 14 }}>
        <span className="ap-field-label">Descrição</span>
        <p className="ap-table-sub" style={{ margin: 0 }}>{produto.descricao || 'Sem descrição.'}</p>
      </div>

      {produto.imagens.length > 0 && (
        <div className="ap-field" style={{ marginTop: 14 }}>
          <span className="ap-field-label">Fotos</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {produto.imagens.map(foto => (
              <img
                key={foto}
                src={resolveMediaUrl(foto)}
                alt={produto.nome}
                style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10 }}
              />
            ))}
          </div>
        </div>
      )}

      {produto.gruposOpcao.length > 0 && (
        <div className="ap-field" style={{ marginTop: 14 }}>
          <span className="ap-field-label">Grupos de opção</span>
          <div className="ap-card" style={{ padding: 12 }}>
            {produto.gruposOpcao.map(grupo => (
              <div key={grupo.id} style={{ fontSize: 13, padding: '4px 0' }}>
                {grupo.nome}
                <span className="ap-table-sub"> · {grupo.opcoes.map(o => o.nome).join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {produto.insumos.length > 0 && (
        <div className="ap-field" style={{ marginTop: 14 }}>
          <span className="ap-field-label">Insumos</span>
          <div className="ap-card" style={{ padding: 12 }}>
            {produto.insumos.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, padding: '4px 0' }}>
                <span>{item.insumo.nome}</span>
                <span className="ap-table-sub">
                  {item.quantidade} {item.insumo.unidadeMedida}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
        <button type="button" className="ap-btn ap-btn-primary" onClick={() => onEdit(produto)}>
          Editar item
        </button>
        <button type="button" className="ap-btn ap-btn-danger" onClick={() => onDelete(produto)}>
          Remover
        </button>
        <button type="button" className="ap-btn ap-btn-ghost" onClick={onClose}>
          Fechar
        </button>
      </div>
    </Modal>
  )
}
