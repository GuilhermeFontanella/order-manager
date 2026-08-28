import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { PERIOD_OPTIONS, type PeriodId } from "../../../../services/dashboard";

export default function PeriodFilter({
  value,
  onChange,
  customRange,
  onCustomRangeChange,
  isCustom,
}: {
  value: PeriodId;
  onChange: (period: PeriodId) => void;
  customRange: { dataInicio: string; dataFim: string } | null;
  onCustomRangeChange: (
    range: { dataInicio: string; dataFim: string } | null,
  ) => void;
  isCustom: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasRange = Boolean(customRange?.dataInicio && customRange.dataFim);

  function formatDate(value: string) {
    const [year, month, day] = value.split("-");
    const monthNames = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ];
    return `${day} ${monthNames[Number(month) - 1]} ${year}`;
  }

  function updateRange(key: "dataInicio" | "dataFim", value: string) {
    const next = {
      ...(customRange ?? { dataInicio: "", dataFim: "" }),
      [key]: value,
      ...(key === "dataInicio" ? { dataFim: "" } : {}),
    };
    onCustomRangeChange(next.dataInicio && next.dataFim ? next : { ...next });
    if (key === "dataInicio") {
      setOpen(true);
    } else if (next.dataInicio && next.dataFim) {
      setOpen(false);
    }
  }

  return (
    <div className="ap-period-filter">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`ap-period-chip${!isCustom && value === opt.id ? " is-active" : ""}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
      <div className="ap-custom-period">
        <button
          type="button"
          className={`ap-period-chip ap-custom-period-trigger${hasRange ? " is-active" : ""}`}
          onClick={() => setOpen((current) => !current)}
          aria-label={
            hasRange
              ? `Período: ${formatDate(customRange!.dataInicio)} até ${formatDate(customRange!.dataFim)}`
              : "Selecionar período personalizado"
          }
          title={
            hasRange
              ? `Período: ${formatDate(customRange!.dataInicio)} até ${formatDate(customRange!.dataFim)}`
              : "Selecionar período personalizado"
          }
        >
          {hasRange ? (
            `Período: ${formatDate(customRange!.dataInicio)} até ${formatDate(customRange!.dataFim)}`
          ) : (
            <CalendarDays size={16} />
          )}
        </button>
        {open && (
          <div className="ap-custom-period-popover">
            <label>
              Data inicial
              <input
                type="date"
                value={customRange?.dataInicio ?? ""}
                onChange={(event) =>
                  updateRange("dataInicio", event.target.value)
                }
              />
            </label>
            <label>
              Data final
              <input
                type="date"
                min={customRange?.dataInicio ?? undefined}
                value={customRange?.dataFim ?? ""}
                onChange={(event) => updateRange("dataFim", event.target.value)}
              />
            </label>
            <button
              type="button"
              className="ap-custom-period-clear"
              onClick={() => {
                onCustomRangeChange(null);
                setOpen(false);
              }}
            >
              Limpar período
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
