import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Item } from '../data/menu'
import { fmt } from '../data/menu'

type Props = {
  item: Item
  onAdd?: (item: Item) => void
}

export default function ProductCard({ item, onAdd }: Props) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.99 }}
      className={`bg-white rounded-xl p-3 flex gap-3 items-start shadow-sm ${item.disponivel ? '' : 'opacity-70'}`}
    >
      <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xl" aria-hidden>
        {item.emoji ?? '🍽️'}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex sm:flex-col md:flex-col gap-3 lg:flex-row sm:items-start justify-between">
          <div className="w-30">
            <h3 className="font-semibold text-sm leading-tight text-left whitespace-normal wrap-break-word text-slate-950">{item.nome}</h3>
            {item.desc && <p className="text-xs text-slate-500 mt-1 text-left whitespace-normal wrap-break-word">{item.desc}</p>}
          </div>

          <div className="flex items-center gap-3 sm:justify-end">
            <div className="font-mono font-semibold text-sm text-emerald-700">{fmt(item.preco)}</div>
                <button
                onClick={() => onAdd?.(item)}
                className="h-8 flex justify-center items-center w-8 rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-200/60 transition hover:bg-emerald-800"
                aria-label="Adicionar item"
                >
                <Plus className="h-5 w-5" />
                </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
