"use server";

import { revalidatePath } from "next/cache";
import { ingresoPromedio3Meses, sugerirPresupuestos } from "@/lib/calc";
import { getCategorias } from "@/lib/data/categorias";
import { getMovimientos } from "@/lib/data/movimientos";
import { getPresupuestos, upsertPresupuesto } from "@/lib/data/presupuestos";

export async function guardarPresupuestoAction(formData: FormData) {
  const categoriaId = String(formData.get("categoriaId"));
  const monto = Number(formData.get("monto"));
  const mes = Number(formData.get("mes"));
  const anio = Number(formData.get("anio"));

  if (!categoriaId || !Number.isFinite(monto) || monto < 0) {
    throw new Error("Monto de presupuesto inválido.");
  }

  await upsertPresupuesto(categoriaId, monto, mes, anio);
  revalidatePath("/presupuestos");
  revalidatePath("/");
}

export async function aplicarSugerenciaAction(formData: FormData) {
  const mes = Number(formData.get("mes"));
  const anio = Number(formData.get("anio"));

  const [presupuestosActuales, categorias, movimientos] = await Promise.all([
    getPresupuestos(mes, anio),
    getCategorias(),
    getMovimientos(),
  ]);

  const yaConfigurados = new Set(presupuestosActuales.map((p) => p.categoriaId));
  const sugerencias = sugerirPresupuestos(categorias, ingresoPromedio3Meses(movimientos));

  for (const [categoriaId, monto] of Object.entries(sugerencias)) {
    if (!yaConfigurados.has(categoriaId)) {
      await upsertPresupuesto(categoriaId, monto, mes, anio);
    }
  }

  revalidatePath("/presupuestos");
  revalidatePath("/");
}
