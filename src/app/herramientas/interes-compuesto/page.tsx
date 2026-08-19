import Link from "next/link";
import { InteresCompuestoSimulador } from "@/components/herramientas/interes-compuesto-simulador";

export default function InteresCompuestoPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-16 pt-8">
      <header className="flex items-center justify-between">
        <Link href="/herramientas" className="font-data text-sm text-foreground-muted">
          ← Herramientas
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">
          Interés compuesto
        </span>
        <span className="w-16" />
      </header>

      <InteresCompuestoSimulador />
    </main>
  );
}
