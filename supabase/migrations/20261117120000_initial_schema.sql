-- Presurapi — esquema inicial
--
-- Convenciones (ver skill supabase-postgres-best-practices y
-- backend-design:data-modeling-discipline):
--   * Claves primarias internas: bigint generated always as identity.
--   * Identificadores públicos (enlace de presupuesto compartido): uuid aparte,
--     nunca la PK.
--   * Dinero: numeric(p,2). Tiempo: timestamptz. Nada de NULL para "no aplica"
--     salvo que sea un estado realmente distinto (p. ej. precio/hora aún sin
--     configurar, o material de catálogo borrado).
--   * Todas las tablas multi-tenant llevan user_id NOT NULL + índice + RLS.
--   * Los presupuestos congelan ("snapshot") precios, horas y porcentajes en
--     el momento de crearse: si el banco de precios o los precios del usuario
--     cambian después, los presupuestos ya emitidos no deben cambiar solos.

-- ============================================================================
-- 1. PERFILES (datos de empresa + tarifas propias del usuario)
-- ============================================================================

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre_empresa text not null default '',
  nif_empresa text not null default '',
  direccion_empresa text not null default '',
  telefono_empresa text not null default '',
  email_empresa text not null default '',
  logo_path text,
  precio_hora_oficial numeric(10, 2) check (precio_hora_oficial >= 0),
  precio_hora_peon numeric(10, 2) check (precio_hora_peon >= 0),
  gastos_generales_pct numeric(5, 2) not null default 13 check (
    gastos_generales_pct >= 0
    and gastos_generales_pct <= 100
  ),
  beneficio_industrial_pct numeric(5, 2) not null default 6 check (
    beneficio_industrial_pct >= 0
    and beneficio_industrial_pct <= 100
  ),
  iva_pct numeric(5, 2) not null default 21 check (
    iva_pct >= 0
    and iva_pct <= 100
  ),
  idioma text not null default 'es' check (idioma in ('es', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.perfiles is 'Un registro por usuario (1:1 con auth.users). Datos de empresa vacíos hasta que el usuario los rellena. Porcentajes (13/6/21) son el estándar habitual en España, editables por el usuario.';
comment on column public.perfiles.precio_hora_oficial is 'NULL = el usuario aún no ha fijado su propio precio/hora; se usa un valor por defecto en la app.';

alter table public.perfiles enable row level security;
alter table public.perfiles force row level security;

create policy perfiles_select on public.perfiles
for select
to authenticated
using ((select auth.uid ()) = id);

create policy perfiles_update on public.perfiles
for update
to authenticated
using ((select auth.uid ()) = id)
with
  check ((select auth.uid ()) = id);

create policy perfiles_insert on public.perfiles
for insert
to authenticated
with
  check ((select auth.uid ()) = id);

-- ============================================================================
-- 2. CLIENTES
-- ============================================================================

create table public.clientes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  nombre text not null,
  nif text not null default '',
  email text not null default '',
  telefono text not null default '',
  direccion text not null default '',
  notas text not null default '',
  estado text not null default 'activo' check (estado in ('activo', 'archivado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clientes_user_id_idx on public.clientes (user_id);

alter table public.clientes enable row level security;
alter table public.clientes force row level security;

create policy clientes_all on public.clientes
for all
to authenticated
using ((select auth.uid ()) = user_id)
with
  check ((select auth.uid ()) = user_id);

-- ============================================================================
-- 3. OBRAS
-- ============================================================================

create table public.obras (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  cliente_id bigint not null references public.clientes (id) on delete restrict,
  nombre text not null,
  direccion text not null default '',
  descripcion text not null default '',
  estado text not null default 'activa' check (estado in ('activa', 'archivada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index obras_user_id_idx on public.obras (user_id);

create index obras_cliente_id_idx on public.obras (cliente_id);

alter table public.obras enable row level security;
alter table public.obras force row level security;

create policy obras_all on public.obras
for all
to authenticated
using ((select auth.uid ()) = user_id)
with
  check ((select auth.uid ()) = user_id);

-- ============================================================================
-- 4. BANCO DE PRECIOS (catálogo global de referencia, gestionado por Presurapi)
-- ============================================================================

create table public.materiales (
  id bigint generated always as identity primary key,
  nombre text not null,
  unidad text not null check (
    unidad in ('m2', 'ml', 'ud', 'kg', 'l', 'saco', 'h')
  ),
  precio_referencia numeric(10, 2) not null check (precio_referencia >= 0),
  fuente text not null,
  fecha_actualizacion date not null,
  categoria text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.materiales is 'Banco de precios orientativo. precio_referencia NUNCA se presenta como exacto en la UI: siempre junto a fuente y fecha_actualizacion. Gestionado por Presurapi (service_role); los usuarios solo leen.';

create index materiales_categoria_idx on public.materiales (categoria);

alter table public.materiales enable row level security;
alter table public.materiales force row level security;

create policy materiales_select on public.materiales
for select
to authenticated
using (true);

-- Sin política de insert/update/delete para authenticated: solo service_role
-- (bypassa RLS) puede mantener el catálogo global.

-- Precios propios del usuario: tienen prioridad sobre materiales.precio_referencia
create table public.precios_usuario (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  material_id bigint not null references public.materiales (id) on delete cascade,
  precio numeric(10, 2) not null check (precio >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, material_id)
);

create index precios_usuario_user_id_idx on public.precios_usuario (user_id);

create index precios_usuario_material_id_idx on public.precios_usuario (material_id);

alter table public.precios_usuario enable row level security;
alter table public.precios_usuario force row level security;

create policy precios_usuario_all on public.precios_usuario
for all
to authenticated
using ((select auth.uid ()) = user_id)
with
  check ((select auth.uid ()) = user_id);

-- ============================================================================
-- 5. CATÁLOGO DE TRABAJOS (tabique, solado, alicatado, enfoscado...)
-- ============================================================================

create table public.trabajos (
  id bigint generated always as identity primary key,
  slug text not null unique,
  nombre text not null,
  unidad text not null check (unidad in ('m2', 'ml', 'ud')),
  descripcion text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.trabajos enable row level security;
alter table public.trabajos force row level security;

create policy trabajos_select on public.trabajos
for select
to authenticated
using (true);

-- Receta de materiales por unidad de trabajo
create table public.trabajo_materiales (
  id bigint generated always as identity primary key,
  trabajo_id bigint not null references public.trabajos (id) on delete cascade,
  material_id bigint not null references public.materiales (id) on delete restrict,
  cantidad_por_unidad numeric(10, 4) not null check (cantidad_por_unidad > 0),
  created_at timestamptz not null default now(),
  unique (trabajo_id, material_id)
);

create index trabajo_materiales_trabajo_id_idx on public.trabajo_materiales (trabajo_id);

create index trabajo_materiales_material_id_idx on public.trabajo_materiales (material_id);

alter table public.trabajo_materiales enable row level security;
alter table public.trabajo_materiales force row level security;

create policy trabajo_materiales_select on public.trabajo_materiales
for select
to authenticated
using (true);

-- Horas de oficial/peón por unidad de trabajo
create table public.trabajo_mano_obra (
  id bigint generated always as identity primary key,
  trabajo_id bigint not null references public.trabajos (id) on delete cascade,
  rol text not null check (rol in ('oficial', 'peon')),
  horas_por_unidad numeric(10, 4) not null check (horas_por_unidad > 0),
  created_at timestamptz not null default now(),
  unique (trabajo_id, rol)
);

create index trabajo_mano_obra_trabajo_id_idx on public.trabajo_mano_obra (trabajo_id);

alter table public.trabajo_mano_obra enable row level security;
alter table public.trabajo_mano_obra force row level security;

create policy trabajo_mano_obra_select on public.trabajo_mano_obra
for select
to authenticated
using (true);

-- ============================================================================
-- 6. PRESUPUESTOS (capítulos, partidas y su desglose congelado)
-- ============================================================================

create table public.presupuestos (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  obra_id bigint not null references public.obras (id) on delete restrict,
  numero integer not null,
  estado text not null default 'borrador' check (
    estado in (
      'borrador',
      'enviado',
      'aceptado',
      'rechazado'
    )
  ),
  -- Snapshot de tarifas/porcentajes del perfil en el momento de crear el presupuesto
  precio_hora_oficial numeric(10, 2) not null check (precio_hora_oficial >= 0),
  precio_hora_peon numeric(10, 2) not null check (precio_hora_peon >= 0),
  gastos_generales_pct numeric(5, 2) not null check (
    gastos_generales_pct >= 0
    and gastos_generales_pct <= 100
  ),
  beneficio_industrial_pct numeric(5, 2) not null check (
    beneficio_industrial_pct >= 0
    and beneficio_industrial_pct <= 100
  ),
  iva_pct numeric(5, 2) not null check (
    iva_pct >= 0
    and iva_pct <= 100
  ),
  -- Totales calculados (mantenidos por la aplicación/triggers en la Fase 4,
  -- a partir de capitulos/partidas; aquí solo se define la forma)
  subtotal_materiales numeric(12, 2) not null default 0,
  subtotal_mano_obra numeric(12, 2) not null default 0,
  gastos_generales_importe numeric(12, 2) not null default 0,
  beneficio_industrial_importe numeric(12, 2) not null default 0,
  base_imponible numeric(12, 2) not null default 0,
  iva_importe numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notas text not null default '',
  token_publico uuid not null default gen_random_uuid () unique,
  enviado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, numero)
);

comment on column public.presupuestos.token_publico is 'Token opaco para el enlace público de solo lectura. La resolución pública se hace en el servidor con la service role, nunca con una política RLS para anon.';

create index presupuestos_user_id_idx on public.presupuestos (user_id);

create index presupuestos_obra_id_idx on public.presupuestos (obra_id);

alter table public.presupuestos enable row level security;
alter table public.presupuestos force row level security;

create policy presupuestos_all on public.presupuestos
for all
to authenticated
using ((select auth.uid ()) = user_id)
with
  check ((select auth.uid ()) = user_id);

create table public.capitulos (
  id bigint generated always as identity primary key,
  presupuesto_id bigint not null references public.presupuestos (id) on delete cascade,
  nombre text not null,
  posicion integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (presupuesto_id, posicion)
);

create index capitulos_presupuesto_id_idx on public.capitulos (presupuesto_id);

alter table public.capitulos enable row level security;
alter table public.capitulos force row level security;

create policy capitulos_all on public.capitulos
for all
to authenticated
using (
  exists (
    select
      1
    from
      public.presupuestos p
    where
      p.id = capitulos.presupuesto_id
      and p.user_id = (select auth.uid ())
  )
)
with
  check (
    exists (
      select
        1
      from
        public.presupuestos p
      where
        p.id = capitulos.presupuesto_id
        and p.user_id = (select auth.uid ())
    )
  );

create table public.partidas (
  id bigint generated always as identity primary key,
  capitulo_id bigint not null references public.capitulos (id) on delete cascade,
  trabajo_id bigint references public.trabajos (id) on delete set null,
  descripcion text not null,
  unidad text not null check (
    unidad in ('m2', 'ml', 'ud', 'h')
  ),
  medicion numeric(10, 2) not null check (medicion > 0),
  importe_materiales numeric(12, 2) not null default 0,
  importe_mano_obra numeric(12, 2) not null default 0,
  precio_unitario numeric(12, 2) not null default 0,
  importe numeric(12, 2) not null default 0,
  posicion integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (capitulo_id, posicion)
);

comment on column public.partidas.trabajo_id is 'NULL = partida personalizada sin trabajo de catálogo asociado (estado válido).';

create index partidas_capitulo_id_idx on public.partidas (capitulo_id);

create index partidas_trabajo_id_idx on public.partidas (trabajo_id);

alter table public.partidas enable row level security;
alter table public.partidas force row level security;

create policy partidas_all on public.partidas
for all
to authenticated
using (
  exists (
    select
      1
    from
      public.capitulos c
      join public.presupuestos p on p.id = c.presupuesto_id
    where
      c.id = partidas.capitulo_id
      and p.user_id = (select auth.uid ())
  )
)
with
  check (
    exists (
      select
        1
      from
        public.capitulos c
        join public.presupuestos p on p.id = c.presupuesto_id
      where
        c.id = partidas.capitulo_id
        and p.user_id = (select auth.uid ())
    )
  );

-- Desglose congelado de materiales de cada partida (snapshot de precio y nombre)
create table public.partida_materiales (
  id bigint generated always as identity primary key,
  partida_id bigint not null references public.partidas (id) on delete cascade,
  material_id bigint references public.materiales (id) on delete set null,
  material_nombre text not null,
  cantidad numeric(10, 4) not null check (cantidad > 0),
  precio_unitario numeric(10, 2) not null check (precio_unitario >= 0),
  importe numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

comment on column public.partida_materiales.material_nombre is 'Nombre congelado en el momento de crear la partida: el presupuesto no cambia si el material se renombra o se borra del catálogo.';

create index partida_materiales_partida_id_idx on public.partida_materiales (partida_id);

create index partida_materiales_material_id_idx on public.partida_materiales (material_id);

alter table public.partida_materiales enable row level security;
alter table public.partida_materiales force row level security;

create policy partida_materiales_all on public.partida_materiales
for all
to authenticated
using (
  exists (
    select
      1
    from
      public.partidas pa
      join public.capitulos c on c.id = pa.capitulo_id
      join public.presupuestos p on p.id = c.presupuesto_id
    where
      pa.id = partida_materiales.partida_id
      and p.user_id = (select auth.uid ())
  )
)
with
  check (
    exists (
      select
        1
      from
        public.partidas pa
        join public.capitulos c on c.id = pa.capitulo_id
        join public.presupuestos p on p.id = c.presupuesto_id
      where
        pa.id = partida_materiales.partida_id
        and p.user_id = (select auth.uid ())
    )
  );

-- Desglose congelado de mano de obra de cada partida (snapshot de tarifa)
create table public.partida_mano_obra (
  id bigint generated always as identity primary key,
  partida_id bigint not null references public.partidas (id) on delete cascade,
  rol text not null check (rol in ('oficial', 'peon')),
  horas numeric(10, 4) not null check (horas > 0),
  precio_hora numeric(10, 2) not null check (precio_hora >= 0),
  importe numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  unique (partida_id, rol)
);

create index partida_mano_obra_partida_id_idx on public.partida_mano_obra (partida_id);

alter table public.partida_mano_obra enable row level security;
alter table public.partida_mano_obra force row level security;

create policy partida_mano_obra_all on public.partida_mano_obra
for all
to authenticated
using (
  exists (
    select
      1
    from
      public.partidas pa
      join public.capitulos c on c.id = pa.capitulo_id
      join public.presupuestos p on p.id = c.presupuesto_id
    where
      pa.id = partida_mano_obra.partida_id
      and p.user_id = (select auth.uid ())
  )
)
with
  check (
    exists (
      select
        1
      from
        public.partidas pa
        join public.capitulos c on c.id = pa.capitulo_id
        join public.presupuestos p on p.id = c.presupuesto_id
      where
        pa.id = partida_mano_obra.partida_id
        and p.user_id = (select auth.uid ())
    )
  );

-- ============================================================================
-- 7. updated_at automático
-- ============================================================================

create function public.set_updated_at () returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before
update on public.perfiles for each row
execute function public.set_updated_at ();

create trigger set_updated_at before
update on public.clientes for each row
execute function public.set_updated_at ();

create trigger set_updated_at before
update on public.obras for each row
execute function public.set_updated_at ();

create trigger set_updated_at before
update on public.materiales for each row
execute function public.set_updated_at ();

create trigger set_updated_at before
update on public.precios_usuario for each row
execute function public.set_updated_at ();

create trigger set_updated_at before
update on public.trabajos for each row
execute function public.set_updated_at ();

create trigger set_updated_at before
update on public.presupuestos for each row
execute function public.set_updated_at ();

create trigger set_updated_at before
update on public.capitulos for each row
execute function public.set_updated_at ();

create trigger set_updated_at before
update on public.partidas for each row
execute function public.set_updated_at ();

-- ============================================================================
-- 8. Alta de perfil automática al registrarse (Supabase Auth)
-- ============================================================================

create function public.handle_new_user () returns trigger language plpgsql security definer
set
  search_path = '' as $$
begin
  insert into public.perfiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row
execute function public.handle_new_user ();

-- ============================================================================
-- 9. Grants explícitos
--
-- RLS restringe FILAS, no si el rol puede tocar la tabla en absoluto: sin
-- estos GRANT, "authenticated" recibe "permission denied" aunque las
-- políticas sean correctas. Se declaran aquí en vez de asumir privilegios
-- por defecto del proyecto (los catálogos globales son solo lectura: los
-- mantiene service_role, que se salta RLS).
-- ============================================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.perfiles to authenticated;

grant select, insert, update, delete on public.clientes to authenticated;

grant select, insert, update, delete on public.obras to authenticated;

grant select, insert, update, delete on public.precios_usuario to authenticated;

grant select, insert, update, delete on public.presupuestos to authenticated;

grant select, insert, update, delete on public.capitulos to authenticated;

grant select, insert, update, delete on public.partidas to authenticated;

grant select, insert, update, delete on public.partida_materiales to authenticated;

grant select, insert, update, delete on public.partida_mano_obra to authenticated;

grant select on public.materiales to authenticated;

grant select on public.trabajos to authenticated;

grant select on public.trabajo_materiales to authenticated;

grant select on public.trabajo_mano_obra to authenticated;
