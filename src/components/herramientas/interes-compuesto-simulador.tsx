"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { calcularInteresCompuesto } from "@/lib/finance-calc";
import { formatCurrency } from "@/lib/format";
import { MoneyAmount } from "@/components/ui/money-amount";

export function InteresCompuestoSimulador() {
  const [capitalInicial, setCapitalInicial] = useState(300000);
  const [tna, setTna] = useState(40);
  const [aporteMensual, setAporteMensual] = useState(50000);
  const [meses, setMeses] = useState(12);

  const filas = useMemo(
    () => calcularInteresCompuesto(capitalInicial, tna, aporteMensual, meses),
    [capitalInicial, tna, aporteMensual, meses]
  );

  const saldoFinal = filas.at(-1)?.saldo ?? capitalInicial;
  const totalAportado = capitalInicial + aporteMensual * meses;
  const totalInteres = saldoFinal - totalAportado;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label htmlFor="capitalInicial" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Capital inicial
        </label>
        <div className="flex items-baseline gap-2 border-b border-border pb-2">
          <span className="font-data text-2xl text-foreground-subtle">$</span>
          <input
            id="capitalInicial"
            type="number"
            min="0"
            step="1000"
            value={capitalInicial}
            onChange={(e) => setCapitalInicial(Number(e.target.value) || 0)}
            className="w-full bg-transparent font-data text-3xl tabular-nums outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label htmlFor="tna2" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            TNA %
          </label>
          <input
            id="tna2"
            type="number"
            min="0"
            step="0.1"
            value={tna}
            onChange={(e) => setTna(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-border bg-surface-raised px-2 py-3 font-data text-sm"
          />
        </div>
        <div>
          <label htmlFor="aporte" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Aporte/mes
          </label>
          <input
            id="aporte"
            type="number"
            min="0"
            step="1000"
            value={aporteMensual}
            onChange={(e) => setAporteMensual(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-border bg-surface-raised px-2 py-3 font-data text-sm"
          />
        </div>
        <div>
          <label htmlFor="meses" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Meses
          </label>
          <input
            id="meses"
            type="number"
            min="1"
            max="360"
            step="1"
            value={meses}
            onChange={(e) => setMeses(Math.min(360, Number(e.target.value) || 0))}
            className="w-full rounded-xl border border-border bg-surface-raised px-2 py-3 font-data text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Saldo final
          </span>
          <MoneyAmount value={formatCurrency(saldoFinal)} tone="accent" size="md" />
        </div>
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Interés ganado
          </span>
          <MoneyAmount value={formatCurrency(totalInteres)} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <span className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Total aportado
          </span>
          <MoneyAmount value={formatCurrency(totalAportado)} size="sm" />
        </div>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filas} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="mes"
              stroke="var(--foreground-subtle)"
              fontFamily="var(--font-data)"
              fontSize={11}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(mes) => `Mes ${mes}`}
              contentStyle={{
                background: "var(--surface-raised)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontFamily: "var(--font-data)",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="var(--accent)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full font-data text-xs">
          <thead>
            <tr className="border-b border-border text-foreground-subtle">
              <th className="px-3 py-2 text-left font-normal">Mes</th>
              <th className="px-3 py-2 text-right font-normal">Aporte</th>
              <th className="px-3 py-2 text-right font-normal">Interés</th>
              <th className="px-3 py-2 text-right font-normal">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.mes} className="border-b border-border last:border-0">
                <td className="px-3 py-2">{f.mes}</td>
                <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(f.aporte)}</td>
                <td className="px-3 py-2 text-right tabular-nums text-accent">
                  {formatCurrency(f.interes)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{formatCurrency(f.saldo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
