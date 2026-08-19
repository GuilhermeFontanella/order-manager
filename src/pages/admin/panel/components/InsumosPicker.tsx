import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { Insumo } from '../../../../services/insumos'

export type InsumoRow = { insumoId: string; quantidade: string }

export default function InsumosPicker({
  rows,
  disponiveis,
  onChange,
}: {
  rows: InsumoRow[]
  disponiveis: Insumo[]
  onChange: (rows: InsumoRow[]) => void
}) {
  const [insumoId, setInsumoId] = useState('')
  const [quantidade, setQuantidade] = useState('')

  const jaVinculados = new Set(rows.map(r => r.insumoId))
  const opcoesDisponiveis = disponiveis.filter(i => !jaVinculados.has(i.id))

  function addRow() {
    if (!insumoId || !quantidade) return
    onChange([...rows, { insumoId, quantidade }])
    setInsumoId('')
    setQuantidade('')
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }

  return (
    <div>
      {rows.map((row, index) => {
        const insumo = disponiveis.find(i => i.id === row.insumoId)
        return (
          <div key={row.insumoId} className="ap-opcao-row">
            <span style={{ flex: 1, fontSize: 13 }}>{insumo?.nome ?? 'Insumo removido'}</span>
            <span className="ap-ranked-sublabel">
              {row.quantidade} {insumo?.unidadeMedida.toLowerCase()}
            </span>
            <button type="button" className="ap-btn ap-btn-ghost ap-btn-icon" onClick={() => removeRow(index)} aria-label="Remover insumo">
              <Trash2 size={13} />
            </button>
          </div>
        )
      })}

      <div className="ap-subcard-row" style={{ marginTop: rows.length > 0 ? 10 : 0 }}>
        <select className="ap-select" style={{ flex: 1 }} value={insumoId} onChange={event => setInsumoId(event.target.value)}>
          <option value="">Selecione um insumo...</option>
          {opcoesDisponiveis.map(i => (
            <option key={i.id} value={i.id}>
              {i.nome}
            </option>
          ))}
        </select>
        <input
          className="ap-input"
          style={{ width: 130 }}
          value={quantidade}
          onChange={event => setQuantidade(event.target.value)}
          placeholder={`Qtd. (${disponiveis.find(i => i.id === insumoId)?.unidadeMedida.toLowerCase() ?? 'un'})`}
          inputMode="decimal"
        />
        <button type="button" className="ap-btn ap-btn-ghost" onClick={addRow} disabled={!insumoId || !quantidade}>
          <Plus size={13} />
          Adicionar
        </button>
      </div>
    </div>
  )
}
