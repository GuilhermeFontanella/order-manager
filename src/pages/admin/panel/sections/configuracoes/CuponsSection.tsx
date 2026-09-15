import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Tag, Trash } from "lucide-react";
import ConfirmDialog from "../../../../../components/ConfirmDialog";
import {
  createCupom,
  deleteCupom,
  listCupons,
  updateCupom,
  type Cupom,
  type CupomInput,
  type TipoDescontoCupom,
} from "../../../../../services/cupons";
import { getApiErrorMessage } from "../../../../../services/apiClient";

const TIPO_LABELS: Record<TipoDescontoCupom, string> = {
  PERCENTUAL: "Percentual (%)",
  VALOR_FIXO: "Valor fixo (R$)",
};

function formatDesconto(cupom: Cupom): string {
  const valor = parseFloat(cupom.valor);
  return cupom.tipoDesconto === "PERCENTUAL"
    ? `${valor}% OFF`
    : `R$ ${valor.toFixed(2).replace(".", ",")} OFF`;
}

function formatData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function toDateInputValue(iso: string): string {
  return iso.slice(0, 10);
}

function fromDateInputValue(date: string): string {
  return `${date}T23:59:59.999Z`;
}

const emptyForm: CupomInput = {
  codigo: "",
  tipoDesconto: "PERCENTUAL",
  valor: 10,
  validoAte: "",
  ativo: true,
};

export default function CuponsSection() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCupom, setEditingCupom] = useState<Cupom | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [validadeDate, setValidadeDate] = useState("");
  const [pendingDelete, setPendingDelete] = useState<Cupom | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listCupons()
      .then(setCupons)
      .catch((err) =>
        setError(getApiErrorMessage(err, "Não foi possível carregar os cupons.")),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredCupons = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? cupons.filter((cupom) => cupom.codigo.toLowerCase().includes(term)) : cupons;
  }, [search, cupons]);

  function openCreateModal() {
    setEditingCupom(null);
    setForm(emptyForm);
    setValidadeDate("");
    setError(null);
    setModalOpen(true);
  }

  function openEditModal(cupom: Cupom) {
    setEditingCupom(cupom);
    setForm({
      codigo: cupom.codigo,
      tipoDesconto: cupom.tipoDesconto,
      valor: parseFloat(cupom.valor),
      validoAte: cupom.validoAte,
      ativo: cupom.ativo,
    });
    setValidadeDate(toDateInputValue(cupom.validoAte));
    setError(null);
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload: CupomInput = {
      ...form,
      codigo: form.codigo.trim().toUpperCase(),
      validoAte: fromDateInputValue(validadeDate),
    };
    try {
      if (editingCupom) {
        const updated = await updateCupom(editingCupom.id, payload);
        setCupons((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createCupom(payload);
        setCupons((current) => [created, ...current]);
      }
      setModalOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível salvar o cupom."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCupom(pendingDelete.id);
      setCupons((current) => current.filter((item) => item.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível excluir o cupom."));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  if (loading) return <p className="ap-card-sub">Carregando cupons...</p>;

  return (
    <div>
      <div className="ap-section-intro">
        <div className="text-left">
          <div className="ap-card-title">Cupons de desconto</div>
          <div className="ap-card-sub">
            Crie códigos de desconto que o cliente pode aplicar na revisão do pedido.
          </div>
        </div>
        <button type="button" className="ap-btn ap-btn-primary" onClick={openCreateModal}>
          <Plus size={15} /> Novo cupom
        </button>
      </div>
      {error && <p className="ap-card ap-inline-error">{error}</p>}
      <div className="ap-card text-left">
        <div className="ap-list-toolbar">
          <div className="ap-search" style={{ width: "100%" }}>
            <Search size={15} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código"
            />
          </div>
          <span className="ap-card-sub" style={{ margin: 0, textWrap: "nowrap" }}>
            {cupons.length} cupom{cupons.length === 1 ? "" : "ns"}
          </span>
        </div>
        {filteredCupons.length === 0 ? (
          <p className="ap-card-sub">Nenhum cupom encontrado.</p>
        ) : (
          <div className="ap-user-list">
            {filteredCupons.map((cupom) => (
              <div className="ap-user-row" key={cupom.id}>
                <div className="ap-user-avatar">
                  <Tag size={16} />
                </div>
                <div className="ap-user-main">
                  <strong>{cupom.codigo}</strong>
                  <span>Válido até {formatData(cupom.validoAte)}</span>
                </div>
                <span className="ap-role-badge">{formatDesconto(cupom)}</span>
                <span className={`ap-status ${cupom.ativo ? "is-active" : ""}`} style={{ cursor: "default" }}>
                  {cupom.ativo ? "Ativo" : "Inativo"}
                </span>
                <button
                  type="button"
                  className="ap-btn ap-btn-ghost ap-btn-icon"
                  onClick={() => openEditModal(cupom)}
                  aria-label={`Editar ${cupom.codigo}`}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="ap-btn ap-btn-danger"
                  onClick={() => setPendingDelete(cupom)}
                  aria-label={`Excluir ${cupom.codigo}`}
                >
                  <Trash size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {modalOpen && (
        <div className="ap-modal-backdrop">
          <form className="ap-modal" onSubmit={handleSubmit}>
            <div className="ap-card-title">{editingCupom ? "Editar cupom" : "Novo cupom"}</div>
            {editingCupom && (
              <div className="ap-field" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <span>Cupom ativo</span>
                <label className="ap-switch">
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(event) => setForm({ ...form, ativo: event.target.checked })}
                  />
                  <span className="ap-switch-track" />
                </label>
              </div>
            )}
            <label className="ap-field">
              <span>Código</span>
              <input
                required
                value={form.codigo}
                onChange={(event) => setForm({ ...form, codigo: event.target.value })}
                placeholder="Ex: BEMVINDO10"
                style={{ textTransform: "uppercase" }}
              />
            </label>
            <label className="ap-field">
              <span>Tipo de desconto</span>
              <select
                value={form.tipoDesconto}
                onChange={(event) =>
                  setForm({ ...form, tipoDesconto: event.target.value as TipoDescontoCupom })
                }
              >
                {Object.entries(TIPO_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="ap-field">
              <span>{form.tipoDesconto === "PERCENTUAL" ? "Percentual de desconto" : "Valor do desconto (R$)"}</span>
              <input
                required
                type="number"
                min={0}
                max={form.tipoDesconto === "PERCENTUAL" ? 100 : undefined}
                step="0.01"
                value={form.valor}
                onChange={(event) => setForm({ ...form, valor: Number(event.target.value) })}
              />
            </label>
            <label className="ap-field">
              <span>Válido até</span>
              <input
                required
                type="date"
                value={validadeDate}
                disabled={editingCupom ? !form.ativo : false}
                onChange={(event) => setValidadeDate(event.target.value)}
              />
            </label>
            {error && <p style={{ color: "var(--ap-red)", fontSize: 13, margin: 0 }}>{error}</p>}
            <div className="ap-modal-actions">
              <button type="button" className="ap-btn ap-btn-ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="ap-btn ap-btn-primary" disabled={saving}>
                {saving ? "Salvando..." : editingCupom ? "Salvar" : "Criar cupom"}
              </button>
            </div>
          </form>
        </div>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir cupom?"
        description={
          pendingDelete
            ? `O cupom "${pendingDelete.codigo}" será removido permanentemente. Cupons já usados em pedidos não podem ser excluídos — desative-os em vez disso.`
            : undefined
        }
        confirmLabel={deleting ? "Excluindo..." : "Excluir cupom"}
        destructive
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}
