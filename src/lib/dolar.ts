export interface Cotizacion {
  nombre: string;
  compra: number;
  venta: number;
  actualizado: string;
}

interface DolarApiEntry {
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fechaActualizacion: string;
}

const CASAS_RELEVANTES = new Set(["oficial", "blue", "bolsa"]);
const NOMBRE_POR_CASA: Record<string, string> = {
  oficial: "Oficial",
  blue: "Blue",
  bolsa: "MEP",
};

/**
 * Cotizaciones oficial/blue/MEP desde dolarapi.com (pública, sin key).
 * En el diseño original esto lo iba a actualizar una Edge Function con cron
 * diario hacia la tabla `cotizaciones`; acá se hace fetch directo con cache
 * de Next (revalidate 1h) mientras no hay Supabase conectado — mismo
 * resultado para el usuario, sin la infraestructura de cron todavía.
 */
export async function fetchCotizaciones(): Promise<Cotizacion[]> {
  try {
    const res = await fetch("https://dolarapi.com/v1/dolares", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const data: DolarApiEntry[] = await res.json();
    // El endpoint ya devuelve oficial → blue → bolsa en ese orden.
    return data
      .filter((d) => CASAS_RELEVANTES.has(d.casa))
      .map((d) => ({
        nombre: NOMBRE_POR_CASA[d.casa] ?? d.nombre,
        compra: d.compra,
        venta: d.venta,
        actualizado: d.fechaActualizacion,
      }));
  } catch {
    return [];
  }
}
