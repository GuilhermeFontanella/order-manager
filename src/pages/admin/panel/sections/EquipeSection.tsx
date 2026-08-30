import { useEffect, useMemo, useState } from "react";
import { Copy, KeyRound, Plus, Search, Users, Trash } from "lucide-react";
import ConfirmDialog from "../../../../components/ConfirmDialog";
import {
  createUsuario,
  deleteUsuario,
  listUsuarios,
  updateUsuario,
  type CriarUsuarioInput,
  type PapelUsuario,
  type Usuario,
} from "../../../../services/usuarios";
import { getApiErrorMessage } from "../../../../services/apiClient";

const PAPEL_LABELS: Record<PapelUsuario, string> = {
  MANAGER: "Gerente",
  HEAD_CHEF: "Chef líder",
  COUNTER: "Balcão",
  KITCHEN: "Cozinha",
};
const emptyForm: CriarUsuarioInput = { nome: "", email: "", papel: "COUNTER" };

export default function EquipeSection() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Usuario | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listUsuarios()
      .then(setUsuarios)
      .catch((err) =>
        setError(
          getApiErrorMessage(err, "Não foi possível carregar a equipe."),
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term
      ? usuarios.filter((usuario) =>
          `${usuario.nome} ${usuario.email}`.toLowerCase().includes(term),
        )
      : usuarios;
  }, [search, usuarios]);

  function openModal() {
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await createUsuario({
        ...form,
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
      });
      setUsuarios((current) =>
        [...current, created].sort((a, b) => a.nome.localeCompare(b.nome)),
      );
      setTemporaryPassword(created.senhaTemporaria);
      setModalOpen(false);
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível criar o usuário."));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(usuario: Usuario) {
    try {
      const updated = await updateUsuario(usuario.id, {
        ativo: !usuario.ativo,
      });
      setUsuarios((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Não foi possível atualizar o usuário."),
      );
    }
  }

  async function handleDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setError(null);
    try {
      await deleteUsuario(pendingDelete.id);
      setUsuarios((current) =>
        current.filter((item) => item.id !== pendingDelete.id),
      );
      setPendingDelete(null);
    } catch (err) {
      setError(getApiErrorMessage(err, "Não foi possível excluir o usuário."));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  async function copyTemporaryPassword() {
    if (temporaryPassword)
      await navigator.clipboard.writeText(temporaryPassword);
  }

  if (loading) return <p className="ap-card-sub">Carregando equipe...</p>;

  return (
    <div>
      <div className="ap-section-intro">
        <div className="text-left">
          <div className="ap-card-title">Pessoas com acesso ao sistema</div>
          <div className="ap-card-sub">
            Crie usuários sem compartilhar sua própria conta e defina o que cada
            pessoa pode acessar.
          </div>
        </div>
        <button
          type="button"
          className="ap-btn ap-btn-primary"
          onClick={openModal}
        >
          <Plus size={15} /> Novo usuário
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
              placeholder="Buscar por nome ou e-mail"
            />
          </div>
          <span
            className="ap-card-sub"
            style={{ margin: 0, textWrap: "nowrap" }}
          >
            {usuarios.length} usuário{usuarios.length === 1 ? "" : "s"}
          </span>
        </div>
        {filteredUsers.length === 0 ? (
          <p className="ap-card-sub">Nenhum usuário encontrado.</p>
        ) : (
          <div className="ap-user-list">
            {filteredUsers.map((usuario) => (
              <div className="ap-user-row" key={usuario.id}>
                <div className="ap-user-avatar">
                  <Users size={16} />
                </div>
                <div className="ap-user-main">
                  <strong>{usuario.nome}</strong>
                  <span>{usuario.email}</span>
                </div>
                <span className="ap-role-badge">
                  {PAPEL_LABELS[usuario.papel]}
                </span>
                {usuario.mustChangePassword && (
                  <span className="ap-first-access">
                    <KeyRound size={13} /> Primeiro acesso
                  </span>
                )}
                <button
                  type="button"
                  className={`ap-status ${usuario.ativo ? "is-active" : ""}`}
                  onClick={() => toggleStatus(usuario)}
                >
                  {usuario.ativo ? "Ativo" : "Inativo"}
                </button>
                <button
                  type="button"
                  className="ap-btn ap-btn-danger"
                  onClick={() => setPendingDelete(usuario)}
                  aria-label={`Excluir ${usuario.nome}`}
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
          <form className="ap-modal" onSubmit={handleCreate}>
            <div className="ap-card-title">Novo usuário</div>
            <div className="ap-card-sub">
              Uma senha temporária será gerada automaticamente e deverá ser
              trocada no primeiro acesso.
            </div>
            <label className="ap-field">
              <span>Nome completo</span>
              <input
                required
                value={form.nome}
                onChange={(event) =>
                  setForm({ ...form, nome: event.target.value })
                }
              />
            </label>
            <label className="ap-field">
              <span>E-mail</span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({ ...form, email: event.target.value })
                }
              />
            </label>
            <label className="ap-field">
              <span>Permissão</span>
              <select
                value={form.papel}
                onChange={(event) =>
                  setForm({
                    ...form,
                    papel: event.target.value as PapelUsuario,
                  })
                }
              >
                {Object.entries(PAPEL_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div className="ap-modal-actions">
              <button
                type="button"
                className="ap-btn ap-btn-ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="ap-btn ap-btn-primary"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Criar usuário"}
              </button>
            </div>
          </form>
        </div>
      )}
      {temporaryPassword && (
        <div className="ap-modal-backdrop">
          <div className="ap-modal ap-credential-modal">
            <div className="ap-credential-icon">
              <KeyRound size={20} />
            </div>
            <div className="ap-card-title">Usuário criado</div>
            <div className="ap-card-sub">
              Envie esta senha ao usuário por um canal seguro. Ela não será
              exibida novamente.
            </div>
            <div className="ap-temporary-password">{temporaryPassword}</div>
            <button
              type="button"
              className="ap-btn ap-btn-primary"
              onClick={copyTemporaryPassword}
            >
              <Copy size={15} /> Copiar senha
            </button>
            <button
              type="button"
              className="ap-btn ap-btn-ghost"
              onClick={() => setTemporaryPassword(null)}
            >
              Concluir
            </button>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir usuário?"
        description={pendingDelete ? `O acesso de ${pendingDelete.nome} será removido permanentemente. Essa ação não pode ser desfeita.` : undefined}
        confirmLabel={deleting ? "Excluindo..." : "Excluir usuário"}
        destructive
        onConfirm={handleDelete}
        onCancel={() => { if (!deleting) setPendingDelete(null) }}
      />
    </div>
  );
}
