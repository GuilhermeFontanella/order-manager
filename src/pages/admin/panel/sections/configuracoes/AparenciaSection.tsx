import { useEffect, useRef, useState } from "react";
import { ImagePlus, RotateCcw, X } from "lucide-react";
import SettingsSaveBar from "../../components/SettingsSaveBar";
import { useSavedFlag } from "../../hooks/useSavedFlag";
import {
  getApiErrorMessage,
  resolveMediaUrl,
} from "../../../../../services/apiClient";
import {
  getConfiguracaoRestauranteAdmin,
  updateConfiguracaoRestaurante,
  uploadImagemRestaurante,
} from "../../../../../services/configuracaoRestaurante";

// Cores padrão do tema ember (mesmos valores usados como fallback no cardápio
// do cliente quando o tenant não tem apparence.corBotaoPrimario configurada —
// ver "--tenant-primary" em OrderMenu.tsx).
const CORES_PADRAO_EMBER = {
  corBotaoPrimario: "#F5811F",
  corBotaoSecundario: "#C79A56",
  corTextoPrimario: "#201E1A",
  corTextoSecundario: "#79735F",
};

export default function AparenciaSection() {
  const { saved, trigger } = useSavedFlag();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const [arteCardapioUrl, setArteCardapioUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [corBotaoPrimario, setCorBotaoPrimario] = useState(
    CORES_PADRAO_EMBER.corBotaoPrimario,
  );
  const [corBotaoSecundario, setCorBotaoSecundario] = useState(
    CORES_PADRAO_EMBER.corBotaoSecundario,
  );
  const [corTextoPrimario, setCorTextoPrimario] = useState(
    CORES_PADRAO_EMBER.corTextoPrimario,
  );
  const [corTextoSecundario, setCorTextoSecundario] = useState(
    CORES_PADRAO_EMBER.corTextoSecundario,
  );
  const [mostrarDescricao, setMostrarDescricao] = useState(true);
  const [mostrarFotos, setMostrarFotos] = useState(true);
  const [mostrarIngredientes, setMostrarIngredientes] = useState(false);
  const [mostrarPreco, setMostrarPreco] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getConfiguracaoRestauranteAdmin()
      .then((config) => {
        setArteCardapioUrl(config.arteCardapioUrl);
        setLogoUrl(config.logoUrl);
        setCorBotaoPrimario(config.corBotaoPrimario);
        setCorBotaoSecundario(config.corBotaoSecundario);
        setCorTextoPrimario(config.corTextoPrimario);
        setCorTextoSecundario(config.corTextoSecundario);
        setMostrarDescricao(config.mostrarDescricao);
        setMostrarFotos(config.mostrarFotos);
        setMostrarIngredientes(config.mostrarIngredientes);
        setMostrarPreco(config.mostrarPreco);
      })
      .catch((err) =>
        setError(
          getApiErrorMessage(err, "Não foi possível carregar a aparência."),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  async function saveAppearance() {
    try {
      await updateConfiguracaoRestaurante({
        arteCardapioUrl,
        logoUrl,
        corBotaoPrimario,
        corBotaoSecundario,
        corTextoPrimario,
        corTextoSecundario,
        mostrarDescricao,
        mostrarFotos,
        mostrarIngredientes,
        mostrarPreco,
      });
      trigger();
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível salvar a aparência."));
    }
  }

  function resetCoresParaPadrao() {
    setCorBotaoPrimario(CORES_PADRAO_EMBER.corBotaoPrimario);
    setCorBotaoSecundario(CORES_PADRAO_EMBER.corBotaoSecundario);
    setCorTextoPrimario(CORES_PADRAO_EMBER.corTextoPrimario);
    setCorTextoSecundario(CORES_PADRAO_EMBER.corTextoSecundario);
  }

  if (loading) return <p className="ap-card-sub">Carregando aparência...</p>;

  function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    uploadImagemRestaurante(file)
      .then(setArteCardapioUrl)
      .catch((err) =>
        setError(getApiErrorMessage(err, "Não foi possível enviar a arte.")),
      )
      .finally(() => setUploading(false));
  }

  function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    uploadImagemRestaurante(file)
      .then(setLogoUrl)
      .catch((err) =>
        setError(getApiErrorMessage(err, "Não foi possível enviar o logo.")),
      )
      .finally(() => setUploading(false));
  }

  return (
    <div>
      {error && <p className="ap-card ap-inline-error">{error}</p>}
      <div
        className="ap-settings-stack"
        style={{ maxWidth: "none", marginBottom: "16px" }}
      >
        <div className="flex flex-col gap-4 min-[860px]:flex-row">
          <div className="ap-card flex-1 text-left">
            <div className="ap-card-title">Identidade visual</div>
            <div className="ap-card-sub">
              Logo/arte exibida no topo do cardápio e fotos do ambiente do
              restaurante.
            </div>

            <div className="flex justify-between align-center">
              <div className="ap-field text-left">
                <span className="ap-field-label">Arte do cardápio</span>
                <div className="ap-photo-grid">
                  {arteCardapioUrl ? (
                    <div className="ap-photo-thumb">
                      <img
                        src={resolveMediaUrl(arteCardapioUrl)}
                        alt="Arte do cardápio"
                      />
                      <button
                        type="button"
                        className="ap-photo-remove"
                        onClick={() => setArteCardapioUrl(null)}
                        aria-label="Remover arte"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="ap-photo-add"
                      onClick={() => logoInputRef.current?.click()}
                      aria-label="Adicionar arte"
                    >
                      <ImagePlus size={18} />
                    </button>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div className="ap-field text-left">
                <span className="ap-field-label">Logo</span>
                <div className="ap-photo-grid">
                  {logoUrl ? (
                    <div className="ap-photo-thumb">
                      <img src={resolveMediaUrl(logoUrl)} alt="Logo" />
                      <button
                        type="button"
                        className="ap-photo-remove"
                        onClick={() => setLogoUrl(null)}
                        aria-label="Remover logo"
                      >
                        <X size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="ap-photo-add"
                      onClick={() => fotoInputRef.current?.click()}
                      aria-label="Adicionar logo"
                    >
                      <ImagePlus size={18} />
                    </button>
                  )}
                  <input
                    ref={fotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    disabled={uploading}
                    style={{ display: "none" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="ap-card flex-1 text-left">
            <div className="flex justify-between align-center">
              <div className="ap-card-title">Cores e tipografia</div>
              <button
                type="button"
                className="ap-btn ap-btn-ghost"
                onClick={resetCoresParaPadrao}
                title="Restaurar as cores padrão do tema ember"
              >
                <RotateCcw size={14} />
                Restaurar padrão
              </button>
            </div>
            <div className="ap-card-sub">
              Personaliza a aparência do cardápio digital de acordo com a
              identidade do estabelecimento.
            </div>
            <div className="flex justify-between align-center">
              <div className="ap-color-row">
                <input
                  type="color"
                  className="ap-color-swatch"
                  value={corBotaoPrimario}
                  onChange={(event) => setCorBotaoPrimario(event.target.value)}
                />
                <div>
                  <div className="ap-toggle-label">
                    Cor dos botões primários
                  </div>
                  <div className="ap-color-value">{corBotaoPrimario}</div>
                </div>
              </div>

              <div className="ap-color-row">
                <input
                  type="color"
                  className="ap-color-swatch"
                  value={corBotaoSecundario}
                  onChange={(event) =>
                    setCorBotaoSecundario(event.target.value)
                  }
                />
                <div>
                  <div className="ap-toggle-label">
                    Cor dos botões secundários
                  </div>
                  <div className="ap-color-value">{corBotaoSecundario}</div>
                </div>
              </div>
            </div>

            <div className="flex justify-between align-center">
              <div className="ap-color-row">
                <input
                  type="color"
                  className="ap-color-swatch"
                  value={corTextoPrimario}
                  onChange={(event) => setCorTextoPrimario(event.target.value)}
                />
                <div>
                  <div className="ap-toggle-label">Cor do texto primário</div>
                  <div className="ap-color-value">{corTextoPrimario}</div>
                </div>
              </div>
              <div className="ap-color-row">
                <input
                  type="color"
                  className="ap-color-swatch"
                  value={corTextoSecundario}
                  onChange={(event) =>
                    setCorTextoSecundario(event.target.value)
                  }
                />
                <div>
                  <div className="ap-toggle-label">Cor do texto secundário</div>
                  <div className="ap-color-value">{corTextoSecundario}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 min-[860px]:flex-row">
        <div className="ap-card text-left flex-1">
          <div className="ap-card-title">
            Exibição de informações no cardápio
          </div>
          <div className="ap-card-sub">
            Escolha o que aparece nos itens do cardápio visto pelo cliente.
          </div>

          <div className="ap-toggle-row">
            <div className="ap-toggle-info">
              <span className="ap-toggle-label">
                Mostrar descrição dos itens
              </span>
            </div>
            <label className="ap-switch">
              <input
                type="checkbox"
                checked={mostrarDescricao}
                onChange={(event) => setMostrarDescricao(event.target.checked)}
              />
              <span className="ap-switch-track" />
            </label>
          </div>
          <div className="ap-toggle-row">
            <div className="ap-toggle-info">
              <span className="ap-toggle-label">Mostrar fotos dos itens</span>
            </div>
            <label className="ap-switch">
              <input
                type="checkbox"
                checked={mostrarFotos}
                onChange={(event) => setMostrarFotos(event.target.checked)}
              />
              <span className="ap-switch-track" />
            </label>
          </div>
          <div className="ap-toggle-row">
            <div className="ap-toggle-info">
              <span className="ap-toggle-label">Mostrar ingredientes</span>
            </div>
            <label className="ap-switch">
              <input
                type="checkbox"
                checked={mostrarIngredientes}
                onChange={(event) =>
                  setMostrarIngredientes(event.target.checked)
                }
              />
              <span className="ap-switch-track" />
            </label>
          </div>
          <div className="ap-toggle-row">
            <div className="ap-toggle-info">
              <span className="ap-toggle-label">Mostrar preço</span>
            </div>
            <label className="ap-switch">
              <input
                type="checkbox"
                checked={mostrarPreco}
                onChange={(event) => setMostrarPreco(event.target.checked)}
              />
              <span className="ap-switch-track" />
            </label>
          </div>
        </div>
        <div className="ap-preview-card text-left flex-3">
          <div className="ap-card">
            <div className="ap-card-title">Pré-visualização</div>
            <div className="ap-card-sub">
              Como um item do cardápio fica com essas configurações.
            </div>

            <div className="ap-preview-frame">
              <div
                className="ap-preview-item"
                style={{ color: corTextoPrimario }}
              >
                {mostrarFotos && (
                  <img
                    className="ap-preview-photo"
                    src="https://picsum.photos/seed/preview-item/200/200"
                    alt=""
                  />
                )}
                <div className="ap-preview-info">
                  <div className="ap-preview-name">Bolinho de queijo</div>
                  {mostrarDescricao && (
                    <div
                      className="ap-preview-desc"
                      style={{ color: corTextoSecundario }}
                    >
                      Crocante por fora, cremoso por dentro
                    </div>
                  )}
                  {mostrarIngredientes && (
                    <div className="ap-preview-meta">
                      Queijo, farinha, temperos
                    </div>
                  )}
                  {mostrarPreco && (
                    <div
                      className="ap-preview-meta"
                      style={{ fontWeight: 700 }}
                    >
                      R$ 12,00
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="ap-preview-btn"
                  style={{ background: corBotaoPrimario, color: "#fff" }}
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
          <SettingsSaveBar onSave={saveAppearance} saved={saved} />
        </div>
      </div>
    </div>
  );
}
