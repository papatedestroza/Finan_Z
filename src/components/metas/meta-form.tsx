"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMetaAction } from "@/app/metas/actions";
import { Button } from "@/components/ui/button";

export function MetaForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setPending(true);
    try {
      await createMetaAction(formData);
      router.push("/metas");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la meta.");
      setPending(false);
    }
  }

  return (
    <form action={action} className="flex flex-col gap-6">
      <div>
        <label htmlFor="nombre" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          type="text"
          required
          autoFocus
          placeholder="Ej: Fondo de emergencia"
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm placeholder:text-foreground-subtle"
        />
      </div>

      <div>
        <label className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Monto objetivo
        </label>
        <div className="flex items-baseline gap-2 border-b border-border pb-2">
          <span className="font-data text-3xl text-foreground-subtle">$</span>
          <input
            name="montoObjetivo"
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

      <div>
        <label htmlFor="montoActual" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Ya tenés ahorrado (opcional)
        </label>
        <input
          id="montoActual"
          name="montoActual"
          type="number"
          min="0"
          step="0.01"
          defaultValue={0}
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
        />
      </div>

      <div>
        <label htmlFor="fechaObjetivo" className="mb-2 block font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Fecha objetivo
        </label>
        <input
          id="fechaObjetivo"
          name="fechaObjetivo"
          type="date"
          required
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm"
        />
      </div>

      {error && <p className="font-data text-sm text-alert">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full text-base">
        {pending ? "Guardando…" : "Crear meta"}
      </Button>
    </form>
  );
}
