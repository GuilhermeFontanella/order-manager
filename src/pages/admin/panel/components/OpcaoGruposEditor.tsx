import { Plus, Trash2 } from 'lucide-react'

export type OpcaoValorRow = { nome: string; precoAdicional: string }
export type OpcaoGrupoRow = { nome: string; multiplaEscolha: boolean; obrigatorio: boolean; opcoes: OpcaoValorRow[] }

function grupoVazio(): OpcaoGrupoRow {
  return { nome: '', multiplaEscolha: false, obrigatorio: false, opcoes: [{ nome: '', precoAdicional: '' }] }
}

export default function OpcaoGruposEditor({
  grupos,
  onChange,
}: {
  grupos: OpcaoGrupoRow[]
  onChange: (grupos: OpcaoGrupoRow[]) => void
}) {
  function updateGrupo(index: number, patch: Partial<OpcaoGrupoRow>) {
    onChange(grupos.map((grupo, i) => (i === index ? { ...grupo, ...patch } : grupo)))
  }

  function removeGrupo(index: number) {
    onChange(grupos.filter((_, i) => i !== index))
  }

  function addGrupo() {
    onChange([...grupos, grupoVazio()])
  }

  function updateOpcao(grupoIndex: number, opcaoIndex: number, patch: Partial<OpcaoValorRow>) {
    updateGrupo(grupoIndex, {
      opcoes: grupos[grupoIndex].opcoes.map((opcao, i) => (i === opcaoIndex ? { ...opcao, ...patch } : opcao)),
    })
  }

  function removeOpcao(grupoIndex: number, opcaoIndex: number) {
    updateGrupo(grupoIndex, { opcoes: grupos[grupoIndex].opcoes.filter((_, i) => i !== opcaoIndex) })
  }

  function addOpcao(grupoIndex: number) {
    updateGrupo(grupoIndex, { opcoes: [...grupos[grupoIndex].opcoes, { nome: '', precoAdicional: '' }] })
  }

  return (
    <div>
      {grupos.map((grupo, grupoIndex) => (
        <div key={grupoIndex} className="ap-subcard">
          <div className="ap-group-header">
            <input
              className="ap-input"
              style={{ flex: 1 }}
              value={grupo.nome}
              onChange={event => updateGrupo(grupoIndex, { nome: event.target.value })}
              placeholder="Nome do grupo (ex: Ponto da carne)"
            />
            <button type="button" className="ap-btn ap-btn-danger ap-btn-icon" onClick={() => removeGrupo(grupoIndex)} aria-label="Remover grupo">
              <Trash2 size={14} />
            </button>
          </div>

          <div className="ap-subcard-row pt-2 mb-4">
            <label className="ap-radio-label">
              <input
                type="radio"
                name={`escolha-${grupoIndex}`}
                checked={!grupo.multiplaEscolha}
                onChange={() => updateGrupo(grupoIndex, { multiplaEscolha: false })}
              />
              Escolha única
            </label>
            <label className="ap-radio-label">
              <input
                type="radio"
                name={`escolha-${grupoIndex}`}
                checked={grupo.multiplaEscolha}
                onChange={() => updateGrupo(grupoIndex, { multiplaEscolha: true })}
              />
              Escolha múltipla
            </label>
            <label className="ap-radio-label">
              <input
                type="checkbox"
                checked={grupo.obrigatorio}
                onChange={event => updateGrupo(grupoIndex, { obrigatorio: event.target.checked })}
              />
              Obrigatório
            </label>
          </div>

          {grupo.opcoes.map((opcao, opcaoIndex) => (
            <div key={opcaoIndex} className="ap-opcao-row mb-3">
              <input
                className="ap-input"
                style={{ flex: 1 }}
                value={opcao.nome}
                onChange={event => updateOpcao(grupoIndex, opcaoIndex, { nome: event.target.value })}
                placeholder="Nome da opção (ex: Mal passada)"
              />
              <input
                className="ap-input"
                style={{ width: 130 }}
                value={opcao.precoAdicional}
                onChange={event => updateOpcao(grupoIndex, opcaoIndex, { precoAdicional: event.target.value })}
                placeholder="Preço extra"
                inputMode="decimal"
              />
              <button
                type="button"
                className="ap-btn ap-btn-ghost ap-btn-icon"
                onClick={() => removeOpcao(grupoIndex, opcaoIndex)}
                aria-label="Remover opção"
                disabled={grupo.opcoes.length <= 1}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          <button type="button" className="ap-btn ap-btn-ghost" style={{ marginTop: 8 }} onClick={() => addOpcao(grupoIndex)}>
            <Plus size={13} />
            Adicionar opção
          </button>
        </div>
      ))}

      <button type="button" className="ap-btn ap-btn-ghost mt-8" onClick={addGrupo}>
        <Plus size={14} />
        Adicionar grupo de opção
      </button>
    </div>
  )
}
