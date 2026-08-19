import { createClient } from "@/lib/supabase/server";
import type { Cuenta } from "@/types/finance";

export async function getCuentas(): Promise<Cuenta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cuentas")
    .select("id, nombre, tipo, saldo_inicial")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    tipo: c.tipo,
    saldoInicial: Number(c.saldo_inicial),
  }));
}
