"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGastoRecurrenteAction } from "@/app/gastos-recurrentes/actions";
import { Button } from "@/components/ui/button";
import type { Categoria, Cuenta } from "@/types/finance";

interface GastoRecurrenteFormProps {
  cuentas: Cuenta[];
  categorias: Categoria[];
}

export function GastoRecurrenteForm({ cuentas, categorias }: GastoRecurrenteFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      await createGastoRecurrenteAction(formData);
      router.push("/gastos-recurrentes");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el gasto recurrente.");
      setPending(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div>
        <label htmlFor="descripcion" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Descripción
        </label>
        <input
          id="descripcion"
          name="descripcion"
          type="text"
          required
          autoFocus
          placeholder="Ej: Alquiler, Netflix, Internet"
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm placeholder:text-foreground-subtle"
        />
      </div>

      <div>
        <label className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Monto mensual
        </label>
        <div className="flex items-baseline gap-2 border-b border-border pb-2">
          <span className="font-data text-3xl text-foreground-subtle">$</span>
          <input
            name="monto"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            required
            placeholder="0"
            className="w-full bg-transparent font-data text-4xl tabular-nums outline-none placeholder:text-foreground-subtle"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="categoriaId" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Categoría
          </label>
          <select
            id="categoriaId"
            name="categoriaId"
            required
            defaultValue={categorias[0]?.id}
            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
          >
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cuentaId" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Cuenta
          </label>
          <select
            id="cuentaId"
            name="cuentaId"
            required
            defaultValue={cuentas[0]?.id}
            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
          >
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="diaMes" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Día del mes en que vence
        </label>
        <input
          id="diaMes"
          name="diaMes"
          type="number"
          min="1"
          max="31"
          step="1"
          required
          defaultValue={1}
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
        />
      </div>

      {error && <p className="font-data text-sm text-alert">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full text-base">
        {pending ? "Guardando…" : "Guardar gasto fijo"}
      </Button>
    </form>
  );
}
