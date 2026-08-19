import { useState } from 'react'
import { UNIDADE_LABEL, type CategoriaInsumo, type Insumo, type InsumoInput, type UnidadeMedida } from '../../../../services/insumos'

type FormState = {
  nome: string
  categoriaId: string
  unidadeMedida: UnidadeMedida
  quantidadeEstoque: string
  estoqueMinimo: string
  custoUnitario: string
}

function toFormState(insumo?: Insumo): FormState {
  if (!insumo) {
    return { nome: '', categoriaId: '', unidadeMedida: 'UN', quantidadeEstoque: '', estoqueMinimo: '', custoUnitario: '' }
  }
  return {
    nome: insumo.nome,
    categoriaId: insumo.categoriaId,
    unidadeMedida: insumo.unidadeMedida,
    quantidadeEstoque: insumo.quantidadeEstoque,
    estoqueMinimo: insumo.estoqueMinimo ?? '',
    custoUnitario: insumo.custoUnitario ?? '',
  }
}

export default function InsumoForm({
  insumo,
  categorias,
  saving,
  onSubmit,
  onCancel,
}: {
  insumo?: Insumo
  categorias: CategoriaInsumo[]
  saving: boolean
  onSubmit: (payload: InsumoInput) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(insumo))

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nome = form.nome.trim()
    if (!nome || !form.categoriaId) return

    onSubmit({
      nome,
      categoriaId: form.categoriaId,
      unidadeMedida: form.unidadeMedida,
      quantidadeEstoque: form.quantidadeEstoque ? Number(form.quantidadeEstoque.replace(',', '.')) : 0,
      estoqueMinimo: form.estoqueMinimo ? Number(form.estoqueMinimo.replace(',', '.')) : undefined,
      custoUnitario: form.custoUnitario ? Number(form.custoUnitario.replace(',', '.')) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="ap-form-grid">
      <input
        className="ap-input"
        style={{ gridColumn: '1 / -1' }}
        value={form.nome}
        onChange={event => setForm(prev => ({ ...prev, nome: event.target.value }))}
        placeholder="Nome do insumo (ex: Coca-cola lata 350ml)"
      />
      <select
        className="ap-select"
        value={form.categoriaId}
        onChange={event => setForm(prev => ({ ...prev, categoriaId: event.target.value }))}
        required
      >
        <option value="">Categoria... (obrigatória)</option>
        {categorias.map(categoria => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nome}
          </option>
        ))}
      </select>
      <select
        className="ap-select"
        value={form.unidadeMedida}
        onChange={event => setForm(prev => ({ ...prev, unidadeMedida: event.target.value as UnidadeMedida }))}
      >
        {(Object.keys(UNIDADE_LABEL) as UnidadeMedida[]).map(unidade => (
          <option key={unidade} value={unidade}>
            {UNIDADE_LABEL[unidade]}
          </option>
        ))}
      </select>
      <input
        className="ap-input"
        value={form.quantidadeEstoque}
        onChange={event => setForm(prev => ({ ...prev, quantidadeEstoque: event.target.value }))}
        placeholder="Quantidade em estoque"
        inputMode="decimal"
      />
      <input
        className="ap-input"
        value={form.estoqueMinimo}
        onChange={event => setForm(prev => ({ ...prev, estoqueMinimo: event.target.value }))}
        placeholder="Estoque mínimo (opcional)"
        inputMode="decimal"
      />
      <input
        className="ap-input"
        value={form.custoUnitario}
        onChange={event => setForm(prev => ({ ...prev, custoUnitario: event.target.value }))}
        placeholder="Custo unitário (opcional)"
        inputMode="decimal"
      />

      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
        <button
          type="submit"
          className="ap-btn ap-btn-primary"
          disabled={saving || !form.nome.trim() || !form.categoriaId}
        >
          {saving ? 'Salvando...' : insumo ? 'Salvar alterações' : 'Adicionar insumo'}
        </button>
        <button type="button" className="ap-btn ap-btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
