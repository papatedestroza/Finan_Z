import type { Categoria, Cuenta, GastoRecurrente, MetaAhorro, Movimiento } from "@/types/finance";

// Cálculos puros compartidos por el dashboard y los módulos. No tocan la
// base — reciben los datos ya traídos de Supabase y devuelven números.

export function saldoPorCuenta(cuenta: Cuenta, movimientos: Movimiento[]): number {
  return movimientos
    .filter((m) => m.cuentaId === cuenta.id)
    .reduce((saldo, m) => saldo + (m.tipo === "ingreso" ? m.monto : -m.monto), cuenta.saldoInicial);
}

export function esDelMes(fecha: string, mes: number, anio: number): boolean {
  const [y, m] = fecha.split("-").map(Number);
  return y === anio && m === mes;
}

export function movimientosDelMes(movimientos: Movimiento[], mes: number, anio: number): Movimiento[] {
  return movimientos.filter((m) => esDelMes(m.fecha, mes, anio));
}

export function gastoPorCategoria(movimientosMes: Movimiento[]): Record<string, number> {
  return movimientosMes
    .filter((m): m is Movimiento & { categoriaId: string } => m.tipo === "gasto" && m.categoriaId !== null)
    .reduce<Record<string, number>>((acc, m) => {
      acc[m.categoriaId] = (acc[m.categoriaId] ?? 0) + m.monto;
      return acc;
    }, {});
}

/**
 * Promedio de ingresos de los últimos 3 meses calendario (incluyendo el
 * actual) que tengan algún movimiento registrado.
 */
export function ingresoPromedio3Meses(movimientos: Movimiento[]): number {
  const hoy = new Date();
  const totales: number[] = [];

  for (let i = 0; i < 3; i++) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const total = movimientosDelMes(movimientos, d.getMonth() + 1, d.getFullYear())
      .filter((m) => m.tipo === "ingreso")
      .reduce((sum, m) => sum + m.monto, 0);
    if (total > 0) totales.push(total);
  }

  if (totales.length === 0) return 0;
  return totales.reduce((sum, t) => sum + t, 0) / totales.length;
}

/**
 * Sugerencia de presupuesto por categoría según 50/30/20, repartida en
 * partes iguales entre las categorías de cada grupo. Punto de partida
 * editable, no una regla forzada.
 */
export function sugerirPresupuestos(
  categorias: Categoria[],
  ingresoPromedio: number
): Record<string, number> {
  const pesos: Record<NonNullable<Categoria["reglaCategoria"]>, number> = {
    necesidad: 0.5,
    deseo: 0.3,
    ahorro: 0.2,
  };

  const porGrupo = categorias.reduce<Record<string, Categoria[]>>((acc, c) => {
    if (!c.reglaCategoria) return acc;
    acc[c.reglaCategoria] ??= [];
    acc[c.reglaCategoria].push(c);
    return acc;
  }, {});

  const sugerencias: Record<string, number> = {};
  for (const [regla, cats] of Object.entries(porGrupo)) {
    const montoGrupo = ingresoPromedio * pesos[regla as keyof typeof pesos];
    const porCategoria = cats.length > 0 ? montoGrupo / cats.length : 0;
    for (const c of cats) sugerencias[c.id] = Math.round(porCategoria);
  }
  return sugerencias;
}

/** Próxima fecha (ISO) en que vence un gasto recurrente, dado su día del mes. */
export function proximoVencimiento(diaMes: number): string {
  const hoy = new Date();
  const diaClamp = (anio: number, mes: number) =>
    Math.min(diaMes, new Date(anio, mes + 1, 0).getDate());

  let candidato = new Date(hoy.getFullYear(), hoy.getMonth(), diaClamp(hoy.getFullYear(), hoy.getMonth()));
  candidato.setHours(0, 0, 0, 0);
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  if (candidato < hoySinHora) {
    const anio = hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear();
    const mes = (hoy.getMonth() + 1) % 12;
    candidato = new Date(anio, mes, diaClamp(anio, mes));
  }

  return candidato.toISOString().slice(0, 10);
}

export function diasHastaVencimiento(diaMes: number): number {
  const hoy = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const vencimiento = new Date(`${proximoVencimiento(diaMes)}T00:00:00`);
  return Math.round((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
}

export function totalFijoMensual(gastosRecurrentes: GastoRecurrente[]): number {
  return gastosRecurrentes.filter((g) => g.activo).reduce((sum, g) => sum + g.monto, 0);
}

export function totalApartadoEnMetas(metas: MetaAhorro[]): number {
  return metas.reduce((sum, m) => sum + m.montoActual, 0);
}

/** Meses restantes hasta la fecha objetivo (mínimo 1, para no dividir por 0). */
export function mesesRestantes(fechaObjetivo: string): number {
  const hoy = new Date();
  const objetivo = new Date(`${fechaObjetivo}T00:00:00`);
  const meses =
    (objetivo.getFullYear() - hoy.getFullYear()) * 12 + (objetivo.getMonth() - hoy.getMonth());
  return Math.max(1, meses);
}

/** Cuánto hay que ahorrar por mes para llegar a la meta a tiempo. */
export function ahorroMensualNecesario(meta: MetaAhorro): number {
  const restante = meta.montoObjetivo - meta.montoActual;
  if (restante <= 0) return 0;
  return Math.round(restante / mesesRestantes(meta.fechaObjetivo));
}
