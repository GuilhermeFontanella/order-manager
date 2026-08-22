export default function SettingsSaveBar({
  onSave,
  saved,
}: {
  onSave: () => void
  saved: boolean
}) {
  return (
    <div className="ap-group-header" style={{ marginTop: 20 }}>
      <span className="ap-card-sub" style={{ margin: 0 }}>
        {saved ? 'Alterações salvas nesta sessão.' : 'Ainda não conectado a um backend real — as alterações ficam só nesta sessão.'}
      </span>
      <button type="button" className="ap-btn ap-btn-primary" onClick={onSave}>
        Salvar alterações
      </button>
    </div>
  )
}
