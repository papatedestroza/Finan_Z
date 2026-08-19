-- ============================================================================
-- Finan_Z — schema inicial
-- Todas las tablas con user_id tienen RLS activado en esta misma migración.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- cuentas
-- ----------------------------------------------------------------------------
create table cuentas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo text not null check (tipo in ('banco', 'efectivo', 'billetera_virtual', 'otra')),
  saldo_inicial numeric(14,2) not null default 0,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table cuentas enable row level security;

create policy "cuentas_select_own" on cuentas for select
  using (auth.uid() = user_id);
create policy "cuentas_insert_own" on cuentas for insert
  with check (auth.uid() = user_id);
create policy "cuentas_update_own" on cuentas for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "cuentas_delete_own" on cuentas for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- categorias
-- ----------------------------------------------------------------------------
create table categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  tipo_regla_50_30_20 text check (tipo_regla_50_30_20 in ('necesidad', 'deseo', 'ahorro')),
  es_default boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table categorias enable row level security;

create policy "categorias_select_own" on categorias for select
  using (auth.uid() = user_id);
create policy "categorias_insert_own" on categorias for insert
  with check (auth.uid() = user_id);
create policy "categorias_update_own" on categorias for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "categorias_delete_own" on categorias for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- movimientos
-- ----------------------------------------------------------------------------
create table movimientos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cuenta_id uuid not null references cuentas(id) on delete restrict,
  categoria_id uuid not null references categorias(id) on delete restrict,
  tipo text not null check (tipo in ('ingreso', 'gasto')),
  monto numeric(14,2) not null check (monto > 0),
  fecha date not null default current_date,
  descripcion text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index movimientos_user_fecha_idx on movimientos (user_id, fecha desc) where deleted_at is null;
create index movimientos_cuenta_idx on movimientos (cuenta_id) where deleted_at is null;
create index movimientos_categoria_idx on movimientos (categoria_id) where deleted_at is null;

alter table movimientos enable row level security;

create policy "movimientos_select_own" on movimientos for select
  using (auth.uid() = user_id);
create policy "movimientos_insert_own" on movimientos for insert
  with check (auth.uid() = user_id);
create policy "movimientos_update_own" on movimientos for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "movimientos_delete_own" on movimientos for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- presupuestos
-- ----------------------------------------------------------------------------
create table presupuestos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  categoria_id uuid not null references categorias(id) on delete cascade,
  monto_mensual numeric(14,2) not null check (monto_mensual >= 0),
  mes smallint not null check (mes between 1 and 12),
  anio smallint not null check (anio between 2000 and 2100),
  created_at timestamptz not null default now(),
  unique (user_id, categoria_id, mes, anio)
);

alter table presupuestos enable row level security;

create policy "presupuestos_select_own" on presupuestos for select
  using (auth.uid() = user_id);
create policy "presupuestos_insert_own" on presupuestos for insert
  with check (auth.uid() = user_id);
create policy "presupuestos_update_own" on presupuestos for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "presupuestos_delete_own" on presupuestos for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- gastos_recurrentes
-- ----------------------------------------------------------------------------
create table gastos_recurrentes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  descripcion text not null,
  monto numeric(14,2) not null check (monto > 0),
  categoria_id uuid not null references categorias(id) on delete restrict,
  cuenta_id uuid not null references cuentas(id) on delete restrict,
  dia_mes smallint not null check (dia_mes between 1 and 31),
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table gastos_recurrentes enable row level security;

create policy "gastos_recurrentes_select_own" on gastos_recurrentes for select
  using (auth.uid() = user_id);
create policy "gastos_recurrentes_insert_own" on gastos_recurrentes for insert
  with check (auth.uid() = user_id);
create policy "gastos_recurrentes_update_own" on gastos_recurrentes for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "gastos_recurrentes_delete_own" on gastos_recurrentes for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- metas_ahorro
-- ----------------------------------------------------------------------------
create table metas_ahorro (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  monto_objetivo numeric(14,2) not null check (monto_objetivo > 0),
  monto_actual numeric(14,2) not null default 0 check (monto_actual >= 0),
  fecha_objetivo date not null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

alter table metas_ahorro enable row level security;

create policy "metas_ahorro_select_own" on metas_ahorro for select
  using (auth.uid() = user_id);
create policy "metas_ahorro_insert_own" on metas_ahorro for insert
  with check (auth.uid() = user_id);
create policy "metas_ahorro_update_own" on metas_ahorro for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "metas_ahorro_delete_own" on metas_ahorro for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- cotizaciones (dato global, sin user_id — actualizado por Edge Function/cron)
-- ----------------------------------------------------------------------------
create table cotizaciones (
  fecha date not null,
  tipo text not null check (tipo in ('oficial', 'blue', 'mep')),
  compra numeric(14,2) not null,
  venta numeric(14,2) not null,
  created_at timestamptz not null default now(),
  primary key (fecha, tipo)
);

alter table cotizaciones enable row level security;

-- Lectura pública para cualquier usuario autenticado; la escritura queda
-- reservada a la service role (Edge Function), que bypassea RLS.
create policy "cotizaciones_select_authenticated" on cotizaciones for select
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- ipc_mensual (dato global, carga manual como fallback de inflación)
-- ----------------------------------------------------------------------------
create table ipc_mensual (
  mes smallint not null check (mes between 1 and 12),
  anio smallint not null check (anio between 2000 and 2100),
  valor_porcentual numeric(6,3) not null,
  created_at timestamptz not null default now(),
  primary key (mes, anio)
);

alter table ipc_mensual enable row level security;

create policy "ipc_mensual_select_authenticated" on ipc_mensual for select
  to authenticated
  using (true);

create policy "ipc_mensual_insert_authenticated" on ipc_mensual for insert
  to authenticated
  with check (true);

create policy "ipc_mensual_update_authenticated" on ipc_mensual for update
  to authenticated
  using (true) with check (true);

-- ----------------------------------------------------------------------------
-- categorías default: se insertan por usuario en el momento del signup
-- (ver trigger handle_new_user más abajo), no como seed global.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.categorias (user_id, nombre, tipo_regla_50_30_20, es_default) values
    (new.id, 'Comida', 'necesidad', true),
    (new.id, 'Transporte', 'necesidad', true),
    (new.id, 'Vivienda', 'necesidad', true),
    (new.id, 'Servicios', 'necesidad', true),
    (new.id, 'Entretenimiento', 'deseo', true),
    (new.id, 'Salud', 'necesidad', true),
    (new.id, 'Educación', 'deseo', true),
    (new.id, 'Ropa', 'deseo', true),
    (new.id, 'Ahorro/Inversión', 'ahorro', true),
    (new.id, 'Otros', 'deseo', true);

  insert into public.cuentas (user_id, nombre, tipo, saldo_inicial) values
    (new.id, 'Banco', 'banco', 0),
    (new.id, 'Efectivo', 'efectivo', 0),
    (new.id, 'Billetera Virtual', 'billetera_virtual', 0);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
