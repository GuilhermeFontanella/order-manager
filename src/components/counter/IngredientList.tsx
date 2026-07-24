export default function IngredientList({ ingredientes }: { ingredientes: { nome: string; qtd: number; unidade: string }[] }) {
  if (ingredientes.length === 0) {
    return (
      <div className="counter-ingredient-list">
        <div className="counter-ingredient-row">
          <span className="counter-name">Nenhum consumo registrado ainda hoje.</span>
        </div>
      </div>
    )
  }

  const maxQtd = Math.max(...ingredientes.map(i => i.qtd), 1)

  return (
    <div className="counter-ingredient-list">
      {ingredientes.map(ing => (
        <div className="counter-ingredient-row" key={ing.nome}>
          <span className="counter-name">{ing.nome}</span>
          <div className="counter-ingredient-bar-bg">
            <div className="counter-ingredient-bar-fill" style={{ width: `${(ing.qtd / maxQtd) * 100}%` }} />
          </div>
          <span className="counter-val">{ing.qtd.toFixed(1)} {ing.unidade}</span>
        </div>
      ))}
    </div>
  )
}
