"use server";

import { revalidatePath } from "next/cache";
import { createMovimiento, softDeleteMovimiento } from "@/lib/data/movimientos";
import type { TipoMovimiento } from "@/types/finance";

export async function createMovimientoAction(formData: FormData) {
  const monto = Number(formData.get("monto"));
  const tipo = formData.get("tipo") as TipoMovimiento;
  const categoriaIdRaw = String(formData.get("categoriaId") ?? "");
  const cuentaId = String(formData.get("cuentaId"));
  const fecha = String(formData.get("fecha"));
  const descripcion = formData.get("descripcion");

  if (!Number.isFinite(monto) || monto <= 0) {
    throw new Error("El monto tiene que ser mayor a 0.");
  }
  if (!cuentaId || !fecha) {
    throw new Error("Faltan campos obligatorios.");
  }
  if (tipo === "gasto" && !categoriaIdRaw) {
    throw new Error("Falta la categoría.");
  }

  const categoriaId = tipo === "ingreso" ? null : categoriaIdRaw;

  await createMovimiento({
    monto,
    tipo,
    categoriaId,
    cuentaId,
    fecha,
    descripcion: descripcion ? String(descripcion) : undefined,
  });

  revalidatePath("/");
  revalidatePath("/movimientos");
}

export async function deleteMovimientoAction(id: string) {
  await softDeleteMovimiento(id);
  revalidatePath("/");
  revalidatePath("/movimientos");
}
