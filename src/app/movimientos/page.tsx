import Link from "next/link";
import { deleteMovimientoAction } from "@/app/movimientos/actions";
import { Card } from "@/components/ui/card";
import { MoneyAmount } from "@/components/ui/money-amount";
import { formatCurrency, formatDate } from "@/lib/format";
import { getCategorias } from "@/lib/data/categorias";
import { getCuentas } from "@/lib/data/cuentas";
import { getMovimientos } from "@/lib/data/movimientos";

interface MovimientosPageProps {
  searchParams: Promise<{
    categoriaId?: string;
    cuentaId?: string;
    q?: string;
  }>;
}

export default async function MovimientosPage({ searchParams }: MovimientosPageProps) {
  const { categoriaId, cuentaId, q } = await searchParams;

  const [cuentas, categorias, todosMovimientos] = await Promise.all([
    getCuentas(),
    getCategorias(),
    getMovimientos(),
  ]);
  const cuentaById = new Map(cuentas.map((c) => [c.id, c]));
  const categoriaById = new Map(categorias.map((c) => [c.id, c]));

  const query = q?.trim().toLowerCase() ?? "";
  const movimientos = todosMovimientos.filter((m) => {
    if (categoriaId && m.categoriaId !== categoriaId) return false;
    if (cuentaId && m.cuentaId !== cuentaId) return false;
    if (query) {
      const categoriaNombre = m.categoriaId ? categoriaById.get(m.categoriaId)?.nombre : "ingreso";
      const haystack = `${m.descripcion ?? ""} ${categoriaNombre ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-28 pt-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-data text-sm text-foreground-muted">
          ← Inicio
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">Movimientos</span>
        <span className="w-16" />
      </header>

      <form className="flex flex-col gap-2" action="/movimientos">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por descripción o categoría…"
          className="w-full rounded-xl border border-border bg-surface-raised px-3 py-3 font-data text-sm placeholder:text-foreground-subtle"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            name="categoriaId"
            defaultValue={categoriaId ?? ""}
            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 font-data text-sm"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            name="cuentaId"
            defaultValue={cuentaId ?? ""}
            className="w-full rounded-xl border border-border bg-surface-raised px-3 py-2.5 font-data text-sm"
          >
            <option value="">Todas las cuentas</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="self-start font-data text-xs uppercase tracking-widest text-foreground-muted underline decoration-border underline-offset-4"
        >
          Filtrar
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {movimientos.length === 0 && (
          <p className="py-10 text-center font-data text-sm text-foreground-subtle">
            No hay movimientos que coincidan con el filtro.
          </p>
        )}

        {movimientos.map((m) => {
          const categoria = m.categoriaId ? categoriaById.get(m.categoriaId) : undefined;
          const cuenta = cuentaById.get(m.cuentaId);
          const etiqueta = m.tipo === "ingreso" ? "Ingreso" : categoria?.nombre;

          return (
            <Card key={m.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-data text-sm">
                  {m.descripcion || etiqueta}
                </span>
                <span className="font-data text-xs text-foreground-subtle">
                  {formatDate(m.fecha)} · {etiqueta} · {cuenta?.nombre}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <MoneyAmount
                  value={`${m.tipo === "ingreso" ? "+" : "−"} ${formatCurrency(m.monto)}`}
                  tone={m.tipo === "ingreso" ? "accent" : "default"}
                  size="sm"
                />
                <form action={deleteMovimientoAction.bind(null, m.id)}>
                  <button
                    type="submit"
                    aria-label="Eliminar movimiento"
                    className="font-data text-xs text-foreground-subtle hover:text-alert"
                  >
                    ✕
                  </button>
                </form>
              </div>
            </Card>
          );
        })}
      </div>

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
