export type TipoCuenta = "banco" | "efectivo" | "billetera_virtual" | "otra";
export type TipoMovimiento = "ingreso" | "gasto";
export type ReglaCategoria = "necesidad" | "deseo" | "ahorro";

export interface Cuenta {
  id: string;
  nombre: string;
  tipo: TipoCuenta;
  saldoInicial: number;
}

export interface Categoria {
  id: string;
  nombre: string;
  reglaCategoria: ReglaCategoria | null;
  esDefault: boolean;
}

export interface Movimiento {
  id: string;
  cuentaId: string;
  categoriaId: string | null;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string; // ISO date (yyyy-mm-dd)
  descripcion: string | null;
  createdAt: string;
  deletedAt: string | null;
}

export interface MovimientoInput {
  cuentaId: string;
  categoriaId: string | null;
  tipo: TipoMovimiento;
  monto: number;
  fecha: string;
  descripcion?: string;
}

export interface Presupuesto {
  categoriaId: string;
  montoMensual: number;
  mes: number;
  anio: number;
}

export interface GastoRecurrente {
  id: string;
  descripcion: string;
  monto: number;
  categoriaId: string;
  cuentaId: string;
  diaMes: number;
  activo: boolean;
  createdAt: string;
  deletedAt: string | null;
}

export interface GastoRecurrenteInput {
  descripcion: string;
  monto: number;
  categoriaId: string;
  cuentaId: string;
  diaMes: number;
}

export interface MetaAhorro {
  id: string;
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  fechaObjetivo: string; // ISO date
  createdAt: string;
  deletedAt: string | null;
}

export interface MetaAhorroInput {
  nombre: string;
  montoObjetivo: number;
  montoActual: number;
  fechaObjetivo: string;
}
