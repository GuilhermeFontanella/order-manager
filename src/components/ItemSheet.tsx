import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { Item } from '../data/menu'
import { fmt } from '../data/menu'
import OptionRow from './ember/OptionRow'
import SegmentedControl from './ember/SegmentedControl'
import QuantityStepper from './ember/QuantityStepper'
import Button from './ember/Button'
import Badge from './ember/Badge'

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
    <div className="ember-theme fixed inset-0 z-50">
      <div className="absolute inset-0" style={{ background: 'var(--glass-lo)' }} onClick={onClose} />

      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full max-w-2xl p-4 min-h-117.5 max-h-[calc(100vh-40px)] overflow-y-auto"
        style={{
          borderTopLeftRadius: 'var(--r-sheet)', borderTopRightRadius: 'var(--r-sheet)',
          background: 'var(--surface-sheet)', backdropFilter: 'var(--blur-glass)', WebkitBackdropFilter: 'var(--blur-glass)',
          boxShadow: 'var(--ring-inner), var(--shadow-sheet)',
        }}
      >
        <div className="flex justify-center mb-4">
          <div className="h-1.5 w-16 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        <div className="flex flex-col gap-3 rounded-3xl p-4" style={{ background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)' }}>
          <div className="flex gap-4 items-start">
            <div
              className="flex h-16 w-16 items-center justify-center text-3xl"
              style={{ borderRadius: 'var(--r-image)', background: 'var(--ink-2)', boxShadow: 'var(--ring-inner)' }}
            >
              {item.emoji ?? '🍽️'}
            </div>
            <div className="flex-1 text-left">
              <h3 style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{item.nome}</h3>
              {item.desc && <p className="mt-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>}
            </div>
            <div className="text-right" style={{ font: 'var(--text-title)', fontSize: 'var(--fs-price)', color: 'var(--text-price)' }}>{fmt(item.preco)}</div>
          </div>
        </div>

        {optionGroup ? (
          <div className="mt-5 rounded-3xl p-4" style={{ background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)' }}>
            <div className="flex items-center justify-between gap-3 text-left">
              <div>
                <p style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{optionGroup.nome}</p>
                <p className="mt-1" style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>Selecione uma opção para continuar.</p>
              </div>
              {optionGroup.obrigatorio && <Badge tone="spicy">Obrigatório</Badge>}
            </div>

            <div className="mt-4">
              <SegmentedControl
                options={optionGroup.opcoes.map((o: string) => ({ value: o, label: o }))}
                value={selectedOption}
                onChange={setSelectedOption}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-5 rounded-3xl p-4" style={{ background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)' }}>
          <label style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>Observação</label>
          <textarea
            value={obs}
            onChange={event => setObs(event.target.value)}
            placeholder="Ex: sem cebola, ponto da carne..."
            className="mt-3 min-h-30 w-full px-4 py-3 outline-none transition"
            style={{
              borderRadius: 'var(--r-md)', background: 'var(--ink-2)', color: 'var(--text-primary)',
              font: 'var(--text-body)', boxShadow: 'var(--ring-inner)',
            }}
          />
        </div>

        <div className="mt-5 rounded-3xl p-4">
          <OptionRow
            label="Quantidade"
            control={<QuantityStepper value={qty} onChange={setQty} />}
          />
        </div>

        <Button
          fullWidth size="lg" disabled={!canAdd}
          onClick={() => {
            if (!canAdd) return
            onAdd(item, qty, obs)
            onClose()
          }}
        >
          {canAdd ? 'Adicionar ao pedido' : 'Selecione as opções obrigatórias'}
        </Button>
      </motion.div>
    </div>
  )
}
