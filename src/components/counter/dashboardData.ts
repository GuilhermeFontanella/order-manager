import type { DashboardData } from './types'

export const CATEGORIA_MAP: Record<string, string> = {
  'X-Burger do Zé': 'Pratos principais',
  'Filé à parmegiana': 'Pratos principais',
  'Picanha na chapa': 'Pratos principais',
  'Bolinho de bacalhau': 'Entradas',
  'Isca de peixe crocante': 'Entradas',
  'Limonada suíça': 'Bebidas',
  'Chopp artesanal': 'Cervejas',
  'Pudim de leite': 'Sobremesas',
}

export const PRODUTO_INSUMOS: Record<string, { insumo: string; qtd: number; unidade: string }[]> = {
  'X-Burger do Zé': [
    { insumo: 'Pão brioche', qtd: 1, unidade: 'un' },
    { insumo: 'Carne bovina', qtd: 180, unidade: 'g' },
    { insumo: 'Queijo', qtd: 30, unidade: 'g' },
  ],
  'Filé à parmegiana': [
    { insumo: 'Filé de frango', qtd: 200, unidade: 'g' },
    { insumo: 'Molho de tomate', qtd: 100, unidade: 'g' },
    { insumo: 'Muçarela', qtd: 50, unidade: 'g' },
  ],
  'Picanha na chapa': [
    { insumo: 'Picanha', qtd: 300, unidade: 'g' },
    { insumo: 'Farofa', qtd: 80, unidade: 'g' },
  ],
  'Bolinho de bacalhau': [{ insumo: 'Bacalhau', qtd: 120, unidade: 'g' }],
  'Isca de peixe crocante': [{ insumo: 'Filé de tilápia', qtd: 150, unidade: 'g' }],
  'Limonada suíça': [{ insumo: 'Limão', qtd: 3, unidade: 'un' }],
  'Chopp artesanal': [{ insumo: 'Chopp (barril)', qtd: 400, unidade: 'ml' }],
  'Pudim de leite': [{ insumo: 'Leite condensado', qtd: 80, unidade: 'ml' }],
}

export const HISTORICO_DIAS: DashboardData[] = [
  {
    dateLabel: 'Ontem',
    faturado: 184300,
    pedidos: 52,
    categorias: { 'Pratos principais': 34, Entradas: 18, Bebidas: 22, Cervejas: 29, Sobremesas: 11 },
    ingredientes: [
      { nome: 'Carne bovina', qtd: 6.1, unidade: 'kg' },
      { nome: 'Picanha', qtd: 5.4, unidade: 'kg' },
      { nome: 'Chopp (barril)', qtd: 11.6, unidade: 'L' },
      { nome: 'Pão brioche', qtd: 34, unidade: 'un' },
      { nome: 'Filé de frango', qtd: 4.2, unidade: 'kg' },
    ],
  },
  {
    dateLabel: 'Terça-feira, 01/07',
    faturado: 151200,
    pedidos: 44,
    categorias: { 'Pratos principais': 28, Entradas: 14, Bebidas: 19, Cervejas: 21, Sobremesas: 9 },
    ingredientes: [
      { nome: 'Carne bovina', qtd: 5.0, unidade: 'kg' },
      { nome: 'Picanha', qtd: 3.9, unidade: 'kg' },
      { nome: 'Chopp (barril)', qtd: 8.4, unidade: 'L' },
      { nome: 'Pão brioche', qtd: 27, unidade: 'un' },
      { nome: 'Filé de frango', qtd: 3.1, unidade: 'kg' },
    ],
  },
  {
    dateLabel: 'Segunda-feira, 30/06',
    faturado: 98700,
    pedidos: 29,
    categorias: { 'Pratos principais': 18, Entradas: 9, Bebidas: 13, Cervejas: 12, Sobremesas: 6 },
    ingredientes: [
      { nome: 'Carne bovina', qtd: 3.2, unidade: 'kg' },
      { nome: 'Picanha', qtd: 2.1, unidade: 'kg' },
      { nome: 'Chopp (barril)', qtd: 4.8, unidade: 'L' },
      { nome: 'Pão brioche', qtd: 17, unidade: 'un' },
      { nome: 'Filé de frango', qtd: 1.8, unidade: 'kg' },
    ],
  },
  {
    dateLabel: 'Domingo, 29/06',
    faturado: 221900,
    pedidos: 61,
    categorias: { 'Pratos principais': 41, Entradas: 22, Bebidas: 27, Cervejas: 35, Sobremesas: 15 },
    ingredientes: [
      { nome: 'Carne bovina', qtd: 7.4, unidade: 'kg' },
      { nome: 'Picanha', qtd: 6.6, unidade: 'kg' },
      { nome: 'Chopp (barril)', qtd: 14.0, unidade: 'L' },
      { nome: 'Pão brioche', qtd: 40, unidade: 'un' },
      { nome: 'Filé de frango', qtd: 5.0, unidade: 'kg' },
    ],
  },
]
