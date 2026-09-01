import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { createProduto, deleteProduto, listProdutos, updateProduto, type Produto } from '../../services/produtos'
import { getApiErrorMessage } from '../../services/apiClient'
import { fmt } from '../../data/menu'
import ConfirmDialog from '../../components/ConfirmDialog'

const emptyForm = { nome: '', descricao: '', preco: '', categoria: '' }

export default function ProdutosAdmin() {
  const navigate = useNavigate()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [creating, setCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Produto | null>(null)

  useEffect(() => {
    let isMounted = true
    listProdutos()
      .then(list => {
        if (isMounted) setProdutos(list)
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar os produtos.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const preco = Number(form.preco.replace(',', '.'))
    if (!form.nome.trim() || !preco || preco <= 0) return

    setCreating(true)
    setError(null)
    try {
      const produto = await createProduto({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || undefined,
        categoria: form.categoria.trim() || undefined,
        preco,
      })
      setProdutos(prev => [...prev, produto])
      setForm(emptyForm)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível criar o produto.'))
    } finally {
      setCreating(false)
    }
  }

  async function handleToggleDisponivel(produto: Produto) {
    try {
      const updated = await updateProduto(produto.id, { disponivel: !produto.disponivel })
      setProdutos(prev => prev.map(p => (p.id === produto.id ? updated : p)))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível atualizar o produto.'))
    }
  }

  async function confirmDelete() {
    const produto = pendingDelete
    if (!produto) return
    setPendingDelete(null)
    try {
      await deleteProduto(produto.id)
      setProdutos(prev => prev.filter(p => p.id !== produto.id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover o produto.'))
    }
  }

  return (
    <div className="min-h-screen bg-[#f5efe1] px-4 py-6">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </button>

        <h1 className="text-xl font-extrabold text-slate-900">Cardápio</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie os produtos que aparecem no cardápio dos clientes.</p>

        <form onSubmit={handleCreate} className="mt-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2">
          <input
            value={form.nome}
            onChange={event => setForm(prev => ({ ...prev, nome: event.target.value }))}
            placeholder="Nome do produto"
            className="rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500 sm:col-span-2"
          />
          <input
            value={form.preco}
            onChange={event => setForm(prev => ({ ...prev, preco: event.target.value }))}
            placeholder="Preço (ex: 25.90)"
            inputMode="decimal"
            className="rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          />
          <input
            value={form.categoria}
            onChange={event => setForm(prev => ({ ...prev, categoria: event.target.value }))}
            placeholder="Categoria (ex: Lanches)"
            className="rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
          />
          <div className="flex flex-col gap-1 sm:col-span-2">
            <input
              value={form.descricao}
              onChange={event => setForm(prev => ({ ...prev, descricao: event.target.value }))}
              placeholder="Descrição (opcional)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-slate-900 outline-none focus:border-emerald-500"
              maxLength={100}
            />
            <span className="text-right text-xs text-slate-400">{form.descricao.length}/100</span>
          </div>
          <button
            type="submit"
            disabled={creating || !form.nome.trim() || !form.preco}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
          >
            {creating ? 'Criando...' : 'Adicionar produto'}
          </button>
        </form>

        {error && <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">Nenhum produto cadastrado ainda.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {produtos.map(produto => (
              <li key={produto.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
                <div>
                  <div className="font-semibold text-slate-900">{produto.nome}</div>
                  <div className="text-xs text-slate-500">
                    {produto.categoria ?? 'Sem categoria'} · {fmt(Math.round(parseFloat(produto.preco) * 100))}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleDisponivel(produto)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      produto.disponivel ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {produto.disponivel ? 'Disponível' : 'Indisponível'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingDelete(produto)}
                    className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    Remover
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`Remover "${pendingDelete?.nome}"?`}
        confirmLabel="Remover"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}
