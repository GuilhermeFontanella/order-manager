import { useEffect, useRef, useState } from "react";
import type { Category, Item } from "../data/menu";
import ProductCard from "./ProductCard";
import ItemSheet from "./ItemSheet";
import { useCart } from "../context/CartContext";
import DetailsSheet from "./DetailsSheet";
import type { ConfiguracaoRestaurante } from "../services/storefront";

type Props = {
  categories: Category[];
  loading?: boolean;
  appearance?: ConfiguracaoRestaurante | null;
};

export default function MenuSections({
  categories,
  loading = false,
  appearance,
}: Props) {
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Highlight active tab on scroll
    const sections = categories
      .map((c) => document.getElementById("sec-" + c.id))
      .filter(Boolean);
    function onScroll() {
      let current = categories[0]?.id;
      sections.forEach((sec) => {
        if (!sec) return;
        if ((sec as HTMLElement).getBoundingClientRect().top - 160 <= 0) {
          current = (sec as HTMLElement).id.replace("sec-", "");
        }
      });
      const tabs = tabsRef.current?.querySelectorAll(".menu-tab") || [];
      tabs.forEach((t) =>
        t.classList.toggle(
          "is-active",
          (t as HTMLElement).dataset.cat === current,
        ),
      );
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [categories]);

  const [selected, setSelected] = useState<Item | null>(null);
  const { add } = useCart();

  return (
    <div>
      <div ref={tabsRef} className="flex gap-2 overflow-x-auto py-2 px-4 -mx-4">
        {categories.map((cat, idx) => (
          <button
            key={cat.id}
            className={`menu-tab ${idx === 0 ? "is-active" : ""}`}
            data-cat={cat.id}
            onClick={() =>
              document
                .getElementById("sec-" + cat.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            {cat.nome}
          </button>
        ))}
      </div>

      <main className="px-4">
        {loading ? (
          <div
            className="rounded-3xl p-6 text-center"
            style={{ background: "var(--surface-card)", color: "var(--text-muted)", boxShadow: "var(--ring-inner)" }}
          >
            Carregando cardápio...
          </div>
        ) : categories.length === 0 ? (
          <div
            className="rounded-3xl p-6 text-center"
            style={{ background: "var(--surface-card)", color: "var(--text-muted)", boxShadow: "var(--ring-inner)" }}
          >
            Nenhum item encontrado para sua busca.
          </div>
        ) : (
          categories.map((cat: Category) => (
            <section
              id={"sec-" + cat.id}
              key={cat.id}
              className="mb-6 mt-6"
              aria-labelledby={`title-${cat.id}`}
            >
              <h2
                id={`title-${cat.id}`}
                className="mb-4 text-left"
                style={{ font: "var(--text-h2)", color: "var(--text-primary)" }}
              >
                {cat.nome}
              </h2>
              <div className="grid gap-3 mt-4">
                {cat.itens.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    appearance={appearance ?? undefined}
                    onAdd={() => setSelected(item)}
                    showDetails={() => {
                      setSelected(item);
                      setShowDetails(!showDetails);
                    }}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
      <ItemSheet
        item={selected}
        open={!!selected && !showDetails}
        onClose={() => setSelected(null)}
        onAdd={(item, qty = 1) => {
          add(item, qty);
          setSelected(null);
        }}
      />
      <DetailsSheet
        item={selected}
        open={!!selected && showDetails}
        onClose={() => {
          setSelected(null);
          setShowDetails(false);
        }}
        onContinue={() => {
          setShowDetails(false);
        }}
      />
    </div>
  );
}
