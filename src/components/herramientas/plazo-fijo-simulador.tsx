"use client";

import { useMemo, useState } from "react";
import { calcularPlazoFijo } from "@/lib/finance-calc";
import { formatCurrency } from "@/lib/format";
import { MoneyAmount } from "@/components/ui/money-amount";

export function PlazoFijoSimulador() {
  const [capital, setCapital] = useState(500000);
  const [tna, setTna] = useState(35);
  const [dias, setDias] = useState(30);

  const resultado = useMemo(() => calcularPlazoFijo(capital, tna, dias), [capital, tna, dias]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="capital" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Capital
        </label>
        <div className="flex items-baseline gap-2 border-b border-border pb-2">
          <span className="font-data text-2xl text-foreground-subtle">$</span>
          <input
            id="capital"
            type="number"
            min="0"
            step="1000"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value) || 0)}
            className="w-full bg-transparent font-data text-3xl tabular-nums outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="tna" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            TNA %
          </label>
          <input
            id="tna"
            type="number"
            min="0"
            step="0.1"
            value={tna}
            onChange={(e) => setTna(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
          />
        </div>
        <div>
          <label htmlFor="dias" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Días
          </label>
          <input
            id="dias"
            type="number"
            min="1"
            step="1"
            value={dias}
            onChange={(e) => setDias(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Interés ganado
          </span>
          <MoneyAmount value={formatCurrency(resultado.interes)} tone="accent" size="md" />
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Total al vencimiento
          </span>
          <MoneyAmount value={formatCurrency(resultado.total)} size="md" />
        </div>
      </div>
    </div>
  );
}
