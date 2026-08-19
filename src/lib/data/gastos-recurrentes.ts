import { createClient } from "@/lib/supabase/server";
import type { GastoRecurrente, GastoRecurrenteInput } from "@/types/finance";

export async function getGastosRecurrentes(): Promise<GastoRecurrente[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gastos_recurrentes")
    .select("id, descripcion, monto, categoria_id, cuenta_id, dia_mes, activo, created_at")
    .is("deleted_at", null)
    .order("dia_mes", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((g) => ({
    id: g.id,
    descripcion: g.descripcion,
    monto: Number(g.monto),
    categoriaId: g.categoria_id,
    cuentaId: g.cuenta_id,
    diaMes: g.dia_mes,
    activo: g.activo,
    createdAt: g.created_at,
    deletedAt: null,
  }));
}

export async function createGastoRecurrente(input: GastoRecurrenteInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("gastos_recurrentes").insert({
    descripcion: input.descripcion.trim(),
    monto: input.monto,
    categoria_id: input.categoriaId,
    cuenta_id: input.cuentaId,
    dia_mes: input.diaMes,
  });

  if (error) throw new Error(error.message);
}

export async function toggleActivoGastoRecurrente(id: string, activoActual: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gastos_recurrentes")
    .update({ activo: !activoActual })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function softDeleteGastoRecurrente(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("gastos_recurrentes")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
