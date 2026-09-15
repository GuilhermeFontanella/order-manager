import { useEffect, useMemo, useState } from 'react'
import { Maximize2, Pencil, Plus, Trash2 } from 'lucide-react'
import { listCategorias, createCategoria, updateCategoria, deleteCategoria, type Categoria, type CategoriaInput } from '../../../../services/categorias'
import { listInsumos, type Insumo } from '../../../../services/insumos'
import {
  listProdutosDetalhado,
  createProdutoDetalhado,
  updateProdutoDetalhado,
  deleteProduto,
  type ProdutoDetalhado,
  type ProdutoDetalhadoInput,
} from '../../../../services/produtos'
import { getApiErrorMessage } from '../../../../services/apiClient'
import { fmt } from '../../../../data/menu'
import ConfirmDialog from '../../../../components/ConfirmDialog'
import CategoriaFormModal from '../components/CategoriaFormModal'
import ProdutoFormModal from '../components/ProdutoFormModal'
import ProdutoDetalheModal from '../components/ProdutoDetalheModal'

const SEM_CATEGORIA_ID = '__sem-categoria__'

export default function CardapioSection() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<ProdutoDetalhado[]>([])
  const [insumos, setInsumos] = useState<Insumo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<string | null>(null)

  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false)
  const [categoriaModalKey, setCategoriaModalKey] = useState(0)
  const [savingCategoria, setSavingCategoria] = useState(false)
  const [categoriaError, setCategoriaError] = useState<string | null>(null)

  const [produtoModalOpen, setProdutoModalOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<ProdutoDetalhado | null>(null)
  const [savingProduto, setSavingProduto] = useState(false)
  const [produtoError, setProdutoError] = useState<string | null>(null)

  const [pendingDeleteCategoria, setPendingDeleteCategoria] = useState<Categoria | null>(null)
  const [pendingDeleteProduto, setPendingDeleteProduto] = useState<ProdutoDetalhado | null>(null)

  const [detalheProduto, setDetalheProduto] = useState<ProdutoDetalhado | null>(null)

  useEffect(() => {
    let isMounted = true
    Promise.all([listCategorias(), listProdutosDetalhado(), listInsumos()])
      .then(([categoriasList, produtosList, insumosList]) => {
        if (!isMounted) return
        setCategorias(categoriasList)
        setProdutos(produtosList)
        setInsumos(insumosList)
        setActiveTab(prev => prev ?? categoriasList[0]?.id ?? null)
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar o cardápio.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const produtosPorCategoria = useMemo(() => {
    const map = new Map<string, ProdutoDetalhado[]>()
    for (const produto of produtos) {
      const chave = produto.categoriaId ?? SEM_CATEGORIA_ID
      const lista = map.get(chave) ?? []
      lista.push(produto)
      map.set(chave, lista)
    }
    return map
  }, [produtos])

  const abas: Array<{ id: string; nome: string; categoria: Categoria | null }> = [
    ...categorias.map(categoria => ({ id: categoria.id, nome: categoria.nome, categoria })),
    ...(produtosPorCategoria.get(SEM_CATEGORIA_ID)?.length
      ? [{ id: SEM_CATEGORIA_ID, nome: 'Sem categoria', categoria: null }]
      : []),
  ]

  const abaAtiva = abas.find(aba => aba.id === activeTab) ?? abas[0]
  const itensDaAba = abaAtiva ? produtosPorCategoria.get(abaAtiva.id) ?? [] : []

  function abrirNovaCategoria() {
    setCategoriaError(null)
    setCategoriaModalKey(prev => prev + 1)
    setCategoriaModalOpen(true)
  }

  async function handleCreateCategoria(payload: CategoriaInput) {
    setSavingCategoria(true)
    setCategoriaError(null)
    try {
      const categoria = await createCategoria(payload)
      setCategorias(prev => [...prev, categoria].sort((a, b) => a.nome.localeCompare(b.nome)))
      setActiveTab(categoria.id)
      setCategoriaModalOpen(false)
    } catch (err) {
      setCategoriaError(getApiErrorMessage(err, 'Não foi possível criar a categoria.'))
    } finally {
      setSavingCategoria(false)
    }
  }

  async function handleToggleAtiva(categoria: Categoria) {
    setError(null)
    try {
      const updated = await updateCategoria(categoria.id, { ativa: !categoria.ativa })
      setCategorias(prev => prev.map(c => (c.id === categoria.id ? updated : c)))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível atualizar a categoria.'))
    }
  }

  async function confirmDeleteCategoria() {
    const categoria = pendingDeleteCategoria
    if (!categoria) return
    setPendingDeleteCategoria(null)
    setError(null)
    try {
      await deleteCategoria(categoria.id)
      setCategorias(prev => prev.filter(c => c.id !== categoria.id))
      setActiveTab(prev => (prev === categoria.id ? null : prev))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover a categoria.'))
    }
  }

  function abrirNovoItem() {
    setEditingProduto(null)
    setProdutoError(null)
    setProdutoModalOpen(true)
  }

  function abrirEdicaoItem(produto: ProdutoDetalhado) {
    setDetalheProduto(null)
    setEditingProduto(produto)
    setProdutoError(null)
    setProdutoModalOpen(true)
  }

  function abrirRemocaoItem(produto: ProdutoDetalhado) {
    setDetalheProduto(null)
    setPendingDeleteProduto(produto)
  }

  async function handleSubmitProduto(payload: ProdutoDetalhadoInput) {
    setSavingProduto(true)
    setProdutoError(null)
    try {
      if (editingProduto) {
        const updated = await updateProdutoDetalhado(editingProduto.id, payload)
        setProdutos(prev => prev.map(p => (p.id === editingProduto.id ? updated : p)))
      } else {
        const created = await createProdutoDetalhado(payload)
        setProdutos(prev => [...prev, created])
        setActiveTab(created.categoriaId ?? SEM_CATEGORIA_ID)
      }
      setProdutoModalOpen(false)
      setEditingProduto(null)
    } catch (err) {
      setProdutoError(getApiErrorMessage(err, 'Não foi possível salvar o item.'))
    } finally {
      setSavingProduto(false)
    }
  }

  async function confirmDeleteProduto() {
    const produto = pendingDeleteProduto
    if (!produto) return
    setPendingDeleteProduto(null)
    setError(null)
    try {
      await deleteProduto(produto.id)
      setProdutos(prev => prev.filter(p => p.id !== produto.id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover o item.'))
    }
  }

  if (loading) {
    return <p className="ap-card-sub">Carregando cardápio...</p>
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
          Nova categoria
        </button>
        {categorias.length > 0 && (
          <button type="button" className="ap-btn ap-btn-ghost" onClick={abrirNovoItem}>
            <Plus size={15} />
            Novo item
          </button>
        )}
      </div>

      {categorias.length === 0 ? (
        <p className="ap-card-sub">Crie uma categoria para começar a cadastrar itens do cardápio.</p>
      ) : (
        <>
          <div className="ap-tabs">
            {abas.map(aba => (
              <button
                key={aba.id}
                type="button"
                className={`ap-tab ${aba.id === abaAtiva?.id ? 'is-active' : ''}`}
                onClick={() => setActiveTab(aba.id)}
              >
                {aba.nome}
                <span className="ap-tab-count">{produtosPorCategoria.get(aba.id)?.length ?? 0}</span>
              </button>
            ))}
          </div>

          <div className="ap-card">
            {abaAtiva?.categoria && (
              <div className="ap-group-header" style={{ marginBottom: 16 }}>
                <div>
                  <div className="ap-card-title" style={{ marginBottom: 4 }}>
                    {abaAtiva.categoria.nome}
                  </div>
                  {abaAtiva.categoria.descricao && <div className="ap-card-sub" style={{ marginBottom: 0 }}>{abaAtiva.categoria.descricao}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    className={`ap-btn ${abaAtiva.categoria.ativa ? 'ap-btn-primary' : 'ap-btn-ghost'}`}
                    onClick={() => handleToggleAtiva(abaAtiva.categoria!)}
                  >
                    {abaAtiva.categoria.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                  <button
                    type="button"
                    className="ap-btn ap-btn-danger ap-btn-icon"
                    onClick={() => setPendingDeleteCategoria(abaAtiva.categoria)}
                    aria-label="Remover categoria"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}

            {itensDaAba.length === 0 ? (
              <p className="ap-card-sub" style={{ marginBottom: 0 }}>Nenhum item nesta categoria ainda.</p>
            ) : (
              <>
                <div className="ap-table-wrap" style={{ overflowX: 'auto' }}>
                  <table className="ap-table text-left">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Descrição</th>
                        <th>Preço</th>
                        <th>Detalhes</th>
                        <th>Status</th>
                        <th aria-label="Ações" />
                      </tr>
                    </thead>
                    <tbody>
                      {itensDaAba.map(produto => (
                        <tr key={produto.id}>
                          <td className="ap-table-label">{produto.nome}</td>
                          <td className="ap-table-sub">{produto.descricao || '—'}</td>
                          <td className="ap-ranked-value">{fmt(Math.round(parseFloat(produto.preco) * 100))}</td>
                          <td className="ap-table-sub">
                            {[
                              produto.gruposOpcao.length > 0 && `${produto.gruposOpcao.length} grupo(s) de opção`,
                              produto.insumos.length > 0 && `${produto.insumos.length} insumo(s)`,
                              produto.imagens.length > 0 && `${produto.imagens.length} foto(s)`,
                            ]
                              .filter(Boolean)
                              .join(' · ') || '—'}
                          </td>
                          <td>
                            {produto.disponivel ? (
                              <span className="ap-ranked-value is-plain">Visível</span>
                            ) : (
                              <span className="ap-badge-low-stock">Oculto</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                className="ap-btn ap-btn-ghost ap-btn-icon"
                                onClick={() => abrirEdicaoItem(produto)}
                                aria-label="Editar item"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                className="ap-btn ap-btn-danger ap-btn-icon"
                                onClick={() => setPendingDeleteProduto(produto)}
                                aria-label="Remover item"
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

                <div className="ap-item-cards">
                  {itensDaAba.map(produto => (
                    <div key={produto.id} className="ap-item-card">
                      <div className="ap-item-card-header">
                        <div>
                          <div className="ap-item-card-title">{produto.nome}</div>
                          <div className="ap-ranked-value ap-item-card-price">{fmt(Math.round(parseFloat(produto.preco) * 100))}</div>
                        </div>
                        <div className="ap-item-card-actions">
                          <button
                            type="button"
                            className="ap-btn ap-btn-ghost ap-btn-icon"
                            onClick={() => setDetalheProduto(produto)}
                            aria-label="Ver detalhes do item"
                          >
                            <Maximize2 size={14} />
                          </button>
                          <button
                            type="button"
                            className="ap-btn ap-btn-ghost ap-btn-icon"
                            onClick={() => abrirEdicaoItem(produto)}
                            aria-label="Editar item"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="ap-btn ap-btn-danger ap-btn-icon"
                            onClick={() => setPendingDeleteProduto(produto)}
                            aria-label="Remover item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="ap-item-card-footer">
                        {produto.disponivel ? (
                          <span className="ap-ranked-value is-plain">Visível</span>
                        ) : (
                          <span className="ap-badge-low-stock" style={{ marginLeft: 0 }}>Oculto</span>
                        )}
                        <span className="ap-table-sub">
                          {[
                            produto.gruposOpcao.length > 0 && `${produto.gruposOpcao.length} grupo(s)`,
                            produto.insumos.length > 0 && `${produto.insumos.length} insumo(s)`,
                            produto.imagens.length > 0 && `${produto.imagens.length} foto(s)`,
                          ]
                            .filter(Boolean)
                            .join(' · ') || '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}

      <CategoriaFormModal
        key={categoriaModalKey}
        open={categoriaModalOpen}
        saving={savingCategoria}
        error={categoriaError}
        onSubmit={handleCreateCategoria}
        onClose={() => setCategoriaModalOpen(false)}
      />

      <ProdutoFormModal
        open={produtoModalOpen}
        produto={editingProduto ?? undefined}
        defaultCategoriaId={abaAtiva?.categoria?.id}
        categorias={categorias}
        insumosDisponiveis={insumos}
        saving={savingProduto}
        error={produtoError}
        onSubmit={handleSubmitProduto}
        onClose={() => setProdutoModalOpen(false)}
      />

      <ProdutoDetalheModal
        open={detalheProduto !== null}
        produto={detalheProduto}
        onEdit={abrirEdicaoItem}
        onDelete={abrirRemocaoItem}
        onClose={() => setDetalheProduto(null)}
      />

      <ConfirmDialog
        open={pendingDeleteCategoria !== null}
        title={`Remover a categoria "${pendingDeleteCategoria?.nome}"?`}
        description="Só é possível remover categorias sem itens cadastrados."
        confirmLabel="Remover"
        destructive
        onConfirm={confirmDeleteCategoria}
        onCancel={() => setPendingDeleteCategoria(null)}
      />

      <ConfirmDialog
        open={pendingDeleteProduto !== null}
        title={`Remover "${pendingDeleteProduto?.nome}"?`}
        confirmLabel="Remover"
        destructive
        onConfirm={confirmDeleteProduto}
        onCancel={() => setPendingDeleteProduto(null)}
      />
    </div>
  )
}
