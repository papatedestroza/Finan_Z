import Link from "next/link";
import { MetaForm } from "@/components/metas/meta-form";

export default function NuevaMetaPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 pb-10 pt-8">
      <header className="flex items-center justify-between">
        <Link href="/metas" className="font-data text-sm text-foreground-muted">
          ← Cancelar
        </Link>
        <span className="font-display text-lg italic text-foreground-muted">Nueva meta</span>
        <span className="w-16" />
      </header>

      <MetaForm />
    </main>
  );
}
