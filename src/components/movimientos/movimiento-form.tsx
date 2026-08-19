"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMovimientoAction } from "@/app/movimientos/actions";
import { Button } from "@/components/ui/button";
import type { Categoria, Cuenta, TipoMovimiento } from "@/types/finance";

interface MovimientoFormProps {
  cuentas: Cuenta[];
  categorias: Categoria[];
}

const today = () => new Date().toISOString().slice(0, 10);

export function MovimientoForm({ cuentas, categorias }: MovimientoFormProps) {
  const router = useRouter();
  const [tipo, setTipo] = useState<TipoMovimiento>("gasto");
  const [showDescripcion, setShowDescripcion] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      await createMovimientoAction(formData);
      router.push("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el movimiento.");
      setPending(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <input type="hidden" name="tipo" value={tipo} />

      <div className="grid grid-cols-2 gap-2 rounded-full bg-surface-raised p-1">
        <button
          type="button"
          onClick={() => setTipo("gasto")}
          className={`rounded-full py-2.5 font-data text-sm transition-colors ${
            tipo === "gasto"
              ? "bg-alert text-alert-foreground"
              : "text-foreground-muted"
          }`}
        >
          Gasto
        </button>
        <button
          type="button"
          onClick={() => setTipo("ingreso")}
          className={`rounded-full py-2.5 font-data text-sm transition-colors ${
            tipo === "ingreso"
              ? "bg-accent text-accent-foreground"
              : "text-foreground-muted"
          }`}
        >
          Ingreso
        </button>
      </div>

      <div>
        <label className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Monto
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
            autoFocus
            placeholder="0"
            className="w-full bg-transparent font-data text-4xl tabular-nums outline-none placeholder:text-foreground-subtle"
          />
        </div>
      </div>

      <div className={tipo === "gasto" ? "grid grid-cols-2 gap-3" : ""}>
        {tipo === "gasto" && (
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
        )}
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
        <label htmlFor="fecha" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Fecha
        </label>
        <input
          id="fecha"
          name="fecha"
          type="date"
          required
          defaultValue={today()}
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
        />
      </div>

      {showDescripcion ? (
        <div>
          <label htmlFor="descripcion" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Descripción (opcional)
          </label>
          <input
            id="descripcion"
            name="descripcion"
            type="text"
            placeholder="Ej: supermercado del sábado"
            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowDescripcion(true)}
          className="self-start font-data text-sm text-foreground-muted underline decoration-border underline-offset-4"
        >
          + agregar descripción
        </button>
      )}

      {error && <p className="font-data text-sm text-alert">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full text-base">
        {pending ? "Guardando…" : "Guardar movimiento"}
      </Button>
    </form>
  );
}
