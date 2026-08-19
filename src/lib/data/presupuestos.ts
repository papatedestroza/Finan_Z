import { createClient } from "@/lib/supabase/server";
import type { Presupuesto } from "@/types/finance";

export async function getPresupuestos(mes: number, anio: number): Promise<Presupuesto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("presupuestos")
    .select("categoria_id, monto_mensual, mes, anio")
    .eq("mes", mes)
    .eq("anio", anio);

  if (error) throw new Error(error.message);

  return data.map((p) => ({
    categoriaId: p.categoria_id,
    montoMensual: Number(p.monto_mensual),
    mes: p.mes,
    anio: p.anio,
  }));
}

export async function upsertPresupuesto(
  categoriaId: string,
  montoMensual: number,
  mes: number,
  anio: number
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado.");

  const { error } = await supabase
    .from("presupuestos")
    .upsert(
      { user_id: user.id, categoria_id: categoriaId, monto_mensual: montoMensual, mes, anio },
      { onConflict: "user_id,categoria_id,mes,anio" }
    );

  if (error) throw new Error(error.message);
}
