import Link from "next/link";
import { aplicarSugerenciaAction, guardarPresupuestoAction } from "@/app/presupuestos/actions";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/format";
import { gastoPorCategoria, ingresoPromedio3Meses, movimientosDelMes, sugerirPresupuestos } from "@/lib/calc";
import { getCategorias } from "@/lib/data/categorias";
import { getMovimientos } from "@/lib/data/movimientos";
import { getPresupuestos } from "@/lib/data/presupuestos";
import type { ReglaCategoria } from "@/types/finance";

const GRUPOS: { regla: ReglaCategoria; titulo: string }[] = [
  { regla: "necesidad", titulo: "Necesidades · 50%" },
  { regla: "deseo", titulo: "Deseos · 30%" },
  { regla: "ahorro", titulo: "Ahorro · 20%" },
];

export default async function PresupuestosPage() {
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const [categorias, presupuestos, movimientos] = await Promise.all([
    getCategorias(),
    getPresupuestos(mes, anio),
    getMovimientos(),
  ]);
  const presupuestoByCategoria = new Map(presupuestos.map((p) => [p.categoriaId, p.montoMensual]));
  const gastoByCategoria = gastoPorCategoria(movimientosDelMes(movimientos, mes, anio));
  const sugerencias = sugerirPresupuestos(categorias, ingresoPromedio3Meses(movimientos));

  const hayAlguno = presupuestos.length > 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-16 pt-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-data text-sm text-foreground-muted">
          ← Inicio
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">Presupuesto</span>
        <span className="w-16" />
      </header>

      {!hayAlguno && (
        <Card className="flex flex-col gap-3">
          <p className="font-data text-sm text-foreground-muted">
            Todavía no configuraste un presupuesto. Podés partir de una sugerencia basada en la
            regla 50/30/20 sobre tu ingreso promedio de los últimos 3 meses, y ajustarla como
            quieras.
          </p>
          <form action={aplicarSugerenciaAction}>
            <input type="hidden" name="mes" value={mes} />
            <input type="hidden" name="anio" value={anio} />
            <button
              type="submit"
              className="rounded-full bg-accent px-5 py-2.5 font-data text-sm font-medium text-accent-foreground"
            >
              Usar sugerencia 50/30/20
            </button>
          </form>
        </Card>
      )}

      {GRUPOS.map(({ regla, titulo }) => {
        const cats = categorias.filter((c) => c.reglaCategoria === regla);
        if (cats.length === 0) return null;

        return (
          <section key={regla} className="flex flex-col gap-3">
            <p className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
              {titulo}
            </p>
            {cats.map((c) => {
              const presupuesto = presupuestoByCategoria.get(c.id);
              const gastado = gastoByCategoria[c.id] ?? 0;
              const monto = presupuesto ?? sugerencias[c.id] ?? 0;
              const pct = monto > 0 ? Math.round((gastado / monto) * 100) : 0;

              return (
                <Card key={c.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-data text-sm">{c.nombre}</span>
                    {presupuesto === undefined && (
                      <span className="font-data text-xs text-foreground-subtle">sugerido</span>
                    )}
                  </div>

                  <form action={guardarPresupuestoAction} className="flex items-center gap-2">
                    <input type="hidden" name="categoriaId" value={c.id} />
                    <input type="hidden" name="mes" value={mes} />
                    <input type="hidden" name="anio" value={anio} />
                    <span className="font-data text-sm text-foreground-subtle">$</span>
                    <input
                      name="monto"
                      type="number"
                      min="0"
                      step="1"
                      defaultValue={monto}
                      className="w-full min-w-0 rounded-lg border border-border bg-surface-raised px-2 py-1.5 font-data text-sm tabular-nums"
                    />
                    <button
                      type="submit"
                      className="shrink-0 font-data text-xs text-foreground-muted underline decoration-border underline-offset-4"
                    >
                      Guardar
                    </button>
                  </form>

                  <ProgressBar pct={pct} />
                  <div className="flex justify-between font-data text-xs text-foreground-subtle">
                    <span>{formatCurrency(gastado)} gastado</span>
                    <span className={pct >= 100 ? "text-alert" : undefined}>{pct}%</span>
                  </div>
                </Card>
              );
            })}
          </section>
        );
      })}
    </main>
  );
}
