export interface IpcMes {
  mes: number;
  anio: number;
  valorPct: number;
}

/**
 * IPC mensual (% de inflación) desde ArgentinaDatos (fuente comunitaria
 * basada en datos de INDEC, pública y sin key). INDEC no expone una API
 * REST propia estable, así que se usa esta como mejor alternativa
 * disponible; si falla, el balance del mes se muestra solo nominal.
 */
export async function fetchIpcUltimoMes(): Promise<IpcMes | null> {
  try {
    const res = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/inflacion", {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data: { fecha: string; valor: number }[] = await res.json();
    if (data.length === 0) return null;

    const ultimo = data.at(-1)!;
    const [anio, mes] = ultimo.fecha.split("-").map(Number);
    return { mes, anio, valorPct: ultimo.valor };
  } catch {
    return null;
  }
}

/**
 * Deflacta un monto nominal por la inflación del mes, tratándolo como si
 * se hubiera percibido al inicio del mes — una aproximación, no un cálculo
 * exacto de poder adquisitivo real.
 */
export function ajustarPorInflacion(montoNominal: number, ipcPct: number): number {
  return montoNominal / (1 + ipcPct / 100);
}
