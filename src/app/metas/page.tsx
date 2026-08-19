import Link from "next/link";
import { actualizarMontoActualAction, deleteMetaAction } from "@/app/metas/actions";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency, formatDate } from "@/lib/format";
import { ahorroMensualNecesario, mesesRestantes } from "@/lib/calc";
import { getMetasAhorro } from "@/lib/data/metas";

export default async function MetasPage() {
  const metas = await getMetasAhorro();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-28 pt-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-data text-sm text-foreground-muted">
          ← Inicio
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">Metas de ahorro</span>
        <span className="w-16" />
      </header>

      <div className="flex flex-col gap-3">
        {metas.length === 0 && (
          <p className="py-10 text-center font-data text-sm text-foreground-subtle">
            Todavía no creaste ninguna meta.
          </p>
        )}

        {metas.map((m) => {
          const pct = m.montoObjetivo > 0 ? Math.round((m.montoActual / m.montoObjetivo) * 100) : 0;
          const cumplida = m.montoActual >= m.montoObjetivo;
          const cuota = ahorroMensualNecesario(m);
          const meses = mesesRestantes(m.fechaObjetivo);

          return (
            <Card key={m.id} className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-display text-lg italic">{m.nombre}</span>
                  <span className="font-data text-xs text-foreground-subtle">
                    objetivo: {formatDate(m.fechaObjetivo)}
                  </span>
                </div>
                <form action={deleteMetaAction.bind(null, m.id)}>
                  <button
                    type="submit"
                    aria-label="Eliminar meta"
                    className="font-data text-xs text-foreground-subtle hover:text-alert"
                  >
                    ✕
                  </button>
                </form>
              </div>

              <ProgressBar pct={pct} />
              <div className="flex justify-between font-data text-xs text-foreground-subtle">
                <span>
                  {formatCurrency(m.montoActual)} de {formatCurrency(m.montoObjetivo)}
                </span>
                <span>{pct}%</span>
              </div>

              <p className="font-data text-xs text-foreground-muted">
                {cumplida
                  ? "¡Meta cumplida!"
                  : `Necesitás ahorrar ${formatCurrency(cuota)}/mes durante ${meses} ${meses === 1 ? "mes" : "meses"} para llegar a tiempo.`}
              </p>

              <form
                action={actualizarMontoActualAction}
                className="flex items-center gap-2 border-t border-border pt-3"
              >
                <input type="hidden" name="id" value={m.id} />
                <span className="font-data text-xs text-foreground-subtle">Ahorrado:</span>
                <span className="font-data text-xs text-foreground-subtle">$</span>
                <input
                  name="montoActual"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={m.montoActual}
                  className="w-full min-w-0 rounded-lg border border-border bg-surface-raised px-2 py-1.5 font-data text-sm tabular-nums"
                />
                <button
                  type="submit"
                  className="shrink-0 font-data text-xs text-foreground-muted underline decoration-border underline-offset-4"
                >
                  Guardar
                </button>
              </form>
            </Card>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 flex justify-center px-5 pb-8 pt-4 [background:linear-gradient(to_top,var(--background)_60%,transparent)]">
        <Link
          href="/metas/nueva"
          className="inline-flex w-full max-w-md items-center justify-center rounded-full bg-accent px-6 py-3 text-center font-data text-base font-medium text-accent-foreground"
        >
          + Nueva meta
        </Link>
      </div>
    </main>
  );
}
