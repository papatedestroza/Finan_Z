import { createClient } from "@/lib/supabase/server";
import type { MetaAhorro, MetaAhorroInput } from "@/types/finance";

export async function getMetasAhorro(): Promise<MetaAhorro[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("metas_ahorro")
    .select("id, nombre, monto_objetivo, monto_actual, fecha_objetivo, created_at")
    .is("deleted_at", null)
    .order("fecha_objetivo", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    montoObjetivo: Number(m.monto_objetivo),
    montoActual: Number(m.monto_actual),
    fechaObjetivo: m.fecha_objetivo,
    createdAt: m.created_at,
    deletedAt: null,
  }));
}

export async function createMetaAhorro(input: MetaAhorroInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("metas_ahorro").insert({
    nombre: input.nombre.trim(),
    monto_objetivo: input.montoObjetivo,
    monto_actual: input.montoActual,
    fecha_objetivo: input.fechaObjetivo,
  });

  if (error) throw new Error(error.message);
}

export async function actualizarMontoActualMeta(id: string, montoActual: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("metas_ahorro")
    .update({ monto_actual: montoActual })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function softDeleteMetaAhorro(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("metas_ahorro")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
