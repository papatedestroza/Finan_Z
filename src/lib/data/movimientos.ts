import { createClient } from "@/lib/supabase/server";
import type { Movimiento, MovimientoInput } from "@/types/finance";

export async function getMovimientos(): Promise<Movimiento[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("movimientos")
    .select("id, cuenta_id, categoria_id, tipo, monto, fecha, descripcion, created_at")
    .is("deleted_at", null)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return data.map((m) => ({
    id: m.id,
    cuentaId: m.cuenta_id,
    categoriaId: m.categoria_id,
    tipo: m.tipo,
    monto: Number(m.monto),
    fecha: m.fecha,
    descripcion: m.descripcion,
    createdAt: m.created_at,
    deletedAt: null,
  }));
}

export async function createMovimiento(input: MovimientoInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("movimientos").insert({
    cuenta_id: input.cuentaId,
    categoria_id: input.categoriaId,
    tipo: input.tipo,
    monto: input.monto,
    fecha: input.fecha,
    descripcion: input.descripcion?.trim() || null,
  });

  if (error) throw new Error(error.message);
}

export async function softDeleteMovimiento(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("movimientos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}
