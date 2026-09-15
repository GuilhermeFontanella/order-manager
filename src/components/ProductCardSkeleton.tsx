export default function ProductCardSkeleton() {
  return (
    <div
      className="flex items-start gap-3 p-3"
      style={{
        borderRadius: "var(--r-card)",
        background: "var(--surface-card)",
        boxShadow: "var(--ring-inner)",
      }}
    >
      <div className="skeleton h-14 w-14 shrink-0" style={{ borderRadius: "var(--r-image)" }} />

      <div className="min-w-0 flex-1">
        <div className="skeleton h-4 w-3/5" />
        <div className="skeleton mt-2 h-3 w-4/5" />

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="skeleton h-5 w-16" />
          <div className="skeleton h-[34px] w-[34px] rounded-full" />
        </div>
      </div>
    </div>
  );
}
