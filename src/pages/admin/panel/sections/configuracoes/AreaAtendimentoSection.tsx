import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import {
  listarAreaAtendimento,
  criarAreaAtendimentoCidade,
  atualizarAreaAtendimentoCidade,
  removerAreaAtendimentoCidade,
  type AreaAtendimentoCidade,
} from '../../../../../services/areaAtendimento'
import { buscarMunicipios, type MunicipioIbge } from '../../../../../services/ibge'
import { getApiErrorMessage } from '../../../../../services/apiClient'

function resumoLista(items: string[]): string {
  if (items.length === 0) return 'Nenhum bairro cadastrado'
  if (items.length === 1) return items[0]
  return `${items[0]}, +${items.length - 1}`
}

export default function AreaAtendimentoSection() {
  const [cidades, setCidades] = useState<AreaAtendimentoCidade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<MunicipioIbge[]>([])
  const [buscando, setBuscando] = useState(false)
  const [buscaOpen, setBuscaOpen] = useState(false)
  const buscaRef = useRef<HTMLDivElement>(null)

  const [bairroInputPorCidade, setBairroInputPorCidade] = useState<Record<string, string>>({})
  const [expandido, setExpandido] = useState<Record<string, boolean>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    listarAreaAtendimento()
      .then(setCidades)
      .catch(() => setError('Não foi possível carregar a área de atendimento.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const termo = busca.trim()
    if (termo.length < 2) return

    let isMounted = true

    async function buscar() {
      setBuscando(true)
      try {
        const municipios = await buscarMunicipios(termo)
        if (isMounted) setResultados(municipios)
      } finally {
        if (isMounted) setBuscando(false)
      }
    }

    buscar()

    return () => { isMounted = false }
  }, [busca])

  const resultadosVisiveis = busca.trim().length < 2 ? [] : resultados

  useEffect(() => {
    if (!buscaOpen) return
    function onClickOutside(event: MouseEvent) {
      if (buscaRef.current && !buscaRef.current.contains(event.target as Node)) setBuscaOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [buscaOpen])

  async function handleAdicionarCidade(municipio: MunicipioIbge) {
    setBuscaOpen(false)
    setBusca('')
    setResultados([])
    const jaExiste = cidades.some(
      c => c.cidade.toLowerCase() === municipio.nome.toLowerCase() && c.uf === municipio.uf,
    )
    if (jaExiste) return
    try {
      const nova = await criarAreaAtendimentoCidade({ cidade: municipio.nome, uf: municipio.uf, bairros: [] })
      setCidades(prev => [...prev, nova])
      setExpandido(prev => ({ ...prev, [nova.id]: true }))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível adicionar a cidade.'))
    }
  }

  async function handleRemoverCidade(id: string) {
    try {
      await removerAreaAtendimentoCidade(id)
      setCidades(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover a cidade.'))
    }
  }

  async function handleAdicionarBairro(cidade: AreaAtendimentoCidade) {
    const bairro = (bairroInputPorCidade[cidade.id] ?? '').trim()
    if (!bairro) return
    if (cidade.bairros.some(b => b.toLowerCase() === bairro.toLowerCase())) {
      setBairroInputPorCidade(prev => ({ ...prev, [cidade.id]: '' }))
      return
    }
    setSavingId(cidade.id)
    try {
      const atualizada = await atualizarAreaAtendimentoCidade(cidade.id, { bairros: [...cidade.bairros, bairro] })
      setCidades(prev => prev.map(c => (c.id === cidade.id ? atualizada : c)))
      setBairroInputPorCidade(prev => ({ ...prev, [cidade.id]: '' }))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível adicionar o bairro.'))
    } finally {
      setSavingId(null)
    }
  }

  async function handleRemoverBairro(cidade: AreaAtendimentoCidade, bairro: string) {
    setSavingId(cidade.id)
    try {
      const atualizada = await atualizarAreaAtendimentoCidade(cidade.id, {
        bairros: cidade.bairros.filter(b => b !== bairro),
      })
      setCidades(prev => prev.map(c => (c.id === cidade.id ? atualizada : c)))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível remover o bairro.'))
    } finally {
      setSavingId(null)
    }
  }

  if (loading) {
    return <p className="ap-card-sub">Carregando área de atendimento...</p>
  }

  return (
    <div className="ap-settings-stack">
      {error && (
        <p className="ap-card" style={{ marginBottom: 16, color: 'var(--ap-red)' }}>{error}</p>
      )}

      <div className="ap-card text-left">
        <div className="ap-card-title">Área de atendimento por delivery</div>
        <div className="ap-card-sub">
          Selecione as cidades e bairros atendidos por delivery. O endereço informado pelo cliente no checkout é
          validado contra essa lista.
        </div>

        <div className="ap-field" style={{ maxWidth: 360 }} ref={buscaRef}>
          <label className="ap-field-label" htmlFor="busca-cidade">Adicionar cidade atendida</label>
          <div style={{ position: 'relative' }}>
            <input
              id="busca-cidade"
              className="ap-input"
              value={busca}
              onChange={event => { setBusca(event.target.value); setBuscaOpen(true) }}
              onFocus={() => setBuscaOpen(true)}
              placeholder="Buscar cidade (ex: Florianópolis)"
              autoComplete="off"
            />
            {buscaOpen && busca.trim().length >= 2 && (
              <div
                className="ap-multiselect-panel"
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10, marginTop: 4 }}
              >
                {buscando ? (
                  <div className="ap-multiselect-option">Buscando...</div>
                ) : resultadosVisiveis.length === 0 ? (
                  <div className="ap-multiselect-option">Nenhuma cidade encontrada</div>
                ) : (
                  resultadosVisiveis.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      className="ap-multiselect-option"
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 0, cursor: 'pointer' }}
                      onClick={() => handleAdicionarCidade(m)}
                    >
                      {m.nome} — {m.uf}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {cidades.length === 0 ? (
        <div className="ap-card text-left">
          <div className="ap-card-sub">Nenhuma cidade atendida cadastrada ainda.</div>
        </div>
      ) : (
        cidades.map(cidade => {
          const aberto = !!expandido[cidade.id]
          return (
            <div key={cidade.id} className="ap-card text-left">
              <div className="ap-toggle-row" style={{ borderTop: 'none', paddingTop: 0 }}>
                <div className="ap-toggle-info">
                  <div>
                    <div className="ap-card-title" style={{ marginBottom: 2 }}>{cidade.cidade} — {cidade.uf}</div>
                    <button
                      type="button"
                      className="ap-select"
                      style={{ padding: '4px 10px', height: 'auto' }}
                      onClick={() => setExpandido(prev => ({ ...prev, [cidade.id]: !prev[cidade.id] }))}
                    >
                      Bairros: {resumoLista(cidade.bairros)}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className="ap-btn ap-btn-ghost ap-btn-icon"
                  aria-label={`Remover ${cidade.cidade}`}
                  onClick={() => handleRemoverCidade(cidade.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {aberto && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                    {cidade.bairros.map(bairro => (
                      <span
                        key={bairro}
                        className="ap-badge-status"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        {bairro}
                        <button
                          type="button"
                          onClick={() => handleRemoverBairro(cidade, bairro)}
                          aria-label={`Remover bairro ${bairro}`}
                          style={{ background: 'none', border: 0, cursor: 'pointer', display: 'flex' }}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {cidade.bairros.length === 0 && <span className="ap-card-sub">Nenhum bairro adicionado.</span>}
                  </div>

                  <div style={{ display: 'flex', gap: 8, maxWidth: 360 }}>
                    <input
                      className="ap-input"
                      value={bairroInputPorCidade[cidade.id] ?? ''}
                      onChange={event => setBairroInputPorCidade(prev => ({ ...prev, [cidade.id]: event.target.value }))}
                      onKeyDown={event => {
                        if (event.key === 'Enter') { event.preventDefault(); handleAdicionarBairro(cidade) }
                      }}
                      placeholder="Nome do bairro"
                    />
                    <button
                      type="button"
                      className="ap-btn ap-btn-primary ap-btn-icon"
                      onClick={() => handleAdicionarBairro(cidade)}
                      disabled={savingId === cidade.id}
                      aria-label="Adicionar bairro"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
