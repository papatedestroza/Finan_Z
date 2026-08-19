-- user_id toma auth.uid() por default: los inserts desde el cliente no
-- necesitan mandarlo explícito, y RLS sigue validando igual en el insert.

alter table cuentas alter column user_id set default auth.uid();
alter table categorias alter column user_id set default auth.uid();
alter table movimientos alter column user_id set default auth.uid();
alter table presupuestos alter column user_id set default auth.uid();
alter table gastos_recurrentes alter column user_id set default auth.uid();
alter table metas_ahorro alter column user_id set default auth.uid();
