import Link from "next/link";
import { GastoRecurrenteForm } from "@/components/gastos-recurrentes/gasto-recurrente-form";
import { getCategorias } from "@/lib/data/categorias";
import { getCuentas } from "@/lib/data/cuentas";

export default async function NuevoGastoRecurrentePage() {
  const [cuentas, categorias] = await Promise.all([getCuentas(), getCategorias()]);

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-10 pt-8">
      <header className="flex items-center justify-between">
        <Link href="/gastos-recurrentes" className="font-data text-sm text-foreground-muted">
          ← Cancelar
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">Gasto fijo</span>
        <span className="w-16" />
      </header>

      <GastoRecurrenteForm cuentas={cuentas} categorias={categorias} />
    </main>
  );
}
