export type Item = {
  id: string
  nome: string
  desc?: string
  preco: number // centavos
  emoji?: string
  disponivel?: boolean
  grupos?: any[]
}

export type Category = {
  id: string
  nome: string
  itens: Item[]
}

export const MENU: Category[] = [
  {
    id: 'entradas',
    nome: 'Entradas',
    itens: [
      { id: 'e1', nome: 'Bolinho de queijo', desc: 'Croccante por fora, cremoso por dentro', preco: 1200, emoji: '🧀', disponivel: true, grupos: [] },
      { id: 'e2', nome: 'Isca de peixe crocante', desc: 'Filé empanado com molho tártaro', preco: 3200, emoji: '🐟', disponivel: true, grupos: [] },
    ]
  },
  {
    id: 'pratos',
    nome: 'Pratos Principais',
    itens: [
      { id: 'p1', nome: 'Bife acebolado', desc: 'Acompanhado de arroz e fritas', preco: 4200, emoji: '🥩', disponivel: true, grupos: [] },
      { id: 'p2', nome: 'Risoto de cogumelos', desc: 'Risoto cremoso com mix de cogumelos', preco: 3800, emoji: '🍄', disponivel: true, grupos: [] },
    ]
  },
  {
    id: 'bebidas',
    nome: 'Bebidas',
    itens: [
      { id: 'b1', nome: 'Cerveja long neck', desc: '600ml gelada', preco: 900, emoji: '🍺', disponivel: true, grupos: [] },
      { id: 'b2', nome: 'Suco natural', desc: 'Laranja espremida na hora', preco: 800, emoji: '🧃', disponivel: true, grupos: [] },
    ]
  },
  {
    id: 'sobremesas',
    nome: 'Sobremesas',
    itens: [
      { id: 's1', nome: 'Pudim de leite', desc: 'Fatia generosa, calda de caramelo', preco: 1500, emoji: '🍮', disponivel: true, grupos: [] },
    ]
  }
]

export function fmt(centavos: number) {
  return 'R$ ' + (centavos / 100).toFixed(2).replace('.', ',')
}
