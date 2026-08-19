import { useState } from 'react'
import Modal from '../../../../components/Modal'
import type { CategoriaInput } from '../../../../services/categorias'

const CAMPOS_VAZIOS: CategoriaInput = { nome: '', descricao: '' }

export default function CategoriaFormModal({
  open,
  saving,
  error,
  onSubmit,
  onClose,
}: {
  open: boolean
  saving: boolean
  error?: string | null
  onSubmit: (payload: CategoriaInput) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<CategoriaInput>(CAMPOS_VAZIOS)

  function handleClose() {
    setForm(CAMPOS_VAZIOS)
    onClose()
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const nome = form.nome.trim()
    if (!nome) return
    onSubmit({ nome, descricao: form.descricao?.trim() || undefined })
  }

  return (
    <Modal open={open} title="Nova categoria" description="Organiza os itens do cardápio (ex: Lanches, Bebidas)." onClose={handleClose} maxWidth={420}>
      <form onSubmit={handleSubmit} className="ap-form-grid" style={{ gridTemplateColumns: '1fr', marginTop: 0 }}>
        <input
          className="ap-input"
          autoFocus
          value={form.nome}
          onChange={event => setForm(prev => ({ ...prev, nome: event.target.value }))}
          placeholder="Nome da categoria (ex: Lanches)"
        />
        <textarea
          className="ap-input"
          style={{ minHeight: 80, resize: 'vertical' }}
          value={form.descricao}
          onChange={event => setForm(prev => ({ ...prev, descricao: event.target.value }))}
          placeholder="Descrição exibida no cardápio (opcional)"
        />

        {error && <p style={{ color: 'var(--ap-red)', fontSize: 13, margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="ap-btn ap-btn-primary" disabled={saving || !form.nome.trim()}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
          <button type="button" className="ap-btn ap-btn-ghost" onClick={handleClose}>
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}
