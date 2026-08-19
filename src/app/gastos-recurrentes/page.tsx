import Link from "next/link";
import { deleteGastoRecurrenteAction, toggleActivoAction } from "@/app/gastos-recurrentes/actions";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/format";
import { diasHastaVencimiento, movimientosDelMes, proximoVencimiento, totalFijoMensual } from "@/lib/calc";
import { getCategorias } from "@/lib/data/categorias";
import { getCuentas } from "@/lib/data/cuentas";
import { getGastosRecurrentes } from "@/lib/data/gastos-recurrentes";
import { getMovimientos } from "@/lib/data/movimientos";

export default async function GastosRecurrentesPage() {
  const hoy = new Date();
  const [cuentas, categorias, gastos, movimientos] = await Promise.all([
    getCuentas(),
    getCategorias(),
    getGastosRecurrentes(),
    getMovimientos(),
  ]);
  const cuentaById = new Map(cuentas.map((c) => [c.id, c]));
  const categoriaById = new Map(categorias.map((c) => [c.id, c]));

  const fijoMensual = totalFijoMensual(gastos);
  const gastoMesTotal = movimientosDelMes(movimientos, hoy.getMonth() + 1, hoy.getFullYear())
    .filter((m) => m.tipo === "gasto")
    .reduce((sum, m) => sum + m.monto, 0);
  const variableMes = Math.max(0, gastoMesTotal - fijoMensual);
  const totalComparado = fijoMensual + variableMes;
  const pctFijo = totalComparado > 0 ? Math.round((fijoMensual / totalComparado) * 100) : 0;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-28 pt-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-data text-sm text-foreground-muted">
          ← Inicio
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">Gastos fijos</span>
        <span className="w-16" />
      </header>

      <Card className="flex flex-col gap-2">
        <p className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Fijo vs. variable
        </p>
        <ProgressBar pct={pctFijo} />
        <div className="flex justify-between font-data text-xs text-foreground-muted">
          <span>{pctFijo}% fijo · {formatCurrency(fijoMensual)}</span>
          <span>{100 - pctFijo}% variable · {formatCurrency(variableMes)}</span>
        </div>
        <p className="font-data text-xs text-foreground-subtle">
          &quot;Fijo&quot; es lo comprometido en gastos recurrentes activos; &quot;variable&quot; es el resto
          de tu gasto real del mes.
        </p>
      </Card>

      <div className="flex flex-col gap-2">
        {gastos.length === 0 && (
          <p className="py-10 text-center font-data text-sm text-foreground-subtle">
            Todavía no cargaste gastos fijos.
          </p>
        )}

        {gastos.map((g) => {
          const dias = diasHastaVencimiento(g.diaMes);
          const proximo = proximoVencimiento(g.diaMes);
          const porVencer = g.activo && dias <= 3;

          return (
            <Card key={g.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-data text-sm">{g.descripcion}</span>
                  <span className="font-data text-xs text-foreground-subtle">
                    {categoriaById.get(g.categoriaId)?.nombre} · {cuentaById.get(g.cuentaId)?.nombre} · día {g.diaMes}
                  </span>
                </div>
                <span className="shrink-0 font-data text-sm tabular-nums">
                  {formatCurrency(g.monto)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`font-data text-xs ${porVencer ? "text-alert" : "text-foreground-subtle"}`}
                >
                  {g.activo
                    ? `Próximo vencimiento: ${proximo}${porVencer ? ` · vence en ${dias}d` : ""}`
                    : "Pausado"}
                </span>

                <div className="flex items-center gap-3">
                  <form action={toggleActivoAction.bind(null, g.id, g.activo)}>
                    <button
                      type="submit"
                      className="font-data text-xs text-foreground-muted underline decoration-border underline-offset-4"
                    >
                      {g.activo ? "Pausar" : "Reactivar"}
                    </button>
                  </form>
                  <form action={deleteGastoRecurrenteAction.bind(null, g.id)}>
                    <button
                      type="submit"
                      aria-label="Eliminar gasto fijo"
                      className="font-data text-xs text-foreground-subtle hover:text-alert"
                    >
                      ✕
                    </button>
                  </form>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 flex justify-center px-5 pb-8 pt-4 [background:linear-gradient(to_top,var(--background)_60%,transparent)]">
        <Link
          href="/gastos-recurrentes/nuevo"
          className="inline-flex w-full max-w-md items-center justify-center rounded-full bg-accent px-6 py-3 text-center font-data text-base font-medium text-accent-foreground"
        >
          + Nuevo gasto fijo
        </Link>
      </div>
    </main>
  );
}
