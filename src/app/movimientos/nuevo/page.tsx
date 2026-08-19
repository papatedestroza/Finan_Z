import Link from "next/link";
import { MovimientoForm } from "@/components/movimientos/movimiento-form";
import { getCategorias } from "@/lib/data/categorias";
import { getCuentas } from "@/lib/data/cuentas";

export default async function NuevoMovimientoPage() {
  const [cuentas, categorias] = await Promise.all([getCuentas(), getCategorias()]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-10 pt-8">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="font-data text-sm text-foreground-muted"
          aria-label="Cancelar y volver"
        >
          ← Cancelar
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">
          Nuevo movimiento
        </span>
        <span className="w-16" />
      </header>

      <MovimientoForm cuentas={cuentas} categorias={categorias} />
    </main>
  );
}
