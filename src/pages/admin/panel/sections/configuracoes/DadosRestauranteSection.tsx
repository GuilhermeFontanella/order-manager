import { useEffect, useState } from 'react'
import { useAuth } from '../../../../../context/AuthContext'
import { getApiErrorMessage } from '../../../../../services/apiClient'
import { getConfiguracaoRestaurante, type HorarioDia } from '../../../../../services/storefront'
import { updateConfiguracaoRestaurante } from '../../../../../services/configuracaoRestaurante'
import { buscarEnderecoPorCep } from '../../../../../services/cep'
import { useSavedFlag } from '../../hooks/useSavedFlag'

const HORARIOS_PADRAO: HorarioDia[] = [
  { dia: 'Segunda-feira', aberto: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Terça-feira', aberto: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Quarta-feira', aberto: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Quinta-feira', aberto: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Sexta-feira', aberto: true, abre: '11:00', fecha: '00:00' },
  { dia: 'Sábado', aberto: true, abre: '11:00', fecha: '00:00' },
  { dia: 'Domingo', aberto: true, abre: '11:00', fecha: '17:00' },
]

export default function DadosRestauranteSection() {
  const { user, refreshUser } = useAuth()
  const { saved, trigger } = useSavedFlag()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [historia, setHistoria] = useState('')
  const [horarios, setHorarios] = useState<HorarioDia[]>(HORARIOS_PADRAO)

  const [enderecoCep, setEnderecoCep] = useState('')
  const [enderecoRua, setEnderecoRua] = useState('')
  const [enderecoNumero, setEnderecoNumero] = useState('')
  const [enderecoBairro, setEnderecoBairro] = useState('')
  const [enderecoCidade, setEnderecoCidade] = useState('')
  const [cepLoading, setCepLoading] = useState(false)
  const [permiteTakeaway, setPermiteTakeaway] = useState(true)
  const [permiteDelivery, setPermiteDelivery] = useState(false)

  useEffect(() => {
    if (!user?.tenant?.slug) return
    let isMounted = true
    getConfiguracaoRestaurante(user.tenant.slug)
      .then(config => {
        if (!isMounted) return
        setNome(config.nome)
        setDescricao(config.descricao ?? '')
        setHistoria(config.historia ?? '')
        setHorarios(config.horarios ?? HORARIOS_PADRAO)
        setEnderecoCep(config.enderecoCep ?? '')
        setEnderecoRua(config.enderecoRua ?? '')
        setEnderecoNumero(config.enderecoNumero ?? '')
        setEnderecoBairro(config.enderecoBairro ?? '')
        setEnderecoCidade(config.enderecoCidade ?? '')
        setPermiteTakeaway(config.permiteTakeaway)
        setPermiteDelivery(config.permiteDelivery)
      })
      .catch(() => {
        if (isMounted) setError('Não foi possível carregar os dados do restaurante.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [user?.tenant?.slug])

  function updateHorario(index: number, patch: Partial<HorarioDia>) {
    setHorarios(prev => prev.map((h, i) => (i === index ? { ...h, ...patch } : h)))
  }

  useEffect(() => {
    const digits = enderecoCep.replace(/\D/g, '')
    if (digits.length !== 8) return

    let isMounted = true

    async function buscarCep() {
      setCepLoading(true)
      try {
        const endereco = await buscarEnderecoPorCep(digits)
        if (!isMounted || !endereco) return
        setEnderecoRua(endereco.rua)
        setEnderecoBairro(endereco.bairro)
        setEnderecoCidade(endereco.cidade)
      } catch {
        // CEP inválido ou serviço indisponível — mantém o preenchimento manual
      } finally {
        if (isMounted) setCepLoading(false)
      }
    }

    buscarCep()

    return () => { isMounted = false }
  }, [enderecoCep])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await updateConfiguracaoRestaurante({
        nome,
        descricao,
        historia,
        horarios,
        enderecoCep,
        enderecoRua,
        enderecoNumero,
        enderecoBairro,
        enderecoCidade,
        permiteTakeaway,
        permiteDelivery,
      })
      await refreshUser()
      trigger()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível salvar os dados do restaurante.'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="ap-card-sub">Carregando dados do restaurante...</p>
  }

  return (
    <div className="ap-settings-stack">
      {error && (
        <p className="ap-card" style={{ marginBottom: 16, color: 'var(--ap-red)' }}>
          {error}
        </p>
      )}

      <div className="ap-card text-left">
        <div className="ap-card-title">Informações gerais</div>
        <div className="ap-card-sub">Como o restaurante se apresenta para os clientes no cardápio digital.</div>

        <div className="ap-field mb-4">
          <label className="ap-field-label" htmlFor="nome-restaurante">Nome do restaurante</label>
          <input
            id="nome-restaurante"
            className="ap-input"
            value={nome}
            onChange={event => setNome(event.target.value)}
            maxLength={15}
          />
        </div>

        <div className="ap-field mb-4">
          <label className="ap-field-label" htmlFor="descricao-restaurante">Descrição curta</label>
          <textarea
            id="descricao-restaurante"
            className="ap-textarea"
            value={descricao}
            onChange={event => setDescricao(event.target.value)}
            rows={2}
          />
        </div>

        <div className="ap-field">
          <label className="ap-field-label" htmlFor="historia-restaurante">História</label>
          <textarea
            id="historia-restaurante"
            className="ap-textarea"
            value={historia}
            onChange={event => setHistoria(event.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className="ap-card text-left">
        <div className="ap-card-title">Horário de funcionamento</div>
        <div className="ap-card-sub">Define o que aparece para o cliente e pode futuramente bloquear pedidos fora do horário.</div>

        {horarios.map((horario, index) => (
          <div key={horario.dia} className="ap-toggle-row">
            <div className="ap-toggle-info">
              <label className="ap-switch">
                <input
                  type="checkbox"
                  checked={horario.aberto}
                  onChange={event => updateHorario(index, { aberto: event.target.checked })}
                />
                <span className="ap-switch-track" />
              </label>
              <span className="ap-toggle-label">{horario.dia}</span>
            </div>

            {horario.aberto ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="time"
                  className="ap-input"
                  value={horario.abre}
                  onChange={event => updateHorario(index, { abre: event.target.value })}
                  style={{ width: 110 }}
                />
                <span className="ap-toggle-sublabel">até</span>
                <input
                  type="time"
                  className="ap-input"
                  value={horario.fecha}
                  onChange={event => updateHorario(index, { fecha: event.target.value })}
                  style={{ width: 110 }}
                />
              </div>
            ) : (
              <span className="ap-toggle-sublabel">Fechado</span>
            )}
          </div>
        ))}
      </div>

      <div className="ap-card text-left">
        <div className="ap-card-title">Endereço do restaurante</div>
        <div className="ap-card-sub">
          Usado para calcular a área de entrega. Digite o CEP para preencher rua, bairro e cidade automaticamente.
        </div>

        <div className="ap-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="ap-field mb-4">
            <label className="ap-field-label" htmlFor="endereco-cep-restaurante">CEP</label>
            <input
              id="endereco-cep-restaurante"
              className="ap-input"
              value={enderecoCep}
              onChange={event => setEnderecoCep(event.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="00000000"
            />
          </div>
          <div className="ap-field mb-4">
            <label className="ap-field-label" htmlFor="endereco-numero-restaurante">Número</label>
            <input
              id="endereco-numero-restaurante"
              className="ap-input"
              value={enderecoNumero}
              onChange={event => setEnderecoNumero(event.target.value)}
            />
          </div>
        </div>

        {cepLoading && <p className="ap-card-sub">Buscando endereço...</p>}

        <div className="ap-field mb-4">
          <label className="ap-field-label" htmlFor="endereco-rua-restaurante">Rua / logradouro</label>
          <input
            id="endereco-rua-restaurante"
            className="ap-input"
            value={enderecoRua}
            onChange={event => setEnderecoRua(event.target.value)}
          />
        </div>

        <div className="ap-form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="ap-field">
            <label className="ap-field-label" htmlFor="endereco-bairro-restaurante">Bairro</label>
            <input
              id="endereco-bairro-restaurante"
              className="ap-input"
              value={enderecoBairro}
              onChange={event => setEnderecoBairro(event.target.value)}
            />
          </div>
          <div className="ap-field">
            <label className="ap-field-label" htmlFor="endereco-cidade-restaurante">Cidade</label>
            <input
              id="endereco-cidade-restaurante"
              className="ap-input"
              value={enderecoCidade}
              onChange={event => setEnderecoCidade(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="ap-card text-left">
        <div className="ap-card-title">Retirada e entrega</div>
        <div className="ap-card-sub">
          Define o que o cliente pode escolher quando acessa o cardápio sem escanear o QR code de uma mesa.
        </div>

        <div className="ap-toggle-row">
          <div className="ap-toggle-info">
            <label className="ap-switch">
              <input
                type="checkbox"
                checked={permiteTakeaway}
                onChange={event => setPermiteTakeaway(event.target.checked)}
              />
              <span className="ap-switch-track" />
            </label>
            <span className="ap-toggle-label">Permitir take away</span>
          </div>
        </div>

        <div className="ap-toggle-row">
          <div className="ap-toggle-info">
            <label className="ap-switch">
              <input
                type="checkbox"
                checked={permiteDelivery}
                onChange={event => setPermiteDelivery(event.target.checked)}
              />
              <span className="ap-switch-track" />
            </label>
            <span className="ap-toggle-label">Permitir delivery</span>
          </div>
        </div>
      </div>

      <div className="ap-group-header" style={{ marginTop: 20 }}>
        <span className="ap-card-sub" style={{ margin: 0 }}>
          {saved ? 'Alterações salvas.' : 'As alterações são exibidas no cardápio digital do restaurante.'}
        </span>
        <button type="button" className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}
