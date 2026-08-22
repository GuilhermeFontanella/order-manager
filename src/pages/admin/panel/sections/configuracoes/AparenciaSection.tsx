import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import SettingsSaveBar from '../../components/SettingsSaveBar'
import { useSavedFlag } from '../../hooks/useSavedFlag'

type TamanhoFonte = 'pequena' | 'media' | 'grande'

const TAMANHO_PX: Record<TamanhoFonte, number> = {
  pequena: 12.5,
  media: 14,
  grande: 15.5,
}

export default function AparenciaSection() {
  const { saved, trigger } = useSavedFlag()
  const logoInputRef = useRef<HTMLInputElement>(null)
  const fotoInputRef = useRef<HTMLInputElement>(null)

  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [fotos, setFotos] = useState<string[]>([])
  const [corBotao, setCorBotao] = useState('#2F5D46')
  const [corFonte, setCorFonte] = useState('#201E1A')
  const [tamanhoFonte, setTamanhoFonte] = useState<TamanhoFonte>('media')
  const [mostrarDescricao, setMostrarDescricao] = useState(true)
  const [mostrarFotos, setMostrarFotos] = useState(true)
  const [mostrarIngredientes, setMostrarIngredientes] = useState(false)
  const [mostrarPreco, setMostrarPreco] = useState(true)

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setLogoUrl(URL.createObjectURL(file))
  }

  function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setFotos(prev => [...prev, URL.createObjectURL(file)])
  }

  function removeFoto(index: number) {
    setFotos(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="ap-settings-stack" style={{ maxWidth: 'none', marginBottom: '16px' }}>
        <div className="flex gap-4">
          <div className="ap-card flex-1 text-left">
            <div className="ap-card-title">Identidade visual</div>
            <div className="ap-card-sub">Logo/arte exibida no topo do cardápio e fotos do ambiente do restaurante.</div>

            <div className="flex justify-between align-center">
              <div className="ap-field text-left">
                <span className="ap-field-label">Arte do cardápio</span>
                <div className="ap-photo-grid">
                  {logoUrl ? (
                    <div className="ap-photo-thumb">
                      <img src={logoUrl} alt="Arte do cardápio" />
                      <button type="button" className="ap-photo-remove" onClick={() => setLogoUrl(null)} aria-label="Remover arte">
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="ap-photo-add" onClick={() => logoInputRef.current?.click()} aria-label="Adicionar arte">
                      <ImagePlus size={18} />
                    </button>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} style={{ display: 'none' }} />
                </div>
              </div>

              <div className="ap-field text-left">
                <span className="ap-field-label">Fotos do restaurante</span>
                <div className="ap-photo-grid">
                  {fotos.map((foto, index) => (
                    <div key={foto} className="ap-photo-thumb">
                      <img src={foto} alt="" />
                      <button type="button" className="ap-photo-remove" onClick={() => removeFoto(index)} aria-label="Remover foto">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="ap-photo-add" onClick={() => fotoInputRef.current?.click()} aria-label="Adicionar foto">
                    <ImagePlus size={18} />
                  </button>
                  <input ref={fotoInputRef} type="file" accept="image/*" onChange={handleFotoChange} style={{ display: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="ap-card flex-1 text-left">
            <div className="ap-card-title">Cores e tipografia</div>
            <div className="ap-card-sub">Personaliza a aparência do cardápio digital de acordo com a identidade do estabelecimento.</div>
            <div className="flex justify-between align-center">
              <div className="ap-color-row">
                <input type="color" className="ap-color-swatch" value={corBotao} onChange={event => setCorBotao(event.target.value)} />
                <div>
                  <div className="ap-toggle-label">Cor dos botões</div>
                  <div className="ap-color-value">{corBotao}</div>
                </div>
              </div>

              <div className="ap-color-row">
                <input type="color" className="ap-color-swatch" value={corFonte} onChange={event => setCorFonte(event.target.value)} />
                <div>
                  <div className="ap-toggle-label">Cor da fonte</div>
                  <div className="ap-color-value">{corFonte}</div>
                </div>
              </div>
            </div>

            <div className="ap-field">
              <label className="ap-field-label" htmlFor="tamanho-fonte">Tamanho da fonte</label>
              <select
                id="tamanho-fonte"
                className="ap-select"
                value={tamanhoFonte}
                onChange={event => setTamanhoFonte(event.target.value as TamanhoFonte)}
              >
                <option value="pequena">Pequena</option>
                <option value="media">Média</option>
                <option value="grande">Grande</option>
              </select>
            </div>
          </div>

          

        </div>
      </div>

      <div className="flex gap-4">
        <div className="ap-card text-left flex-1">
            <div className="ap-card-title">Exibição de informações no cardápio</div>
            <div className="ap-card-sub">Escolha o que aparece nos itens do cardápio visto pelo cliente.</div>

            <div className="ap-toggle-row">
              <div className="ap-toggle-info">
                <span className="ap-toggle-label">Mostrar descrição dos itens</span>
              </div>
              <label className="ap-switch">
                <input type="checkbox" checked={mostrarDescricao} onChange={event => setMostrarDescricao(event.target.checked)} />
                <span className="ap-switch-track" />
              </label>
            </div>
            <div className="ap-toggle-row">
              <div className="ap-toggle-info">
                <span className="ap-toggle-label">Mostrar fotos dos itens</span>
              </div>
              <label className="ap-switch">
                <input type="checkbox" checked={mostrarFotos} onChange={event => setMostrarFotos(event.target.checked)} />
                <span className="ap-switch-track" />
              </label>
            </div>
            <div className="ap-toggle-row">
              <div className="ap-toggle-info">
                <span className="ap-toggle-label">Mostrar ingredientes</span>
              </div>
              <label className="ap-switch">
                <input type="checkbox" checked={mostrarIngredientes} onChange={event => setMostrarIngredientes(event.target.checked)} />
                <span className="ap-switch-track" />
              </label>
            </div>
            <div className="ap-toggle-row">
              <div className="ap-toggle-info">
                <span className="ap-toggle-label">Mostrar preço</span>
              </div>
              <label className="ap-switch">
                <input type="checkbox" checked={mostrarPreco} onChange={event => setMostrarPreco(event.target.checked)} />
                <span className="ap-switch-track" />
              </label>
            </div>
          </div>
          <div className="ap-preview-card text-left flex-3">
            <div className="ap-card">
              <div className="ap-card-title">Pré-visualização</div>
              <div className="ap-card-sub">Como um item do cardápio fica com essas configurações.</div>

              <div className="ap-preview-frame">
                <div className="ap-preview-item" style={{ color: corFonte, fontSize: TAMANHO_PX[tamanhoFonte] }}>
                  {mostrarFotos && (
                    <img
                      className="ap-preview-photo"
                      src={fotos[0] ?? 'https://picsum.photos/seed/preview-item/200/200'}
                      alt=""
                    />
                  )}
                  <div className="ap-preview-info">
                    <div className="ap-preview-name">Bolinho de queijo</div>
                    {mostrarDescricao && <div className="ap-preview-desc">Crocante por fora, cremoso por dentro</div>}
                    {mostrarIngredientes && <div className="ap-preview-meta">Queijo, farinha, temperos</div>}
                    {mostrarPreco && <div className="ap-preview-meta" style={{ fontWeight: 700 }}>R$ 12,00</div>}
                  </div>
                  <button type="button" className="ap-preview-btn" style={{ background: corBotao, color: '#fff' }}>
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
            <SettingsSaveBar onSave={trigger} saved={saved} />
          </div>
      </div>
    </div>
  )
}
