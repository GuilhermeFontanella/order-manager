import { useEffect, useState } from 'react'
import Modal from '../../../../components/Modal'
import { TIPO_ENTREGA_LABEL, type Pedido, type StatusPedido } from '../../../../services/storefront'
import type { StatusPedidoManual } from '../../../../services/pedidosStaff'
import { fmt } from '../../../../data/menu'

const STATUS_LABEL: Record<StatusPedido, string> = {
  AGUARDANDO_PAGAMENTO: 'Aguardando pagamento',
  PREPARANDO: 'Preparando',
  PRONTO: 'Pronto',
  RETIRADO: 'Retirado',
  CANCELADO: 'Cancelado',
}

const METODO_LABEL: Record<'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' | 'GOOGLE_PAY' | 'APPLE_PAY', string> = {
  PIX: 'Pix',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  GOOGLE_PAY: 'Google Pay',
  APPLE_PAY: 'Apple Pay',
}

const STATUS_ALTERAVEIS: StatusPedido[] = ['AGUARDANDO_PAGAMENTO', 'PREPARANDO', 'PRONTO']

function dataHoraLabel(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PedidoDetalheModal({
  open,
  pedido,
  saving,
  error,
  onSubmit,
  onClose,
}: {
  open: boolean
  pedido: Pedido | null
  saving: boolean
  error?: string | null
  onSubmit: (status: StatusPedidoManual, motivo: string) => void
  onClose: () => void
}) {
  const [novoStatus, setNovoStatus] = useState<StatusPedidoManual | ''>('')
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    if (open) {
      setNovoStatus('')
      setMotivo('')
    }
  }, [open, pedido?.id])

  if (!pedido) return null

  const podeAlterar = STATUS_ALTERAVEIS.includes(pedido.status)
  const motivoValido = motivo.trim().length >= 5

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!novoStatus || !motivoValido) return
    onSubmit(novoStatus, motivo.trim())
  }

  return (
    <Modal open={open} title={`Pedido #${pedido.numeroSequencial}`} onClose={onClose} maxWidth={560}>
      {error && <p style={{ color: 'var(--ap-red)', fontSize: 13, marginTop: 0 }}>{error}</p>}

      <div className="ap-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="ap-field">
          <span className="ap-field-label">Nº do pedido</span>
          <input className="ap-input" value={`#${pedido.numeroSequencial}`} disabled />
        </div>
        <div className="ap-field">
          <span className="ap-field-label">Origem</span>
          <input
            className="ap-input"
            value={pedido.mesa ? `Mesa ${pedido.mesa.numero}` : TIPO_ENTREGA_LABEL[pedido.tipoEntrega]}
            disabled
          />
        </div>
        <div className="ap-field">
          <span className="ap-field-label">Cliente</span>
          <input className="ap-input" value={pedido.nomeCliente} disabled />
        </div>
        <div className="ap-field">
          <span className="ap-field-label">Total</span>
          <input className="ap-input" value={fmt(Math.round(parseFloat(pedido.valorTotal) * 100))} disabled />
        </div>
        <div className="ap-field">
          <span className="ap-field-label">Tipo de pagamento</span>
          <input className="ap-input" value={pedido.pagamento ? METODO_LABEL[pedido.pagamento.metodo] : '—'} disabled />
        </div>
        <div className="ap-field">
          <span className="ap-field-label">Token de autorização</span>
          <input className="ap-input" value={pedido.pagamento?.gatewayTransactionId ?? '—'} disabled />
        </div>
        {pedido.tipoEntrega === 'DELIVERY' && (
          <div className="ap-field" style={{ gridColumn: '1 / -1' }}>
            <span className="ap-field-label">Endereço de entrega</span>
            <input
              className="ap-input"
              value={`${pedido.enderecoRua ?? ''}, ${pedido.enderecoNumero ?? ''} — ${pedido.enderecoBairro ?? ''}, ${pedido.enderecoCidade ?? ''} — CEP ${pedido.enderecoCep ?? ''}`}
              disabled
            />
          </div>
        )}
      </div>

      <div className="ap-field" style={{ marginTop: 14 }}>
        <span className="ap-field-label">Itens</span>
        <div className="ap-card" style={{ padding: 12 }}>
          {pedido.itens.map(item => (
            <div
              key={item.id}
              style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13, padding: '4px 0' }}
            >
              <span>
                {item.quantidade}x {item.nomeProduto}
              </span>
              <span className="ap-table-sub">{fmt(Math.round(parseFloat(item.subtotal) * 100))}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="ap-field" style={{ marginTop: 14 }}>
          <span className="ap-field-label">Status</span>
          {podeAlterar ? (
            <select
              className="ap-select"
              value={novoStatus}
              onChange={event => setNovoStatus(event.target.value as StatusPedidoManual | '')}
            >
              <option value="">{STATUS_LABEL[pedido.status]} (atual)</option>
              <option value="RETIRADO">Retirado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          ) : (
            <span className={`ap-badge-status ap-badge-status-${pedido.status.toLowerCase()}`} style={{ width: 'fit-content' }}>
              {STATUS_LABEL[pedido.status]}
            </span>
          )}
        </div>

        {podeAlterar && novoStatus && (
          <div className="ap-field" style={{ marginTop: 14 }}>
            <span className="ap-field-label">Observações (obrigatório)</span>
            <textarea
              className="ap-textarea"
              value={motivo}
              onChange={event => setMotivo(event.target.value)}
              placeholder="Descreva o motivo da alteração manual do status..."
            />
          </div>
        )}

        {pedido.alteracaoManual && (
          <p className="ap-card-sub" style={{ marginTop: 14, marginBottom: 0 }}>
            Última alteração manual: {pedido.alteracaoManual.motivo} — {pedido.alteracaoManual.usuario} em{' '}
            {dataHoraLabel(pedido.alteracaoManual.data)}
          </p>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          {podeAlterar && (
            <button type="submit" className="ap-btn ap-btn-primary" disabled={saving || !novoStatus || !motivoValido}>
              {saving ? 'Salvando...' : 'Salvar alteração'}
            </button>
          )}
          <button type="button" className="ap-btn ap-btn-ghost" onClick={onClose}>
            {podeAlterar ? 'Cancelar' : 'Fechar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
