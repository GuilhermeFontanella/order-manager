import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { Item } from '../data/menu'

type Props = {
  item: Item | null
  open: boolean
  onClose: () => void
  onAdd: (item: Item, qty?: number, obs?: string) => void
}

const defaultOpcao = {
  nome: 'Ponto da carne',
  obrigatorio: true,
  opcoes: ['Mal passada', 'Ao ponto', 'Bem passada'],
}

export default function ItemSheet({ item, open, onClose, onAdd }: Props) {
  const [qty, setQty] = useState(1)
  const [obs, setObs] = useState('')
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const optionGroup = useMemo(() => {
    if (!item) return null
    if (item.grupos && item.grupos.length > 0) {
      return item.grupos[0]
    }
    if (item.id.startsWith('p')) {
      return defaultOpcao
    }
    return null
  }, [item])

  if (!open || !item) return null;

  const isOptionRequired = optionGroup?.obrigatorio === true
  const canAdd = !isOptionRequired || Boolean(selectedOption)

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-2xl bg-white rounded-t-[28px] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.12)] min-h-[470px] max-h-[calc(100vh-40px)] overflow-y-auto"
      >
        <div className="flex justify-center mb-4">
          <div className="h-1.5 w-16 rounded-full bg-slate-200" />
        </div>

        <div className="flex flex-col gap-3 rounded-[32px] bg-slate-50 p-4 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="w-16 h-16 rounded-[28px] bg-white border border-slate-200 flex items-center justify-center text-3xl">
              {item.emoji ?? '🍽️'}
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg text-slate-900">{item.nome}</h3>
              {item.desc && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.desc}</p>}
            </div>
            <div className="font-mono font-semibold text-green-700 text-right">R$ {(item.preco / 100).toFixed(2).replace('.', ',')}</div>
          </div>
        </div>

        {optionGroup ? (
          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3 text-left">
              <div>
                <p className="text-sm font-semibold text-slate-900">{optionGroup.nome}</p>
                <p className="text-xs text-slate-500 mt-1">Selecione uma opção para continuar.</p>
              </div>
              {optionGroup.obrigatorio && (
                <span className="rounded-full bg-rose-100 text-rose-700 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.14em]">
                  Obrigatório
                </span>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {optionGroup.opcoes.map((option: string) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 rounded-[25px] border p-3 text-sm transition ${
                    selectedOption === option
                      ? 'border-green-600 bg-green-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="item-option"
                    value={option}
                    checked={selectedOption === option}
                    onChange={() => setSelectedOption(option)}
                    className="h-4 w-4 accent-green-600"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <label className="block text-sm font-semibold text-slate-900">Observação</label>
          <textarea
            value={obs}
            onChange={event => setObs(event.target.value)}
            placeholder="Ex: sem cebola, ponto da carne..."
            className="mt-3 min-h-[120px] w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-400 focus:bg-white"
          />
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm text-slate-600">Quantidade</p>
            <p className="text-xs text-slate-400 mt-1">Escolha a quantidade do item</p>
          </div>
          <div className="flex items-center gap-3 rounded-full bg-slate-100 px-2 py-2">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="h-10 w-10 rounded-full bg-white text-lg text-slate-700 shadow-sm"
            >
              −
            </button>
            <span className="min-w-[34px] text-center text-sm font-semibold text-slate-900">{qty}</span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="h-10 w-10 rounded-full bg-white text-lg text-slate-700 shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={!canAdd}
          onClick={() => {
            if (!canAdd) return
            onAdd(item, qty, obs)
            onClose()
          }}
          className={`mt-5 w-full rounded-[28px] px-4 py-4 text-sm font-semibold text-white shadow-sm transition ${
            canAdd ? 'bg-slate-900 hover:bg-slate-800' : 'cursor-not-allowed bg-slate-300'
          }`}
        >
          {canAdd ? 'Adicionar ao pedido' : 'Selecione as opções obrigatórias'}
        </button>
      </motion.div>
    </div>
  )
}
