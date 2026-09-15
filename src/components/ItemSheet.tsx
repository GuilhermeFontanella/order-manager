import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { Item, SelecaoOpcao } from '../data/menu'
import { fmt } from '../data/menu'
import OptionRow from './ember/OptionRow'
import SegmentedControl from './ember/SegmentedControl'
import MultiSelectControl from './ember/MultiSelectControl'
import QuantityStepper from './ember/QuantityStepper'
import Button from './ember/Button'
import Badge from './ember/Badge'

type Props = {
  item: Item | null
  open: boolean
  onClose: () => void
  onAdd: (item: Item, qty: number, obs: string, selecoes: SelecaoOpcao[]) => void
}

function optionLabel(nome: string, precoAdicional: number) {
  return precoAdicional > 0 ? `${nome} (+${fmt(precoAdicional)})` : nome
}

export default function ItemSheet({ item, open, onClose, onAdd }: Props) {
  const [qty, setQty] = useState(1)
  const [obs, setObs] = useState('')
  const [selecoesPorGrupo, setSelecoesPorGrupo] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (item) {
      setQty(1)
      setObs('')
      setSelecoesPorGrupo({})
    }
  }, [item?.id])

  const grupos = item?.grupos ?? []

  const extraPorUnidade = useMemo(() => {
    return grupos.reduce((total, grupo) => {
      const selecionados = selecoesPorGrupo[grupo.id] ?? []
      const soma = grupo.opcoes
        .filter(o => selecionados.includes(o.id))
        .reduce((s, o) => s + o.precoAdicional, 0)
      return total + soma
    }, 0)
  }, [grupos, selecoesPorGrupo])

  if (!open || !item) return null

  const gruposObrigatoriosPendentes = grupos.filter(
    grupo => grupo.obrigatorio && (selecoesPorGrupo[grupo.id]?.length ?? 0) === 0,
  )
  const canAdd = gruposObrigatoriosPendentes.length === 0

  const precoUnitario = item.preco + extraPorUnidade

  function toggleUnica(grupoId: string, opcaoId: string) {
    setSelecoesPorGrupo(prev => ({ ...prev, [grupoId]: [opcaoId] }))
  }

  function toggleMultipla(grupoId: string, opcaoIds: string[]) {
    setSelecoesPorGrupo(prev => ({ ...prev, [grupoId]: opcaoIds }))
  }

  function buildSelecoes(): SelecaoOpcao[] {
    const resultado: SelecaoOpcao[] = []
    for (const grupo of grupos) {
      const selecionados = selecoesPorGrupo[grupo.id] ?? []
      for (const opcao of grupo.opcoes) {
        if (selecionados.includes(opcao.id)) {
          resultado.push({
            grupoId: grupo.id,
            grupoNome: grupo.nome,
            opcaoId: opcao.id,
            opcaoNome: opcao.nome,
            precoAdicional: opcao.precoAdicional,
          })
        }
      }
    }
    return resultado
  }

  return (
    <div className="ember-theme fixed inset-0 z-50">
      <div
        className="absolute inset-0"
        style={{ background: 'var(--glass-lo)', backdropFilter: 'var(--blur-scrim)', WebkitBackdropFilter: 'var(--blur-scrim)' }}
        onClick={onClose}
      />

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
              className="flex w-1/3 aspect-square shrink-0 items-center justify-center text-3xl overflow-hidden"
              style={{ borderRadius: 'var(--r-image)', background: 'var(--ink-2)', boxShadow: 'var(--ring-inner)' }}
            >
              <img src={item.fotos?.[0]} alt={item.nome} className="h-full w-full object-cover rounded-2xl" />
            </div>
            <div className="flex flex-col text-left flex-1 min-w-0">
              <div className="flex text-left justify-between pb-2">
                <h3 style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{item.nome}</h3>
                <div className="text-right" style={{ font: 'var(--text-title)', fontSize: 'var(--fs-price)', color: 'var(--text-price)' }}>{fmt(precoUnitario)}</div>
              </div>
              {item.desc && <p className="mt-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>}

            </div>
          </div>
        </div>

        {grupos.map(grupo => (
          <div key={grupo.id} className="mt-5 rounded-3xl p-4" style={{ background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)' }}>
            <div className="flex items-center justify-between gap-3 text-left">
              <div>
                <p style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{grupo.nome}</p>
                <p className="mt-1" style={{ font: 'var(--text-caption)', color: 'var(--text-muted)' }}>
                  {grupo.multiplaEscolha ? 'Selecione uma ou mais opções.' : 'Selecione uma opção para continuar.'}
                </p>
              </div>
              {grupo.obrigatorio && <Badge tone="spicy">Obrigatório</Badge>}
            </div>

            <div className="mt-4">
              {grupo.multiplaEscolha ? (
                <MultiSelectControl
                  options={grupo.opcoes.map(o => ({ value: o.id, label: optionLabel(o.nome, o.precoAdicional) }))}
                  value={selecoesPorGrupo[grupo.id] ?? []}
                  onChange={value => toggleMultipla(grupo.id, value)}
                />
              ) : (
                <SegmentedControl
                  options={grupo.opcoes.map(o => ({ value: o.id, label: optionLabel(o.nome, o.precoAdicional) }))}
                  value={selecoesPorGrupo[grupo.id]?.[0] ?? null}
                  onChange={value => toggleUnica(grupo.id, value)}
                />
              )}
            </div>
          </div>
        ))}

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
            onAdd(item, qty, obs, buildSelecoes())
            onClose()
          }}
        >
          {canAdd ? `Adicionar ao pedido · ${fmt(precoUnitario * qty)}` : 'Selecione as opções obrigatórias'}
        </Button>
      </motion.div>
    </div>
  )
}
