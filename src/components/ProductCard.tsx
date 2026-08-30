import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import type { Item } from "../data/menu";
import { fmt } from "../data/menu";
import IconButton from "./ember/IconButton";

type Props = {
  item: Item;
  onAdd?: (item: Item) => void;
  showDetails: (item: Item) => void;
  appearance?: {
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
      className="flex items-start gap-3 p-3"
      style={{
        borderRadius: "var(--r-card)",
        background: "var(--surface-card)",
        backdropFilter: "var(--blur-glass)",
        WebkitBackdropFilter: "var(--blur-glass)",
        boxShadow: "var(--ring-inner)",
        opacity: item.disponivel === false ? 0.6 : 1,
      }}
    >
      <div
        onClick={() => showDetails(item)}
        className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center text-2xl"
        style={{ borderRadius: "var(--r-image)", background: "var(--ink-2)", overflow: "hidden" }}
        aria-hidden
      >
        {photo ? (
          <img src={photo} alt="" className="h-full w-full object-cover" />
        ) : (
          (item.emoji ?? "🍽️")
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 cursor-pointer text-left" onClick={() => showDetails(item)}>
            <h3
              className="whitespace-normal wrap-break-word leading-tight"
              style={{ font: "var(--text-title)", color: "var(--text-primary)" }}
            >
              {item.nome}
            </h3>
            {appearance?.mostrarDescricao !== false && item.desc && (
              <p
                className="mt-1 whitespace-normal wrap-break-word"
                style={{ font: "var(--text-body)", fontSize: "13px", color: "var(--text-secondary)" }}
              >
                {item.desc}
              </p>
            )}
            {appearance?.mostrarIngredientes && item.ingredientes?.length ? (
              <p className="mt-1" style={{ font: "var(--text-caption)", color: "var(--text-muted)" }}>
                {item.ingredientes.join(", ")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          {appearance?.mostrarPreco !== false ? (
            <span style={{ font: "var(--text-title)", fontSize: "var(--fs-price)", fontWeight: "var(--fw-price)", color: "var(--text-price)" }}>
              {fmt(item.preco)}
            </span>
          ) : (
            <span />
          )}
          <IconButton icon={Plus} variant="accent" size={34} label={`Adicionar ${item.nome}`} onClick={() => onAdd?.(item)} />
        </div>
      </div>
    </motion.div>
  );
}
