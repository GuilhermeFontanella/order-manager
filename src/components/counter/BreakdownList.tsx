const CAT_ORDER = ['Pratos principais', 'Entradas', 'Bebidas', 'Cervejas', 'Sobremesas']

export default function BreakdownList({ categorias }: { categorias: Record<string, number> }) {
  return (
    <div className="counter-breakdown-list">
      {CAT_ORDER.map(cat => (
        <div className="counter-breakdown-row" key={cat}>
          <span className="counter-name">{cat}</span>
          <span className="counter-val">{categorias[cat] || 0} un</span>
        </div>
      ))}
    </div>
  )
}
