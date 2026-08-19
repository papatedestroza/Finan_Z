import Link from "next/link";
import { PlazoFijoSimulador } from "@/components/herramientas/plazo-fijo-simulador";

export default function PlazoFijoPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-16 pt-8">
      <header className="flex items-center justify-between">
        <Link href="/herramientas" className="font-data text-sm text-foreground-muted">
          ← Herramientas
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">Plazo fijo</span>
        <span className="w-16" />
      </header>

      <PlazoFijoSimulador />
    </main>
  );
}
