"use server";

import { revalidatePath } from "next/cache";
import {
  createGastoRecurrente,
  softDeleteGastoRecurrente,
  toggleActivoGastoRecurrente,
} from "@/lib/data/gastos-recurrentes";

export async function createGastoRecurrenteAction(formData: FormData) {
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const monto = Number(formData.get("monto"));
  const categoriaId = String(formData.get("categoriaId"));
  const cuentaId = String(formData.get("cuentaId"));
  const diaMes = Number(formData.get("diaMes"));

  if (!descripcion) throw new Error("Falta la descripción.");
  if (!Number.isFinite(monto) || monto <= 0) throw new Error("El monto tiene que ser mayor a 0.");
  if (!categoriaId || !cuentaId) throw new Error("Faltan categoría o cuenta.");
  if (!Number.isInteger(diaMes) || diaMes < 1 || diaMes > 31) {
    throw new Error("El día del mes tiene que estar entre 1 y 31.");
  }

  await createGastoRecurrente({ descripcion, monto, categoriaId, cuentaId, diaMes });

  revalidatePath("/");
  revalidatePath("/gastos-recurrentes");
}

export async function toggleActivoAction(id: string, activoActual: boolean) {
  await toggleActivoGastoRecurrente(id, activoActual);
  revalidatePath("/");
  revalidatePath("/gastos-recurrentes");
}

export async function deleteGastoRecurrenteAction(id: string) {
  await softDeleteGastoRecurrente(id);
  revalidatePath("/");
  revalidatePath("/gastos-recurrentes");
}
