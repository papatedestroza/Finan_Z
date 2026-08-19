-- Los ingresos no llevan categoría (no tiene sentido categorizar de dónde
-- viene la plata de la misma forma que se categoriza en qué se gasta).
-- categoria_id pasa a ser opcional, pero se exige para los gastos.

alter table movimientos alter column categoria_id drop not null;

alter table movimientos add constraint movimientos_categoria_requerida_en_gastos
  check (tipo = 'ingreso' or categoria_id is not null);
