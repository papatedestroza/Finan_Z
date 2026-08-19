import Link from "next/link";
import { signOutAction } from "@/app/login/actions";
import { GastoPorCategoriaChart } from "@/components/dashboard/gasto-por-categoria-chart";
import { Card } from "@/components/ui/card";
import { MoneyAmount } from "@/components/ui/money-amount";
import { formatCurrency, formatDate } from "@/lib/format";
import { ajustarPorInflacion, fetchIpcUltimoMes } from "@/lib/ipc";
import {
  gastoPorCategoria,
  movimientosDelMes,
  saldoPorCuenta,
  totalApartadoEnMetas,
  totalFijoMensual,
} from "@/lib/calc";
import { getCategorias } from "@/lib/data/categorias";
import { getCuentas } from "@/lib/data/cuentas";
import { getGastosRecurrentes } from "@/lib/data/gastos-recurrentes";
import { getMetasAhorro } from "@/lib/data/metas";
import { getMovimientos } from "@/lib/data/movimientos";
import { getPresupuestos } from "@/lib/data/presupuestos";

export default async function Home() {
  const hoy = new Date();
  const mes = hoy.getMonth() + 1;
  const anio = hoy.getFullYear();

  const [ipc, cuentas, categorias, movimientos, presupuestos, gastosRecurrentes, metas] =
    await Promise.all([
      fetchIpcUltimoMes(),
      getCuentas(),
      getCategorias(),
      getMovimientos(),
      getPresupuestos(mes, anio),
      getGastosRecurrentes(),
      getMetasAhorro(),
    ]);
  const categoriaById = new Map(categorias.map((c) => [c.id, c]));

  const saldoTotal = cuentas.reduce((sum, c) => sum + saldoPorCuenta(c, movimientos), 0);
  const apartadoEnMetas = totalApartadoEnMetas(metas);
  const disponibleReal = saldoTotal - apartadoEnMetas;

  const movimientosMes = movimientosDelMes(movimientos, mes, anio);
  const ingresosMes = movimientosMes
    .filter((m) => m.tipo === "ingreso")
    .reduce((sum, m) => sum + m.monto, 0);
  const gastosMes = movimientosMes
    .filter((m) => m.tipo === "gasto")
    .reduce((sum, m) => sum + m.monto, 0);
  const balanceMes = ingresosMes - gastosMes;
  const balanceMesReal = ipc ? ajustarPorInflacion(balanceMes, ipc.valorPct) : null;

  const gastoPorCategoriaMap = gastoPorCategoria(movimientosMes);
  const gastoPorCategoriaData = Object.entries(gastoPorCategoriaMap)
    .map(([categoriaId, monto]) => ({
      nombre: categoriaById.get(categoriaId)?.nombre ?? "Otros",
      monto,
    }))
    .sort((a, b) => b.monto - a.monto);

  const totalPresupuestado = presupuestos.reduce((sum, p) => sum + p.montoMensual, 0);
  const totalGastadoPresupuestado = presupuestos.reduce(
    (sum, p) => sum + (gastoPorCategoriaMap[p.categoriaId] ?? 0),
    0
  );
  const pctPresupuesto =
    totalPresupuestado > 0 ? Math.round((totalGastadoPresupuestado / totalPresupuestado) * 100) : null;

  const fijoMensual = totalFijoMensual(gastosRecurrentes);
  const variableMes = Math.max(0, gastosMes - fijoMensual);
  const totalFijoVsVariable = fijoMensual + variableMes;
  const pctFijo = totalFijoVsVariable > 0 ? Math.round((fijoMensual / totalFijoVsVariable) * 100) : null;

  const recientes = movimientos.slice(0, 5);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-8 px-5 pb-28 pt-10">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-display text-lg italic text-foreground-muted">Finan_Z</span>
          <Link
            href="/movimientos"
            className="font-data text-xs uppercase tracking-widest text-foreground-subtle"
          >
            Ver todo →
          </Link>
        </div>
        <nav className="flex gap-4 font-data text-xs text-foreground-subtle">
          <Link href="/presupuestos" className="underline decoration-border underline-offset-4">
            Presupuesto
          </Link>
          <Link href="/gastos-recurrentes" className="underline decoration-border underline-offset-4">
            Gastos fijos
          </Link>
          <Link href="/metas" className="underline decoration-border underline-offset-4">
            Metas
          </Link>
          <Link href="/herramientas" className="underline decoration-border underline-offset-4">
            Herramientas
          </Link>
          <form action={signOutAction} className="ml-auto">
            <button type="submit" className="underline decoration-border underline-offset-4">
              Salir
            </button>
          </form>
        </nav>
      </header>

      <section className="flex flex-col gap-2">
        <p className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Disponible real
        </p>
        <MoneyAmount value={formatCurrency(disponibleReal)} size="lg" tone="accent" />
        {apartadoEnMetas > 0 ? (
          <Link href="/metas" className="font-data text-sm text-foreground-muted">
            {formatCurrency(apartadoEnMetas)} apartado en metas · no cuenta como líquido
          </Link>
        ) : (
          <p className="font-data text-sm text-foreground-muted">
            Saldo consolidado de tus {cuentas.length} cuentas
          </p>
        )}
      </section>

      <div className="flex flex-col gap-2">
        {cuentas.map((c) => (
          <div key={c.id} className="flex items-center justify-between font-data text-sm">
            <span className="text-foreground-muted">{c.nombre}</span>
            <MoneyAmount value={formatCurrency(saldoPorCuenta(c, movimientos))} size="sm" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-1">
          <p className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
            Balance del mes
          </p>
          <MoneyAmount
            value={`${balanceMes >= 0 ? "+" : "−"} ${formatCurrency(Math.abs(balanceMes))}`}
            size="md"
            tone={balanceMes >= 0 ? "accent" : "alert"}
          />
          <p className="font-data text-xs text-foreground-subtle">
            ing. {formatCurrency(ingresosMes)}
          </p>
          {balanceMesReal !== null && (
            <p className="font-data text-xs text-foreground-subtle">
              real: {formatCurrency(balanceMesReal)} (IPC {ipc!.valorPct}%)
            </p>
          )}
        </Card>

        <Link href="/presupuestos">
          <Card className="flex h-full flex-col gap-1">
            <p className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
              Presupuesto
            </p>
            {pctPresupuesto === null ? (
              <p className="font-data text-sm text-foreground-muted">Configurar →</p>
            ) : (
              <>
                <MoneyAmount
                  value={`${pctPresupuesto}%`}
                  size="md"
                  tone={pctPresupuesto >= 100 ? "alert" : "accent"}
                />
                <p className="font-data text-xs text-foreground-subtle">usado del mes</p>
              </>
            )}
          </Card>
        </Link>
      </div>

      {pctFijo !== null && (
        <Link href="/gastos-recurrentes">
          <Card className="flex flex-col gap-1">
            <p className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
              Fijo vs. variable
            </p>
            <div className="flex items-baseline gap-2">
              <MoneyAmount value={`${pctFijo}%`} size="md" />
              <span className="font-data text-xs text-foreground-subtle">de tu gasto es fijo</span>
            </div>
          </Card>
        </Link>
      )}

      <Card>
        <p className="font-display text-xl italic mb-1">Gasto por categoría</p>
        <p className="mb-2 font-data text-xs text-foreground-subtle">este mes</p>
        <GastoPorCategoriaChart data={gastoPorCategoriaData} />
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="font-display text-xl italic">Últimos movimientos</p>
        {recientes.length === 0 && (
          <p className="font-data text-sm text-foreground-subtle">Todavía no cargaste nada.</p>
        )}
        {recientes.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-data text-sm">
                {m.descripcion ||
                  (m.tipo === "ingreso" ? "Ingreso" : categoriaById.get(m.categoriaId!)?.nombre)}
              </span>
              <span className="font-data text-xs text-foreground-subtle">
                {formatDate(m.fecha)}
              </span>
            </div>
            <MoneyAmount
              value={`${m.tipo === "ingreso" ? "+" : "−"} ${formatCurrency(m.monto)}`}
              tone={m.tipo === "ingreso" ? "accent" : "default"}
              size="sm"
            />
          </div>
        ))}
      </Card>

      <div className="fixed inset-x-0 bottom-0 flex justify-center px-5 pb-8 pt-4 [background:linear-gradient(to_top,var(--background)_60%,transparent)]">
        <Link
          href="/movimientos/nuevo"
          className="inline-flex w-full max-w-md items-center justify-center rounded-full bg-accent px-6 py-3 text-center font-data text-base font-medium text-accent-foreground"
        >
          + Cargar movimiento
        </Link>
      </div>
    </main>
  );
}
