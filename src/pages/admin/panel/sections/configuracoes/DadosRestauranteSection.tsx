import { useState } from 'react'
import { useAuth } from '../../../../../context/AuthContext'
import SettingsSaveBar from '../../components/SettingsSaveBar'
import { useSavedFlag } from '../../hooks/useSavedFlag'

type HorarioDia = {
  dia: string
  aberto: boolean
  abre: string
  fecha: string
}

const HORARIOS_INICIAIS: HorarioDia[] = [
  { dia: 'Segunda-feira', aberto: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Terça-feira', aberto: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Quarta-feira', aberto: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Quinta-feira', aberto: true, abre: '11:00', fecha: '23:00' },
  { dia: 'Sexta-feira', aberto: true, abre: '11:00', fecha: '00:00' },
  { dia: 'Sábado', aberto: true, abre: '11:00', fecha: '00:00' },
  { dia: 'Domingo', aberto: true, abre: '11:00', fecha: '17:00' },
]

export default function DadosRestauranteSection() {
  const { user } = useAuth()
  const { saved, trigger } = useSavedFlag()

  const [nome, setNome] = useState(user?.tenant?.nome ?? '')
  const [descricao, setDescricao] = useState(
    'Botequim de bairro com petiscos, chopp gelado e aquele clima de encontro entre amigos.'
  )
  const [historia, setHistoria] = useState(
    'Fundado em 2015 por um grupo de amigos apaixonados por boa comida e cerveja artesanal, o Botequim do Zé nasceu num quintal e virou ponto de encontro do bairro.'
  )
  const [horarios, setHorarios] = useState(HORARIOS_INICIAIS)

  function updateHorario(index: number, patch: Partial<HorarioDia>) {
    setHorarios(prev => prev.map((h, i) => (i === index ? { ...h, ...patch } : h)))
  }

  return (
    <div className="ap-settings-stack">
      <div className="ap-card">
        <div className="ap-card-title">Informações gerais</div>
        <div className="ap-card-sub">Como o restaurante se apresenta para os clientes no cardápio digital.</div>

        <div className="ap-field">
          <label className="ap-field-label" htmlFor="nome-restaurante">Nome do restaurante</label>
          <input
            id="nome-restaurante"
            className="ap-input"
            value={nome}
            onChange={event => setNome(event.target.value)}
          />
        </div>

        <div className="ap-field">
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

      <div className="ap-card">
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

      <SettingsSaveBar onSave={trigger} saved={saved} />
    </div>
  )
}
