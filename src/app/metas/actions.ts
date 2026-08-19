"use server";

import { revalidatePath } from "next/cache";
import {
  actualizarMontoActualMeta,
  createMetaAhorro,
  softDeleteMetaAhorro,
} from "@/lib/data/metas";

export async function createMetaAction(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const montoObjetivo = Number(formData.get("montoObjetivo"));
  const montoActual = Number(formData.get("montoActual") || 0);
  const fechaObjetivo = String(formData.get("fechaObjetivo"));

  if (!nombre) throw new Error("Falta el nombre de la meta.");
  if (!Number.isFinite(montoObjetivo) || montoObjetivo <= 0) {
    throw new Error("El monto objetivo tiene que ser mayor a 0.");
  }
  if (!Number.isFinite(montoActual) || montoActual < 0) {
    throw new Error("El monto actual no puede ser negativo.");
  }
  if (!fechaObjetivo) throw new Error("Falta la fecha objetivo.");

  await createMetaAhorro({ nombre, montoObjetivo, montoActual, fechaObjetivo });

  revalidatePath("/");
  revalidatePath("/metas");
}

export async function actualizarMontoActualAction(formData: FormData) {
  const id = String(formData.get("id"));
  const montoActual = Number(formData.get("montoActual"));

  if (!id || !Number.isFinite(montoActual) || montoActual < 0) {
    throw new Error("Monto inválido.");
  }

  await actualizarMontoActualMeta(id, montoActual);
  revalidatePath("/");
  revalidatePath("/metas");
}

export async function deleteMetaAction(id: string) {
  await softDeleteMetaAhorro(id);
  revalidatePath("/");
  revalidatePath("/metas");
}
