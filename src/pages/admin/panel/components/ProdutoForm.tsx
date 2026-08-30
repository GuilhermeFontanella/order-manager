import { useState } from 'react'
import type { Categoria } from '../../../../services/categorias'
import type { Insumo } from '../../../../services/insumos'
import type { ProdutoDetalhado, ProdutoDetalhadoInput } from '../../../../services/produtos'
import OpcaoGruposEditor, { type OpcaoGrupoRow } from './OpcaoGruposEditor'
import InsumosPicker, { type InsumoRow } from './InsumosPicker'
import ProdutoFotosInput from './ProdutoFotosInput'

type FormState = {
  nome: string
  descricao: string
  preco: string
  categoriaId: string
  disponivel: boolean
  imagens: string[]
  gruposOpcao: OpcaoGrupoRow[]
  insumos: InsumoRow[]
}

function toFormState(produto?: ProdutoDetalhado, defaultCategoriaId?: string): FormState {
  if (!produto) {
    return {
      nome: '',
      descricao: '',
      preco: '',
      categoriaId: defaultCategoriaId ?? '',
      disponivel: true,
      imagens: [],
      gruposOpcao: [],
      insumos: [],
    }
  }
  return {
    nome: produto.nome,
    descricao: produto.descricao ?? '',
    preco: produto.preco,
    categoriaId: produto.categoriaId ?? '',
    disponivel: produto.disponivel,
    imagens: produto.imagens,
    gruposOpcao: produto.gruposOpcao.map(g => ({
      nome: g.nome,
      multiplaEscolha: g.multiplaEscolha,
      obrigatorio: g.obrigatorio,
      opcoes: g.opcoes.map(o => ({ nome: o.nome, precoAdicional: o.precoAdicional })),
    })),
    insumos: produto.insumos.map(i => ({ insumoId: i.insumoId, quantidade: i.quantidade })),
  }
}

export default function ProdutoForm({
  produto,
  defaultCategoriaId,
  categorias,
  insumosDisponiveis,
  saving,
  onSubmit,
  onCancel,
}: {
  produto?: ProdutoDetalhado
  defaultCategoriaId?: string
  categorias: Categoria[]
  insumosDisponiveis: Insumo[]
  saving: boolean
  onSubmit: (payload: ProdutoDetalhadoInput) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(() => toFormState(produto, defaultCategoriaId))
  const [validationError, setValidationError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nome = form.nome.trim()
    const descricao = form.descricao.trim()
    const preco = Number(form.preco.replace(',', '.'))
    if (!nome || !preco || preco <= 0) return
    if (!descricao) {
      setValidationError('A descrição do item é obrigatória.')
      return
    }
    if (!form.categoriaId) {
      setValidationError('Selecione uma categoria para o item.')
      return
    }

    const gruposLimpos = form.gruposOpcao
      .map(grupo => ({ ...grupo, nome: grupo.nome.trim(), opcoes: grupo.opcoes.filter(o => o.nome.trim()) }))
      .filter(grupo => grupo.nome && grupo.opcoes.length > 0)

    if (gruposLimpos.length !== form.gruposOpcao.length) {
      setValidationError('Todo grupo de opção precisa de um nome e pelo menos uma opção preenchida — remova os grupos vazios ou complete-os.')
      return
    }
    setValidationError(null)

    onSubmit({
      nome,
      descricao,
      preco,
      categoriaId: form.categoriaId,
      disponivel: form.disponivel,
      imagens: form.imagens,
      gruposOpcao: gruposLimpos.map(g => ({
        nome: g.nome,
        multiplaEscolha: g.multiplaEscolha,
        obrigatorio: g.obrigatorio,
        opcoes: g.opcoes.map(o => ({
          nome: o.nome.trim(),
          precoAdicional: o.precoAdicional ? Number(o.precoAdicional.replace(',', '.')) : undefined,
        })),
      })),
      insumos: form.insumos.map(i => ({ insumoId: i.insumoId, quantidade: Number(i.quantidade.replace(',', '.')) })),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="ap-form-grid">
      <input
        className="ap-input"
        style={{ gridColumn: '1 / -1' }}
        value={form.nome}
        onChange={event => setForm(prev => ({ ...prev, nome: event.target.value }))}
        placeholder="Nome do item (ex: X-Burger)"
      />
      <textarea
        className="ap-input"
        style={{ gridColumn: '1 / -1', minHeight: 64, resize: 'vertical' }}
        value={form.descricao}
        onChange={event => setForm(prev => ({ ...prev, descricao: event.target.value }))}
        placeholder="Descrição (obrigatória)"
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
      <div className="flex items-center">
        <div className="shrink-0 text-base text-gray-500 select-none sm:text-sm/6 mr-2">R$</div>
      <input
        className="ap-input"
        value={form.preco}
        onChange={event => setForm(prev => ({ ...prev, preco: event.target.value }))}
        placeholder="Preço (ex: R$ 25.90)"
        inputMode="decimal"
        type="number"
        min={0}
        max={9999.99}
      />
      </div>
      <button
        type="button"
        className={`ap-btn ${form.disponivel ? 'ap-btn-primary' : 'ap-btn-ghost'}`}
        onClick={() => setForm(prev => ({ ...prev, disponivel: !prev.disponivel }))}
      >
        {form.disponivel ? 'Exibindo no cardápio' : 'Oculto do cardápio'}
      </button>

      <div style={{ gridColumn: '1 / -1' }}>
        <div className="ap-card-title" style={{ marginTop: 8 }}>
          Fotos do item
        </div>
        <div className="ap-card-sub">Até 5 fotos exibidas em carrossel no cardápio. Opcional.</div>
        <ProdutoFotosInput imagens={form.imagens} onChange={imagens => setForm(prev => ({ ...prev, imagens }))} />
      </div>

      <div style={{ gridColumn: '1 / -1' }}>
        <div className="ap-card-title" style={{ marginTop: 8 }}>
          Opções de preparo
        </div>
        <div className="ap-card-sub">Ex: ponto da carne (escolha única), molhos (escolha múltipla). Opcional.</div>
        <OpcaoGruposEditor
          grupos={form.gruposOpcao}
          onChange={grupos => setForm(prev => ({ ...prev, gruposOpcao: grupos }))}
        />
      </div>

      <div style={{ gridColumn: '1 / -1', marginBottom: '16px' }}>
        <div className="ap-card-title" style={{ marginTop: 8 }}>
          Insumos utilizados
        </div>
        <div className="ap-card-sub">
          {insumosDisponiveis.length === 0
            ? 'Nenhum insumo cadastrado no Estoque ainda — esta parte é opcional.'
            : 'Quanto de cada insumo este item consome por unidade vendida. Opcional, mas essencial para o controle de estoque em tempo real.'}
        </div>
        <InsumosPicker
          rows={form.insumos}
          disponiveis={insumosDisponiveis}
          onChange={insumos => setForm(prev => ({ ...prev, insumos }))}
        />
      </div>

      {validationError && (
        <p style={{ gridColumn: '1 / -1', color: 'var(--ap-red)', fontSize: 13 }}>{validationError}</p>
      )}

      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 8 }}>
        <button
          type="submit"
          className="ap-btn ap-btn-primary"
          disabled={saving || !form.nome.trim() || !form.preco || !form.descricao.trim() || !form.categoriaId}
        >
          {saving ? 'Salvando...' : produto ? 'Salvar alterações' : 'Adicionar item'}
        </button>
        <button type="button" className="ap-btn ap-btn-ghost" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
