import { motion } from "framer-motion";
import type { Item } from "../data/menu";
import Carousel from "./Carousel";

export default function DetailsSheet({ item, open, onContinue, onClose }: { item: Item | null; open: boolean; onContinue: (item: Item) => void; onClose: () => void }) {
    if (!open || !item) return null;
    
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

        {item?.fotos && item.fotos.length > 0 && (
          <Carousel images={item.fotos} alt={item.nome} className="h-56 w-full mb-4" />
        )}

        <div className="flex flex-col gap-3 rounded-[32px] bg-slate-50 p-4 shadow-sm">
          <div className="flex gap-4 items-start">
            {!item?.fotos?.length && (
              <div className="w-16 h-16 rounded-[28px] bg-white border border-slate-200 flex items-center justify-center text-3xl">
                {item?.emoji ?? '🍽️'}
              </div>
            )}
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-lg text-slate-900">{item?.nome}</h3>
              {item?.desc && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item?.desc}</p>}
            </div>
            <div className="font-mono font-semibold text-green-700 text-right">R$ {((item?.preco ?? 0) / 100).toFixed(2).replace('.', ',')}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onContinue(item)}
          className={`mt-5 w-full rounded-[28px] px-4 py-4 text-sm font-semibold text-white shadow-sm transition bg-slate-900 hover:bg-slate-800`}
        >
          Adicionar ao pedido
        </button>
      </motion.div>
    </div>
    );
}