import { motion } from "framer-motion";
import type { Item } from "../data/menu";
import { fmt } from "../data/menu";
import Carousel from "./Carousel";
import Button from "./ember/Button";

export default function DetailsSheet({ item, open, onContinue, onClose }: { item: Item | null; open: boolean; onContinue: (item: Item) => void; onClose: () => void }) {
    if (!open || !item) return null;

    return (
    <div className="ember-theme fixed inset-0 z-50">
      <div
        className="absolute inset-0"
        style={{ background: 'var(--scrim-sheet)', backdropFilter: 'var(--blur-scrim)', WebkitBackdropFilter: 'var(--blur-scrim)' }}
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

        {item?.fotos && item.fotos.length > 0 && (
          <Carousel images={item.fotos} alt={item.nome} className="h-56 w-full mb-4" />
        )}

        <div className="flex flex-col gap-3 rounded-3xl p-4" style={{ background: 'var(--surface-card)', boxShadow: 'var(--ring-inner)' }}>
          <div className="flex gap-4 items-start">
            {!item?.fotos?.length && (
              <div
                className="flex h-16 w-16 items-center justify-center text-3xl"
                style={{ borderRadius: 'var(--r-image)', background: 'var(--ink-2)', boxShadow: 'var(--ring-inner)' }}
              >
                {item?.emoji ?? '🍽️'}
              </div>
            )}
            <div className="flex-1 text-left">
              <h3 style={{ font: 'var(--text-title)', color: 'var(--text-primary)' }}>{item?.nome}</h3>
              {item?.desc && <p className="mt-2" style={{ font: 'var(--text-body)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item?.desc}</p>}
            </div>
            <div className="text-right" style={{ font: 'var(--text-title)', fontSize: 'var(--fs-price)', color: 'var(--text-price)' }}>{fmt(item?.preco ?? 0)}</div>
          </div>
        </div>

        <Button fullWidth size="lg" style={{ marginTop: 'var(--sp-5)' }} onClick={() => onContinue(item)}>
          Adicionar ao pedido
        </Button>
      </motion.div>
    </div>
    );
}
