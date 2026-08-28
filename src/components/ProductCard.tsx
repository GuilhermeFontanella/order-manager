import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Item } from "../data/menu";
import { fmt } from "../data/menu";

type Props = {
  item: Item;
  onAdd?: (item: Item) => void;
  showDetails: (item: Item) => void;
  appearance?: {
    corBotaoPrimario: string;
    corTextoPrimario: string;
    corTextoSecundario: string;
    mostrarDescricao: boolean;
    mostrarFotos: boolean;
    mostrarPreco: boolean;
    mostrarIngredientes: boolean;
  };
};

export default function ProductCard({
  item,
  onAdd,
  showDetails,
  appearance,
}: Props) {
  const photo =
    appearance?.mostrarFotos !== false ? item.fotos?.[0] : undefined;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.99 }}
      className={`bg-amber-50 rounded-xl p-3 flex gap-3 items-start shadow-sm ${item.disponivel ? "" : "opacity-70"}`}
    >
      <div
        onClick={() => showDetails(item)}
        className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center text-xl"
        aria-hidden
      >
        {photo ? (
          <img
            src={photo}
            alt=""
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          (item.emoji ?? "🍽️")
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex sm:flex-col md:flex-col gap-3 lg:flex-row sm:items-start justify-between">
          <div className="w-30" onClick={() => showDetails(item)}>
            <h3 className="font-semibold text-sm leading-tight text-left whitespace-normal wrap-break-word text-slate-950">
              {item.nome}
            </h3>
            {appearance?.mostrarDescricao !== false && item.desc && (
              <p
                className="text-xs mt-1 text-left whitespace-normal wrap-break-word"
                style={{ color: appearance?.corTextoSecundario }}
              >
                {item.desc}
              </p>
            )}
            {appearance?.mostrarIngredientes && item.ingredientes?.length ? (
              <p
                className="text-xs mt-1 text-left"
                style={{ color: appearance.corTextoSecundario }}
              >
                {item.ingredientes.join(", ")}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 sm:justify-end">
            {appearance?.mostrarPreco !== false && (
              <div
                className="font-mono font-semibold text-sm text-nowrap"
                style={{ color: appearance?.corBotaoPrimario }}
              >
                {fmt(item.preco)}
              </div>
            )}
            <button
              onClick={() => onAdd?.(item)}
              className="flex justify-center items-center rounded-full text-white shadow-lg transition hover:brightness-90"
              style={{
                backgroundColor: appearance?.corBotaoPrimario ?? "#047857",
              }}
              aria-label="Adicionar item"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
