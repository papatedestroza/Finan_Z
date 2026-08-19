export interface ResultadoPlazoFijo {
  interes: number;
  total: number;
}

/** Plazo fijo tradicional: interés simple sobre capital, prorrateado por días (TNA/365). */
export function calcularPlazoFijo(capital: number, tnaPct: number, dias: number): ResultadoPlazoFijo {
  const interes = capital * (tnaPct / 100) * (dias / 365);
  return { interes, total: capital + interes };
}

export interface FilaInteresCompuesto {
  mes: number;
  aporte: number;
  interes: number;
  saldo: number;
}

/**
 * Interés compuesto con aportes mensuales. La TNA se prorratea linealmente
 * a tasa mensual (TNA/12), que es la convención habitual en simuladores de
 * este tipo — no es la tasa efectiva mensual compuesta.
 */
export function calcularInteresCompuesto(
  capitalInicial: number,
  tnaPct: number,
  aporteMensual: number,
  meses: number
): FilaInteresCompuesto[] {
  const tasaMensual = tnaPct / 100 / 12;
  const filas: FilaInteresCompuesto[] = [];
  let saldo = capitalInicial;

  for (let mes = 1; mes <= meses; mes++) {
    const interes = saldo * tasaMensual;
    saldo = saldo + interes + aporteMensual;
    filas.push({ mes, aporte: aporteMensual, interes, saldo });
  }

  return filas;
}
