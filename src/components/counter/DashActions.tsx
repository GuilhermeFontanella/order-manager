type Props = {
  onGerarRelatorio: () => void
  showReabrir: boolean
  onReabrir: () => void
}

export default function DashActions({ onGerarRelatorio, showReabrir, onReabrir }: Props) {
  return (
    <div className="counter-dash-actions">
      <button type="button" className="counter-btn-report" onClick={onGerarRelatorio}>
        🖨️ Gerar relatório (imprimir/PDF)
      </button>
      {showReabrir && (
        <button type="button" className="counter-btn-reopen" onClick={onReabrir}>
          ▶ Reabrir restaurante
        </button>
      )}
    </div>
  )
}
