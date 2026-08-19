import { createClient } from "@/lib/supabase/server";
import type { Categoria } from "@/types/finance";

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("id, nombre, tipo_regla_50_30_20, es_default")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return data.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    reglaCategoria: c.tipo_regla_50_30_20,
    esDefault: c.es_default,
  }));
}
