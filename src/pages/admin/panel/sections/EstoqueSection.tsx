import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import ConfirmDialog from '../../../../components/ConfirmDialog'
import Accordion from '../../../../components/Accordion'
import MultiSelectDropdown from '../../../../components/MultiSelectDropdown'
import CategoriaInsumoFormModal from '../components/CategoriaInsumoFormModal'
import InsumoFormModal from '../components/InsumoFormModal'
import {
  createCategoriaInsumo,
  createInsumo,
  deleteCategoriaInsumo,
  deleteInsumo,
  listCategoriasInsumo,
  listInsumos,
  updateInsumo,
  UNIDADE_LABEL,
  type CategoriaInsumo,
  type Insumo,
  type InsumoInput,
  type UnidadeMedida,
} from '../../../../services/insumos'
import { getApiErrorMessage } from '../../../../services/apiClient'

function isEstoqueBaixo(insumo: Insumo): boolean {
  if (insumo.estoqueMinimo === null) return false
  return parseFloat(insumo.quantidadeEstoque) <= parseFloat(insumo.estoqueMinimo)
}

export default function EstoqueSection() {
  const [categorias, setCategorias] = useState<CategoriaInsumo[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [categoriasFiltro, setCategoriasFiltro] = useState<Set<string>>(new Set())
  const [unidadesFiltro, setUnidadesFiltro] = useState<Set<UnidadeMedida>>(new Set())
  const [apenasAcabando, setApenasAcabando] = useState(false)

  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false)
  const [categoriaModalKey, setCategoriaModalKey] = useState(0)
  const [savingCategoria, setSavingCategoria] = useState(false)
  const [categoriaError, setCategoriaError] = useState<string | null>(null)

  const [insumoModalOpen, setInsumoModalOpen] = useState(false)
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null)
  const [savingInsumo, setSavingInsumo] = useState(false)
  const [insumoError, setInsumoError] = useState<string | null>(null)

  const [pendingDeleteCategoria, setPendingDeleteCategoria] = useState<CategoriaInsumo | null>(null)
  const [pendingDeleteInsumo, setPendingDeleteInsumo] = useState<Insumo | null>(null)

  useEffect(() => {
    let isMounted = true
    Promise.all([listCategoriasInsumo(), listInsumos()])
      .then(([categoriasList, insumosList]) => {
        if (!isMounted) return
        setCategorias(categoriasList)
        setInsumos(insumosList)
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar o estoque.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const insumosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return insumos.filter(insumo => {
      if (termo && !insumo.nome.toLowerCase().includes(termo)) return false
      if (categoriasFiltro.size > 0 && !categoriasFiltro.has(insumo.categoriaId)) return false
      if (unidadesFiltro.size > 0 && !unidadesFiltro.has(insumo.unidadeMedida)) return false
      if (apenasAcabando && !isEstoqueBaixo(insumo)) return false
      return true
    })
  }, [insumos, busca, categoriasFiltro, unidadesFiltro, apenasAcabando])

  const filtrosAtivos = categoriasFiltro.size > 0 || unidadesFiltro.size > 0 || apenasAcabando

  function limparFiltros() {
    setCategoriasFiltro(new Set())
    setUnidadesFiltro(new Set())
    setApenasAcabando(false)
  }

  function abrirNovaCategoria() {
    setCategoriaError(null)
    setCategoriaModalKey(prev => prev + 1)
    setCategoriaModalOpen(true)
  }

  async function handleCreateCategoria(nome: string) {
    setSavingCategoria(true)
    setCategoriaError(null)
    try {
      const categoria = await createCategoriaInsumo(nome)
      setCategorias(prev => [...prev, categoria].sort((a, b) => a.nome.localeCompare(b.nome)))
      setCategoriaModalOpen(false)
    } catch (err) {
      setCategoriaError(getApiErrorMessage(err, 'Não foi possível criar a categoria.'))
    } finally {
      setSavingCategoria(false)
    }
  }

  async function confirmDeleteCategoria() {
    const categoria = pendingDeleteCategoria
    if (!categoria) return
    setPendingDeleteCategoria(null)
    setError(null)
    try {
      await deleteCategoriaInsumo(categoria.id)
      setCategorias(prev => prev.filter(c => c.id !== categoria.id))
      setCategoriasFiltro(prev => {
        if (!prev.has(categoria.id)) return prev
        const next = new Set(prev)
        next.delete(categoria.id)
        return next
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover a categoria.'))
    }
  }

  function abrirNovoInsumo() {
    setEditingInsumo(null)
    setInsumoError(null)
    setInsumoModalOpen(true)
  }

  function abrirEdicaoInsumo(insumo: Insumo) {
    setEditingInsumo(insumo)
    setInsumoError(null)
    setInsumoModalOpen(true)
  }

  async function handleSubmitInsumo(payload: InsumoInput) {
    setSavingInsumo(true)
    setInsumoError(null)
    try {
      if (editingInsumo) {
        const updated = await updateInsumo(editingInsumo.id, payload)
        setInsumos(prev => prev.map(i => (i.id === editingInsumo.id ? updated : i)))
      } else {
        const created = await createInsumo(payload)
        setInsumos(prev => [...prev, created])
      }
      setInsumoModalOpen(false)
      setEditingInsumo(null)
    } catch (err) {
      setInsumoError(getApiErrorMessage(err, 'Não foi possível salvar o insumo.'))
    } finally {
      setSavingInsumo(false)
    }
  }

  async function confirmDeleteInsumo() {
    const insumo = pendingDeleteInsumo
    if (!insumo) return
    setPendingDeleteInsumo(null)
    setError(null)
    try {
      await deleteInsumo(insumo.id)
      setInsumos(prev => prev.filter(i => i.id !== insumo.id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover o insumo.'))
    }
  }

  if (loading) {
    return <p className="ap-card-sub">Carregando estoque...</p>
  }

  return (
    <div>
      {error && (
        <p className="ap-card" style={{ marginBottom: 16, color: 'var(--ap-red)' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button type="button" className="ap-btn ap-btn-primary" onClick={abrirNovaCategoria}>
          <Plus size={15} />
          Adicionar categoria
        </button>
        {categorias.length > 0 && (
          <button type="button" className="ap-btn ap-btn-ghost" onClick={abrirNovoInsumo}>
            <Plus size={15} />
            Novo insumo
          </button>
        )}
      </div>

      <div className="ap-search-row">
        <Search size={16} className="ap-search-icon" />
        <input
          className="ap-input ap-search-input"
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder="Pesquisar insumo por nome..."
        />
      </div>

      <Accordion title={!filtrosAtivos ? "Filtro avançado" : `Filtros ativos`}>
        <div className="ap-filter-row">
          <div className="ap-filter-field flex-1" style={{display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start'}}>
            <span className="ap-filter-label">Categoria</span>
            <MultiSelectDropdown
              options={categorias.map(categoria => ({ value: categoria.id, label: categoria.nome }))}
              selected={categoriasFiltro}
              onChange={setCategoriasFiltro}
              placeholder="Categoria..."
            />
          </div>

          <div className="ap-filter-field flex-1" style={{display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start'}}>
            <span className="ap-filter-label">Unidade de medida</span>
            <MultiSelectDropdown
              options={(Object.keys(UNIDADE_LABEL) as UnidadeMedida[]).map(unidade => ({ value: unidade, label: UNIDADE_LABEL[unidade] }))}
              selected={unidadesFiltro}
              onChange={next => setUnidadesFiltro(next as Set<UnidadeMedida>)}
              placeholder="Unidade..."
            />
          </div>
        </div>

        <div className="ap-filter-row">
          <label className="ap-checkbox-label">
            <input type="checkbox" checked={apenasAcabando} onChange={event => setApenasAcabando(event.target.checked)} />
            Itens acabando (estoque igual ou abaixo do mínimo)
          </label>
        </div>

        {filtrosAtivos && (
          <button type="button" className="ap-btn ap-btn-ghost" onClick={limparFiltros}>
            Limpar filtros
          </button>
        )}
      </Accordion>

      <div className="ap-card" style={{ marginTop: 16 }}>
        {insumos.length === 0 ? (
          <p className="ap-card-sub" style={{ marginBottom: 0 }}>Nenhum insumo cadastrado ainda.</p>
        ) : insumosFiltrados.length === 0 ? (
          <p className="ap-card-sub" style={{ marginBottom: 0 }}>Nenhum insumo encontrado para esses filtros.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Insumo</th>
                  <th>Categoria</th>
                  <th>Estoque</th>
                  <th>Itens que usam</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {insumosFiltrados.map(insumo => (
                  <tr key={insumo.id}>
                    <td className="ap-table-label">
                      {insumo.nome}
                      {isEstoqueBaixo(insumo) && <span className="ap-badge-low-stock">Estoque baixo</span>}
                    </td>
                    <td className="ap-table-sub">{insumo.categoria.nome}</td>
                    <td className="ap-ranked-value">
                      {parseFloat(insumo.quantidadeEstoque)} {UNIDADE_LABEL[insumo.unidadeMedida]}
                    </td>
                    <td className="ap-table-sub">
                      {insumo._count.produtos} {insumo._count.produtos === 1 ? 'item' : 'itens'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="ap-btn ap-btn-ghost ap-btn-icon"
                          onClick={() => abrirEdicaoInsumo(insumo)}
                          aria-label="Editar insumo"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="ap-btn ap-btn-danger ap-btn-icon"
                          onClick={() => setPendingDeleteInsumo(insumo)}
                          aria-label="Remover insumo"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CategoriaInsumoFormModal
        key={categoriaModalKey}
        open={categoriaModalOpen}
        saving={savingCategoria}
        error={categoriaError}
        onSubmit={handleCreateCategoria}
        onClose={() => setCategoriaModalOpen(false)}
      />

      <InsumoFormModal
        open={insumoModalOpen}
        insumo={editingInsumo ?? undefined}
        categorias={categorias}
        saving={savingInsumo}
        error={insumoError}
        onSubmit={handleSubmitInsumo}
        onClose={() => setInsumoModalOpen(false)}
      />

      <ConfirmDialog
        open={pendingDeleteCategoria !== null}
        title={`Remover a categoria "${pendingDeleteCategoria?.nome}"?`}
        description="Só é possível remover categorias sem insumos cadastrados."
        confirmLabel="Remover"
        destructive
        onConfirm={confirmDeleteCategoria}
        onCancel={() => setPendingDeleteCategoria(null)}
      />

      <ConfirmDialog
        open={pendingDeleteInsumo !== null}
        title={`Remover "${pendingDeleteInsumo?.nome}"?`}
        confirmLabel="Remover"
        destructive
        onConfirm={confirmDeleteInsumo}
        onCancel={() => setPendingDeleteInsumo(null)}
      />
    </div>
  )
}
