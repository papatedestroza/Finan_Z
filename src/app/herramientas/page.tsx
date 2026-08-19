import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MoneyAmount } from "@/components/ui/money-amount";
import { formatCurrency } from "@/lib/format";
import { fetchCotizaciones } from "@/lib/dolar";

export default async function HerramientasPage() {
  const cotizaciones = await fetchCotizaciones();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-16 pt-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="font-data text-sm text-foreground-muted">
          ← Inicio
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">Herramientas</span>
        <span className="w-16" />
      </header>

      <Card className="flex flex-col gap-3">
        <p className="font-data text-xs uppercase tracking-widest text-foreground-subtle">
          Cotización del dólar
        </p>
        {cotizaciones.length === 0 ? (
          <p className="font-data text-sm text-foreground-subtle">
            No se pudo obtener la cotización ahora. Probá de nuevo en un rato.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {cotizaciones.map((c) => (
              <div key={c.nombre} className="flex flex-col gap-1">
                <span className="font-data text-xs text-foreground-subtle">{c.nombre}</span>
                <MoneyAmount value={formatCurrency(c.venta)} size="sm" />
                <span className="font-data text-xs text-foreground-subtle">
                  compra {formatCurrency(c.compra)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        <Link href="/herramientas/plazo-fijo">
          <Card className="flex flex-col gap-1">
            <span className="font-display text-lg italic">Simulador de plazo fijo</span>
            <span className="font-data text-sm text-foreground-subtle">
              Capital, TNA y días → interés y total
            </span>
          </Card>
        </Link>

        <Link href="/herramientas/interes-compuesto">
          <Card className="flex flex-col gap-1">
            <span className="font-display text-lg italic">Interés compuesto</span>
            <span className="font-data text-sm text-foreground-subtle">
              Con aportes mensuales — tabla y curva de crecimiento
            </span>
          </Card>
        </Link>
      </div>
    </main>
  );
}
