import { useState } from 'react'
import Modal from '../../../../components/Modal'

export default function CategoriaInsumoFormModal({
  open,
  saving,
  error,
  onSubmit,
  onClose,
}: {
  open: boolean
  saving: boolean
  error?: string | null
  onSubmit: (nome: string) => void
  onClose: () => void
}) {
  const [nome, setNome] = useState('')

  function handleClose() {
    setNome('')
    onClose()
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const trimmed = nome.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <Modal open={open} title="Nova categoria" description="Categorias organizam os insumos (ex: Refrigerantes, Cerveja)." onClose={handleClose} maxWidth={420}>
      <form onSubmit={handleSubmit} className="ap-form-grid" style={{ gridTemplateColumns: '1fr', marginTop: 0 }}>
        <input
          className="ap-input"
          autoFocus
          value={nome}
          onChange={event => setNome(event.target.value)}
          placeholder="Nome da categoria (ex: Refrigerantes)"
        />

        {error && <p style={{ color: 'var(--ap-red)', fontSize: 13, margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="ap-btn ap-btn-primary" disabled={saving || !nome.trim()}>
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
