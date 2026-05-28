# Supabase Setup — Manual

Guía paso a paso para crear el schema de la app en Supabase desde el SQL Editor del dashboard, y luego conectarlo al frontend.

Cada paso es un bloque independiente — ejecutalo, verificá que no haya errores, y avísame para que agregue/pulamos el siguiente.

## Roadmap

**Backend (schema + seguridad)**

- [x] Paso 1 — Extensiones y tipos enum
- [x] Paso 2 — `profiles` + trigger `handle_new_user`
- [x] Paso 3 — `households`
- [x] Paso 4 — `memberships`
- [x] Paso 5 — Helper `is_member_of` para RLS
- [x] Paso 6 — `categories`
- [x] Paso 7 — `expenses`
- [x] Paso 8 — `bills`
- [x] Paso 9 — Policies de RLS en todas las tablas
- [x] Paso 10 — Vista `categories_with_spent`
- [x] Paso 11 — Habilitar Realtime

**Conectar el frontend**

- [x] Paso 12 — Variables de entorno (URL + anon key)
- [x] Paso 13 — Instalar `@supabase/supabase-js` + cliente singleton
- [x] Paso 14 — Auth flow (sign up / sign in / sign out)
- [x] Paso 15 — Reemplazar `householdStore` mock con queries reales
- [ ] Paso 16 — Reemplazar `budgetStore` mock con queries reales (categories, expenses, bills)
- [ ] Paso 17 — Suscripciones Realtime para updates en vivo entre miembros

---

## Paso 1 — Extensiones y tipos enum  *(completado)*

Esto debe correr primero porque las tablas siguientes usan `gen_random_uuid()` (de `pgcrypto`) y los enums `membership_role` y `currency_code`.

```sql
create extension if not exists "pgcrypto";

create type membership_role as enum ('owner', 'member');
create type currency_code  as enum ('USD','CRC');

```

**Cómo verificar que funcionó**:

```sql
-- Debe devolver dos filas: membership_role y currency_code
select typname from pg_type
where typname in ('membership_role', 'currency_code');
```

---

## Paso 2 — `profiles` (extiende `auth.users`)  *(completado)*

Supabase ya tiene la tabla `auth.users` (gestionada por su sistema de Auth). No la tocamos. En su lugar creamos `public.profiles` con FK 1-a-1 hacia `auth.users.id`, donde guardamos los campos visibles de cada usuario (`name`, `email`, `accent`).

El trigger `handle_new_user` crea automáticamente un row en `profiles` cada vez que alguien se registra, así no hay que hacerlo manualmente desde el cliente.

```sql
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  accent      text not null default 'violet',
  created_at  timestamptz not null default now()
);

-- Crea profile automáticamente al registrarse un usuario
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

**Cómo verificar que funcionó**:

```sql
-- Debe devolver las columnas de la tabla profiles
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'profiles'
order by ordinal_position;

-- Debe devolver el trigger
select trigger_name, event_object_table
from information_schema.triggers
where trigger_name = 'on_auth_user_created';
```

**Cómo probar el trigger end-to-end** (opcional pero recomendado):

1. Andá a *Authentication → Users → Add user → Create new user*
2. Llená email + password de prueba (ej. `test@example.com`)
3. Volvé al SQL Editor y corré:
   ```sql
   select * from public.profiles where email = 'test@example.com';
   ```
   Si aparece la fila, el trigger funciona. Después podés borrar ese usuario de prueba desde *Authentication*.

---

## Paso 3 — `households`  *(completado)*

Cada household es un budget compartido (ej. "Casa", "Viaje a Japón"). Tiene una moneda y un creador.

- `created_by` apunta a `profiles.id`, no a `auth.users.id`. Esto fuerza que el creador exista como profile antes de crear el household.
- `on delete restrict` en `created_by` evita borrar un perfil que sea creador de algún household sin antes resolverlo (no permite huérfanos).
- `currency` usa el enum `currency_code` que creamos en el Paso 1 (`USD` o `CRC`).

```sql
create table public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  currency    currency_code not null default 'CRC',
  created_by  uuid not null references public.profiles(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create index households_created_by_idx on public.households(created_by);
```

> No olvides habilitar RLS cuando Supabase te muestre el warning, igual que con `profiles`.

**Cómo verificar que funcionó**:

```sql
-- Debe devolver las columnas de la tabla households
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'households'
order by ordinal_position;

-- Debe mostrar el índice creado
select indexname from pg_indexes
where schemaname = 'public' and tablename = 'households';
```

**Cómo probar end-to-end** (opcional):

Si aún tenés un user de prueba en Authentication (o creá uno nuevo), podés insertar manualmente un household:

```sql
-- Necesitas el id de un profile. Sacalo así:
select id, name, email from public.profiles limit 1;

-- Después insertá un household reemplazando <profile_id>:
insert into public.households (name, currency, created_by)
values ('Test budget', 'CRC', '<profile_id>')
returning *;
```

Si devuelve la fila con un `id` UUID generado, funcionó. Podés borrarlo después con:
```sql
delete from public.households where name = 'Test budget';
```

---

## Paso 4 — `memberships`  *(completado)*

Tabla puente que conecta `profiles` con `households` y guarda el rol (`owner` o `member`). Es la clave para saber quién pertenece a qué budget compartido.

Detalles del diseño:

- **Primary key compuesta** `(household_id, user_id)` — un user no puede tener dos roles en el mismo household. Si intentas insertar el mismo par dos veces, Postgres lo rechaza automáticamente.
- **Ambas FKs con `on delete cascade`** — si se borra un household, todas sus memberships desaparecen; lo mismo si se borra un profile. Esto evita filas huérfanas que apuntan a nada.
- **`role` usa el enum `membership_role`** (`owner` o `member`) creado en el Paso 1. Default es `member` — al owner lo seteamos explícitamente cuando se crea el household.
- **Dos índices**: `memberships_user_idx` acelera "dame todos los budgets de este user" (lo más común — pantalla de Settings, picker de households); `memberships_household_idx` acelera "dame todos los miembros de este budget" (modal de Manage budget).

```sql
create table public.memberships (
  household_id  uuid not null references public.households(id) on delete cascade,
  user_id       uuid not null references public.profiles(id)   on delete cascade,
  role          membership_role not null default 'member',
  joined_at     timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index memberships_user_idx      on public.memberships(user_id);
create index memberships_household_idx on public.memberships(household_id);
```

> No olvides habilitar RLS cuando Supabase te muestre el warning.

**Cómo verificar que funcionó**:

```sql
-- Debe devolver las 4 columnas con sus tipos
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'memberships'
order by ordinal_position;

-- Debe mostrar el PK compuesto + los dos índices
select indexname, indexdef from pg_indexes
where schemaname = 'public' and tablename = 'memberships';
```

**Cómo probar end-to-end** (opcional):

Si todavía tenés el "Test budget" del Paso 3, agreguemos a su creador como owner:

```sql
-- Sacar el household y el profile creador
select h.id as household_id, h.name, h.created_by, p.email
from public.households h
join public.profiles p on p.id = h.created_by
where h.name = 'Test budget';

-- Insertar la membership como owner (reemplazá los UUIDs)
insert into public.memberships (household_id, user_id, role)
values ('<household_id>', '<created_by>', 'owner')
returning *;

-- Ver el resultado: el user debería aparecer como owner del Test budget
select m.role, m.joined_at, p.name, p.email, h.name as budget
from public.memberships m
join public.profiles p on p.id = m.user_id
join public.households h on h.id = m.household_id
where h.name = 'Test budget';
```

Si querés probar que el PK compuesto bloquea duplicados, corré el `insert` dos veces — el segundo debería fallar con un error `duplicate key value violates unique constraint`.

---

## Paso 5 — Helper `is_member_of` para RLS  *(completado)*

Función SQL que recibe un `household_id` y devuelve `true` si el usuario autenticado actual (`auth.uid()`) es miembro de ese household, `false` si no.

**Por qué la necesitamos antes de las policies**: cuando en el Paso 9 escribamos policies como "solo miembros del household pueden ver sus expenses", esas policies van a consultar la tabla `memberships`. Pero `memberships` también va a tener su propia RLS policy que verifica membresía → bucle infinito. Marcando esta función como `security definer` la hacemos correr con los privilegios del owner del DB (postgres), saltándose RLS, y rompemos la recursión.

Detalles del diseño:

- **`language sql`** — es una función simple de un solo select, no necesitamos PL/pgSQL.
- **`security definer`** — clave para evitar la recursión. Hace que la función ignore las policies de RLS al consultar `memberships`.
- **`stable`** — le dice a Postgres que la función devuelve el mismo resultado dentro de una misma query, así puede cachear el resultado y no recalcularlo por cada fila.
- **`set search_path = public`** — práctica de seguridad recomendada para funciones `security definer`. Evita ataques donde alguien crea un schema malicioso y manipula qué tabla se resuelve.
- **Retorna `boolean`** — se va a usar en clauses tipo `using (public.is_member_of(household_id))` en el Paso 9.

```sql
create or replace function public.is_member_of(h_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where household_id = h_id and user_id = auth.uid()
  );
$$;
```

> Esta no es una tabla, es una función — no aplica el warning de RLS.

**Cómo verificar que funcionó**:

```sql
-- Debe devolver la función con sus atributos
select proname, prosrc, prosecdef, provolatile
from pg_proc
where proname = 'is_member_of' and pronamespace = 'public'::regnamespace;
-- prosecdef = true significa security definer
-- provolatile = 's' significa stable

-- Llamarla con un UUID random debe devolver false sin error
select public.is_member_of('00000000-0000-0000-0000-000000000000'::uuid);
```

**Nota importante sobre cómo se va a comportar desde el SQL Editor**:

Cuando corras esta función en el SQL Editor, internamente Supabase te autentica como el rol `postgres` (admin), no como un user normal. Eso significa que `auth.uid()` dentro de la función va a devolver `NULL`, y por lo tanto la función va a devolver `false` para cualquier `household_id` que le pases (ningún row en `memberships` tiene `user_id = NULL`).

Eso está **correcto** — solo significa que no podés probar `is_member_of` de manera realista desde el SQL Editor. La prueba real va a venir en el Paso 9 cuando armemos las policies, y especialmente cuando conectemos el frontend en los Pasos 12+ y las queries pasen autenticadas como un user real.

Si querés simular una sesión de user para probar manualmente, podés hacer:

```sql
-- Simular que sos un user específico (reemplazá el UUID con un profile real)
set local request.jwt.claim.sub = '<profile_uuid>';

-- Ahora is_member_of debería devolver true para los households donde sos miembro
select h.name, public.is_member_of(h.id) as soy_miembro
from public.households h;

-- Restaurar
reset request.jwt.claim.sub;
```

---

## Paso 6 — `categories`  *(completado)*

Categorías de gasto por household (`Food`, `Transport`, etc.). A diferencia del mock actual donde los IDs son globales (`'food'`, `'transport'`), en Supabase cada household tiene **su propio set de categorías** con UUIDs únicos. Así, si Edan y Pareja tienen el budget "Casa" y Edan también tiene "Viaje a Japón", cada uno puede tener categorías totalmente distintas.

Detalles del diseño:

- **`household_id` con `on delete cascade`** — si se borra un household, todas sus categorías desaparecen.
- **No hay columna `spent`** — el gastado es derivado (suma de `expenses` de esa categoría). En el Paso 10 creamos una vista `categories_with_spent` que lo expone como si fuera columna. Mantenerlo derivado evita problemas de consistencia (triggers que se desincronizan, dobles updates, etc.).
- **`icon_key` y `accent` son `text` libre**, no enums. Esto da flexibilidad para agregar nuevos íconos/colores sin tener que correr una migration por cada uno. La validación de qué íconos/colores son válidos vive en el cliente.
- **`budgeted numeric(12,2)`** — dinero NUNCA debe ser `float`/`real` (precisión binaria genera errores tipo `0.1 + 0.2 = 0.30000000000000004`). `numeric(12,2)` permite hasta 9,999,999,999.99 con precisión decimal exacta. Para presupuestos personales es overkill pero es práctica estándar.
- **`check (budgeted >= 0)`** — constraint a nivel DB para que nadie meta presupuestos negativos por accidente.
- **Índice por `household_id`** — la query más frecuente es "dame todas las categorías de este budget".

```sql
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  name          text not null,
  icon_key      text not null,
  accent        text not null,
  budgeted      numeric(12,2) not null check (budgeted >= 0),
  created_at    timestamptz not null default now()
);

create index categories_household_idx on public.categories(household_id);
```

> No olvides habilitar RLS cuando Supabase te muestre el warning.

**Cómo verificar que funcionó**:

```sql
-- Debe devolver las 7 columnas con sus tipos
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'categories'
order by ordinal_position;

-- Debe mostrar el índice
select indexname, indexdef from pg_indexes
where schemaname = 'public' and tablename = 'categories';

-- Verificar el check constraint
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.categories'::regclass and contype = 'c';
```

**Cómo probar end-to-end** (opcional):

Si todavía tenés el "Test budget" del Paso 3, sembrá un par de categorías para probarlo:

```sql
-- Sacar el id del Test budget
select id from public.households where name = 'Test budget';

-- Insertar categorías (reemplazá <household_id>)
insert into public.categories (household_id, name, icon_key, accent, budgeted)
values
  ('<household_id>', 'Food',          'food',      'coral',  150000),
  ('<household_id>', 'Transport',     'transport', 'sky',     50000),
  ('<household_id>', 'Entertainment', 'fun',       'violet',  30000)
returning *;

-- Listarlas para confirmar
select c.name, c.budgeted, c.accent, c.icon_key
from public.categories c
join public.households h on h.id = c.household_id
where h.name = 'Test budget'
order by c.name;
```

Probá también que el check constraint funciona — esto debería **fallar**:
```sql
insert into public.categories (household_id, name, icon_key, accent, budgeted)
values ('<household_id>', 'Broken', 'home', 'mint', -100);
-- Error: new row violates check constraint "categories_budgeted_check"
```

---

## Paso 7 — `expenses`  *(completado)*

Tabla principal de gastos. Cada row representa un gasto individual hecho por algún miembro del household, asociado a una categoría.

Detalles del diseño:

- **Tres foreign keys**, cada una con distinto comportamiento al borrar:
  - **`household_id` con `cascade`** — si se borra el household entero, sus gastos se van con él (no tiene sentido conservarlos huérfanos).
  - **`category_id` con `restrict`** — no se puede borrar una categoría que tenga gastos. Esto fuerza al usuario a o bien borrar primero los gastos o reasignarlos. Es más seguro que `cascade` (no perdés histórico) y más estricto que `set null` (no quedan gastos sin clasificar).
  - **`paid_by_id` con `restrict`** — no se puede borrar un profile que tenga gastos asociados. Protege la integridad del historial: nadie aparece "gastando nada" porque su user se borró.

- **`household_id` duplicado** aunque ya está implícito vía `category_id` (cada categoría pertenece a un household). Lo guardamos redundante por dos razones: (1) las RLS policies del Paso 9 pueden filtrar por `household_id` sin necesidad de hacer join contra `categories` en cada query — más rápido, (2) los índices por household son la query más común (Activity feed) y son directos.

- **`amount` con `check (amount > 0)`** — no permitimos gastos de cero ni negativos. Si alguien quiere registrar un ingreso o devolución, eso sería una entidad distinta (futuro feature).

- **`note text not null default ''`** — la descripción es opcional pero la columna no es nullable. Tener `''` en lugar de `NULL` simplifica las queries del cliente (no hay que andar haciendo `note ?? ''`).

- **Tres índices**:
  - `expenses_household_idx` — para "todos los gastos de este budget" (Activity feed)
  - `expenses_category_idx` — para el filtro por categoría que armamos en el cliente, y para la vista `categories_with_spent` del Paso 10
  - `expenses_created_idx` con `desc` — el feed siempre se muestra del más reciente al más viejo, así que indexar en orden descendente permite que la query no necesite ordenar

```sql
create table public.expenses (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  category_id   uuid not null references public.categories(id) on delete restrict,
  paid_by_id    uuid not null references public.profiles(id)   on delete restrict,
  amount        numeric(12,2) not null check (amount > 0),
  note          text not null default '',
  created_at    timestamptz not null default now()
);

create index expenses_household_idx on public.expenses(household_id);
create index expenses_category_idx  on public.expenses(category_id);
create index expenses_created_idx   on public.expenses(created_at desc);
```

> No olvides habilitar RLS cuando Supabase te muestre el warning.

**Cómo verificar que funcionó**:

```sql
-- Debe devolver las 7 columnas con sus tipos
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'expenses'
order by ordinal_position;

-- Debe mostrar los 3 índices + el PK
select indexname, indexdef from pg_indexes
where schemaname = 'public' and tablename = 'expenses';

-- Ver las FKs con su política de delete
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.expenses'::regclass and contype = 'f';
```

**Cómo probar end-to-end** (opcional):

Sembramos algunos gastos en el "Test budget", asociados a las categorías que creaste en el Paso 6:

```sql
-- Necesitamos: household_id, category_id (de una o más categorías), y paid_by_id (un profile)
select h.id as household_id, c.id as category_id, c.name as category, p.id as profile_id, p.name
from public.households h
join public.categories c on c.household_id = h.id
join public.memberships m on m.household_id = h.id
join public.profiles p on p.id = m.user_id
where h.name = 'Test budget';

-- Reemplazá los UUIDs con los que te devolvió la query anterior
insert into public.expenses (household_id, category_id, paid_by_id, amount, note)
values
  ('<household_id>', '<food_cat_id>',      '<profile_id>', 12500, 'Almuerzo'),
  ('<household_id>', '<food_cat_id>',      '<profile_id>',  3200, ''),
  ('<household_id>', '<transport_cat_id>', '<profile_id>',  1500, 'Bus al trabajo')
returning *;

-- Listar los gastos del Test budget, del más reciente al más viejo
select e.created_at, c.name as categoria, p.name as pagado_por, e.amount, e.note
from public.expenses e
join public.categories c on c.id = e.category_id
join public.profiles p on p.id = e.paid_by_id
where e.household_id = '<household_id>'
order by e.created_at desc;
```

Probá los constraints:

```sql
-- Esto debería fallar (amount = 0)
insert into public.expenses (household_id, category_id, paid_by_id, amount)
values ('<household_id>', '<category_id>', '<profile_id>', 0);

-- Esto también debería fallar: intentar borrar una categoría con gastos
delete from public.categories where id = '<food_cat_id>';
-- Error: update or delete on table "categories" violates foreign key constraint
```

---

## Paso 8 — `bills`  *(completado)*

Cuentas recurrentes del household (Internet, luz, agua, streaming, etc.). Conceptualmente son distintas a los `expenses` porque se repiten cada mes y tienen un día de vencimiento fijo, mientras que los expenses son eventos puntuales.

Detalles del diseño:

- **`household_id` con `cascade`** — si se borra el household, las bills se van con él.
- **No tiene FK a `categories`** intencionalmente — las bills tienen su propio espacio visual en el Dashboard (sección "Bills" separada de "Categories") y no se restan del presupuesto de ninguna categoría en el modelo actual. Si en el futuro querés que una bill afecte el `spent` de una categoría, agregamos un `category_id` opcional.
- **`icon_key` y `accent`** funcionan igual que en `categories` — text libre para flexibilidad.
- **`due_day int check between 1 and 31`** — el día del mes (1-31) en que vence la bill. Ojo: no validamos cosas tipo "febrero no tiene día 31", el cliente debe manejar esa lógica al mostrar la próxima fecha de vencimiento.
- **`amount >= 0`** (en lugar de `> 0` como en expenses) — una bill podría conceptualmente ser de 0 en algún mes (ej. agua incluida ese mes en otra cuenta).
- **`status text check in ('paid','pending')`** — usamos un check constraint en lugar de un enum porque solo son dos valores y es más fácil agregar más estados en el futuro (ej. `'overdue'`) con un simple `alter table ... drop constraint ... add constraint`. Default `'pending'`.
- **Un solo índice por `household_id`** — la query típica es "todas las bills del budget activo"; no hay tantas bills como expenses así que no necesitamos más.

> **Limitación conocida del modelo actual**: este diseño guarda **un solo `status` por bill**, no histórico por mes. Esto refleja el mock actual y funciona para una vista mensual simple, pero si más adelante querés ver "¿pagamos el internet en marzo?" vas a necesitar otra tabla `bill_payments` con `bill_id`, `month`, `status`. Por ahora seguimos lo del mock.

```sql
create table public.bills (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  name          text not null,
  icon_key      text not null,
  accent        text not null,
  amount        numeric(12,2) not null check (amount >= 0),
  due_day       int  not null check (due_day between 1 and 31),
  status        text not null default 'pending' check (status in ('paid','pending')),
  created_at    timestamptz not null default now()
);

create index bills_household_idx on public.bills(household_id);
```

> No olvides habilitar RLS cuando Supabase te muestre el warning.

**Cómo verificar que funcionó**:

```sql
-- Debe devolver las 8 columnas
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'bills'
order by ordinal_position;

-- Debe mostrar los check constraints (due_day y status)
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.bills'::regclass and contype = 'c';
```

**Cómo probar end-to-end** (opcional):

Sembramos las bills típicas del mock en el "Test budget":

```sql
-- Sacar el household id
select id from public.households where name = 'Test budget';

-- Reemplazá <household_id> con el UUID
insert into public.bills (household_id, name, icon_key, accent, amount, due_day, status)
values
  ('<household_id>', 'Internet',    'wifi',       'sky',     27500,  3, 'paid'),
  ('<household_id>', 'Electricity', 'zap',        'amber',   46000,  8, 'paid'),
  ('<household_id>', 'Water',       'droplets',   'mint',    19000, 22, 'pending'),
  ('<household_id>', 'Streaming',   'tv',         'violet',  12000, 27, 'pending')
returning *;

-- Listarlas en orden de vencimiento
select name, amount, due_day, status
from public.bills
where household_id = '<household_id>'
order by due_day;
```

Probá que los check constraints funcionan:

```sql
-- due_day inválido (32) — debería fallar
insert into public.bills (household_id, name, icon_key, accent, amount, due_day)
values ('<household_id>', 'Bad', 'home', 'mint', 1000, 32);

-- status inválido — debería fallar
insert into public.bills (household_id, name, icon_key, accent, amount, due_day, status)
values ('<household_id>', 'Bad', 'home', 'mint', 1000, 5, 'overdue');
```

---

## Paso 9 — Policies de RLS en todas las tablas  *(completado)*

### ¿Qué es Row Level Security?

**RLS (Row Level Security)** es un sistema de Postgres que aplica **filtros automáticos a nivel de fila** cada vez que alguien consulta una tabla. En lugar de confiar en que el cliente filtre bien (`where user_id = me`), la base de datos rechaza filas que no le corresponden al usuario que pregunta — sin importar cómo se haya escrito la query.

Es la diferencia entre:

- **Sin RLS**: la API expone TODAS las filas. Si un cliente malintencionado o un bug del frontend olvida un `where`, ve datos de otros usuarios.
- **Con RLS**: la base ignora silenciosamente las filas que el user no debe ver. Aunque alguien haga `select * from expenses` desde la consola, solo recibe las que sus policies permiten.

**Por qué importa especialmente en Supabase**: tu app cliente (móvil/web) se conecta a Supabase con la `anon key`, una clave pública que cualquiera puede leer inspeccionando el bundle. Sin RLS, esa key permitiría leer/escribir cualquier fila. RLS es **la única capa de seguridad** entre tu DB y el internet.

**Cómo funciona una policy**:

```sql
create policy "<nombre>" on <tabla>
  for <select|insert|update|delete|all>
  using (<expresión booleana>)
  with check (<expresión booleana>);
```

- `using` — se evalúa al **leer/borrar/actualizar** filas existentes. Si devuelve `false` para una fila, esa fila no se ve.
- `with check` — se evalúa al **escribir** filas nuevas (insert o el estado post-update). Si devuelve `false`, la operación falla.
- La expresión típicamente referencia `auth.uid()` (el UUID del usuario autenticado) y/o joins/subqueries.

**Conceptos clave para entender las policies que siguen**:

- **`auth.uid()`** — función global que devuelve el UUID del usuario autenticado en la sesión actual. Si no hay sesión (ej. cliente con anon key sin login), devuelve `NULL`.
- **`public.is_member_of(h_id)`** — el helper que creamos en el Paso 5. Lo usamos en las policies de las tablas hijas (`categories`, `expenses`, `bills`) para evitar joins repetitivos.
- **Importante**: cuando corras estas policies en el SQL Editor de Supabase, NO vas a ver el efecto. El editor te autentica como `postgres` (superuser), que **bypassea RLS** por completo. La verificación real viene cuando conectemos el cliente.

---

### 9.1 — Habilitar RLS en todas las tablas

Si hiciste click en el warning de Supabase al crear cada tabla, RLS ya está habilitado en esas. Este bloque es **idempotente** — re-ejecutarlo no rompe nada y te garantiza el estado correcto:

```sql
alter table public.profiles    enable row level security;
alter table public.households  enable row level security;
alter table public.memberships enable row level security;
alter table public.categories  enable row level security;
alter table public.expenses    enable row level security;
alter table public.bills       enable row level security;
```

**Cómo verificar**:

```sql
-- rowsecurity = true en todas las tablas
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

---

### 9.2 — Policies de `profiles`

**Regla**:
- Podés ver tu propio profile **y** el de cualquier persona con quien compartas un household (sin esto no podrías mostrar el nombre/avatar del que pagó un gasto).
- Solo podés editar tu propio profile.
- Nadie inserta profiles manualmente — el trigger `handle_new_user` lo hace en signup, y como corre con `security definer` bypassea RLS.

```sql
-- Ver: a mí mismo o a miembros de mis households
create policy "profiles_self_read" on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1 from public.memberships m1
      join public.memberships m2 on m1.household_id = m2.household_id
      where m1.user_id = auth.uid() and m2.user_id = profiles.id
    )
  );

-- Editar: solo mi propio profile
create policy "profiles_self_update" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());
```

> `with check` impide que en el UPDATE alguien cambie el `id` del row para "convertirse" en otro user.

---

### 9.3 — Policies de `households`

**Regla**:
- Ver un household: si sos miembro.
- Crear: cualquier user autenticado, y `created_by` debe ser igual a vos (no podés crear un budget "a nombre" de otra persona).
- Actualizar (renombrar, cambiar currency): solo el owner.
- Borrar: solo el creador original (`created_by`). Tener role `owner` no es suficiente para borrar — solo el que lo creó tiene esa autoridad.

```sql
-- El `or created_by = auth.uid()` es necesario para que el INSERT ... RETURNING
-- (que hace supabase-js con .insert().select()) pueda devolver la fila recién
-- creada ANTES de que exista la membership del creador.
create policy "households_read" on public.households
  for select using (
    public.is_member_of(id) or created_by = auth.uid()
  );

create policy "households_insert" on public.households
  for insert with check (created_by = auth.uid());

create policy "households_update" on public.households
  for update using (
    exists (
      select 1 from public.memberships
      where household_id = households.id
        and user_id = auth.uid()
        and role = 'owner'
    )
  );

create policy "households_delete" on public.households
  for delete using (created_by = auth.uid());
```

---

### 9.4 — Policies de `memberships`

Esta es la más delicada por dos razones: (1) tiene un caso bootstrap (al crear un household, el creator se agrega a sí mismo como owner cuando todavía no es miembro de nada), (2) el insert de un owner puede tocar la tabla recursivamente.

**Regla**:
- Ver una membership: la tuya, o la de cualquier miembro de uno de tus households (para mostrar la lista de miembros en "Manage budget").
- Insertar: o bien sos owner del household y agregás a alguien, o bien estás creándote a vos mismo como owner (caso bootstrap del creator).
- Borrar: te podés salir vos mismo, o un owner te puede sacar a vos.
- **UPDATE no permitido por ahora** — para cambiar un rol, borrá y volvé a insertar. Esto evita edge cases tipo "el último owner se degrada a member y deja el household sin owners".

```sql
create policy "memberships_read" on public.memberships
  for select using (
    user_id = auth.uid() or public.is_member_of(household_id)
  );

create policy "memberships_insert" on public.memberships
  for insert with check (
    -- Caso normal: soy owner del household y agrego a otro
    exists (
      select 1 from public.memberships m
      where m.household_id = memberships.household_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
    -- Caso bootstrap: me estoy creando a mí mismo como owner (justo después de crear el household)
    or (user_id = auth.uid() and role = 'owner')
  );

create policy "memberships_delete" on public.memberships
  for delete using (
    -- Me puedo sacar a mí mismo
    user_id = auth.uid()
    -- O un owner del household me puede sacar
    or exists (
      select 1 from public.memberships m
      where m.household_id = memberships.household_id
        and m.user_id = auth.uid()
        and m.role = 'owner'
    )
  );
```

---

### 9.5 — Policies de `categories`, `expenses`, `bills`

Para estas tres tablas la regla es la misma y mucho más simple: **cualquier miembro del household puede hacer cualquier cosa** (CRUD completo). Usamos `is_member_of` para no repetir el join.

```sql
create policy "categories_all" on public.categories
  for all
  using (public.is_member_of(household_id))
  with check (public.is_member_of(household_id));

create policy "expenses_all" on public.expenses
  for all
  using (public.is_member_of(household_id))
  with check (public.is_member_of(household_id));

create policy "bills_all" on public.bills
  for all
  using (public.is_member_of(household_id))
  with check (public.is_member_of(household_id));
```

> `for all` es atajo para SELECT + INSERT + UPDATE + DELETE con la misma condición. Si más adelante querés diferenciar (ej. "solo owners pueden borrar gastos ajenos"), partís esta policy en cuatro.

---

### Cómo verificar todas las policies creadas

```sql
-- Listado de todas las policies por tabla
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

Deberías ver **12 policies** en total:

| Tabla | Policies |
|---|---|
| profiles | `profiles_self_read`, `profiles_self_update` |
| households | `households_read`, `households_insert`, `households_update`, `households_delete` |
| memberships | `memberships_read`, `memberships_insert`, `memberships_delete` |
| categories | `categories_all` |
| expenses | `expenses_all` |
| bills | `bills_all` |

### Cómo probar que las policies funcionan de verdad

Como te mencioné arriba, el SQL Editor corre como `postgres` y **bypassea RLS**. Para simular ser un user real y validar las policies, hay dos opciones:

**Opción A — Simular sesión desde el SQL Editor** (rápido, manual):

```sql
-- Sacar el UUID de un profile real (ej. tu user de prueba)
select id, email from public.profiles;

-- Simular que sos ese user (reemplazá el UUID)
set local role authenticated;
set local request.jwt.claim.sub = '<profile_uuid>';

-- Probar: deberías ver solo los households donde sos miembro
select * from public.households;

-- Probar: deberías ver solo los expenses de tus households
select * from public.expenses;

-- Probar: insertar un household con created_by distinto a vos debería fallar
insert into public.households (name, currency, created_by)
values ('Hack', 'CRC', '00000000-0000-0000-0000-000000000000');
-- Error esperado: new row violates row-level security policy

-- Restaurar
reset role;
reset request.jwt.claim.sub;
```

**Opción B — Probar con el cliente real**: cuando lleguemos al Paso 13-14 y conectes el frontend con un user logueado, todas las queries van a respetar RLS automáticamente. Si algo está mal, vas a ver el error en consola.

---

> **Importante antes de seguir**: si en pasos anteriores creaste el "Test budget" + categories + expenses + bills siendo `postgres`, esas filas tienen `created_by`/`paid_by_id` apuntando a un profile que existe (el de tu user de prueba en Authentication). Después de habilitar RLS, esas filas **siguen ahí en la DB**, pero solo serán visibles cuando alguien se autentique como ese user específico. Si no las ves desde el cliente, no significa que se borraron — significa que RLS está funcionando.

---

## Paso 10 — Vista `categories_with_spent`  *(completado)*

### ¿Qué es una vista y por qué necesitamos una acá?

Una **vista** en Postgres es esencialmente una query guardada con nombre. Te comportás contra ella como si fuera una tabla (`select * from categories_with_spent`), pero por debajo Postgres ejecuta la query que vos definiste cada vez. No duplica datos — solo agrega una capa de presentación.

**Por qué la creamos**: en el Paso 6 decidimos NO guardar `spent` como columna en `categories` (sería caro mantenerlo sincronizado con triggers, y propenso a desincronización). Pero el cliente igual necesita ver "Food: $610 de $800". Una vista resuelve esto:

- El cliente hace `select * from categories_with_spent where household_id = X`
- Postgres internamente corre el `SUM(expenses.amount)` y devuelve cada categoría con su gastado actualizado al momento de la query
- Siempre consistente, sin triggers, sin riesgo de drift

### Detalles del diseño

```sql
create view public.categories_with_spent
with (security_invoker = true)
as
select
  c.id,
  c.household_id,
  c.name,
  c.icon_key,
  c.accent,
  c.budgeted,
  c.created_at,
  coalesce(sum(e.amount), 0)::numeric(12,2) as spent
from public.categories c
left join public.expenses e on e.category_id = c.id
group by c.id;

grant select on public.categories_with_spent to authenticated;
```

**Punto crítico de seguridad — `security_invoker = true`**:

Por default en Postgres, **las vistas se ejecutan con los privilegios de su owner** (en nuestro caso `postgres`, el superuser que las crea). Esto significa que si no decimos lo contrario, la vista **bypassea RLS** — un user logueado podría ver categorías y expenses de OTROS households a través de la vista, aunque las tablas subyacentes estén protegidas.

Marcando `security_invoker = true` (disponible en Postgres 15+, que es lo que usa Supabase), le decimos a la vista: "ejecutate con los permisos del que pregunta, no del que te creó". Así, cuando un user hace `select` contra esta vista, Postgres internamente aplica las policies de `categories` y `expenses` correspondientes a ese user. RLS sigue funcionando.

**Por qué `LEFT JOIN` y `COALESCE`**:

- Un `INNER JOIN` excluiría categorías que aún no tienen gastos — pero el cliente quiere ver "Food: $0 de $800" cuando arrancás el mes. `LEFT JOIN` preserva todas las categorías.
- `COALESCE(SUM(...), 0)` convierte el `NULL` (que ocurre cuando no hay expenses) en `0`. Si dejáramos el `NULL`, el cliente tendría que hacer `?? 0` en cada lectura.
- `::numeric(12,2)` asegura que el tipo del `spent` sea idéntico al de `budgeted`, evitando que el cliente reciba un tipo distinto al esperado.

**Por qué `GRANT SELECT to authenticated`**:

Las vistas NO heredan automáticamente los permisos de las tablas subyacentes. Hay que dar permiso explícito al rol `authenticated` (el que usa Supabase para usuarios logueados) para que pueda leerla. Sin este `grant`, el cliente recibe un error de permisos aunque la vista esté bien definida.

> No tiene RLS propio (las vistas no la tienen) — la seguridad viene de las policies de `categories` y `expenses` que ya configuraste, gracias al `security_invoker`.

**Cómo verificar que funcionó**:

```sql
-- Debe aparecer la vista en information_schema
select table_name, view_definition
from information_schema.views
where table_schema = 'public' and table_name = 'categories_with_spent';

-- Debe mostrar security_invoker = true en las opciones de la vista
select c.relname, c.reloptions
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'categories_with_spent';
-- Esperás algo como: {security_invoker=true}

-- Verificar el grant
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'categories_with_spent';
-- Esperás una fila con grantee=authenticated, privilege_type=SELECT
```

**Cómo probar end-to-end** (desde el SQL Editor, que bypassea RLS):

```sql
-- Sacar el household id del Test budget
select id from public.households where name = 'Test budget';

-- Listar todas sus categorías con el spent calculado
select name, budgeted, spent, budgeted - spent as remaining
from public.categories_with_spent
where household_id = '<household_id>'
order by name;
```

Deberías ver las categorías que sembraste en el Paso 6 con el `spent` reflejando los expenses que insertaste en el Paso 7. Si agregás un nuevo expense:

```sql
insert into public.expenses (household_id, category_id, paid_by_id, amount, note)
values ('<household_id>', '<food_cat_id>', '<profile_id>', 5000, 'Café');

-- Volver a consultar la vista
select name, spent
from public.categories_with_spent
where household_id = '<household_id>' and name = 'Food';
```

El `spent` de Food debería haberse incrementado en 5000 sin que vos tuvieras que hacer nada — esa es la magia de las vistas derivadas.

> **Cuando migremos el frontend** (Paso 16): el `budgetStore` va a hacer `select` contra `categories_with_spent` en lugar de `categories`. Internamente seguís usando `categories` para `insert`/`update`/`delete` (la vista no es modificable porque tiene agregaciones), pero para LEER siempre vas a la vista. Esto reemplaza directamente el código actual que hace el cálculo de `spent` en `budgetStore.ts`.

---

## Paso 11 — Habilitar Realtime  *(completado)*

### ¿Qué es Realtime y por qué lo queremos?

**Supabase Realtime** permite que el cliente reciba notificaciones automáticas cuando cambian filas en una tabla — sin tener que hacer polling ni pull-to-refresh. Por debajo usa la **replicación lógica de Postgres**: cada `insert`/`update`/`delete` en una tabla "publicada" se transmite por un canal WebSocket al que los clientes pueden suscribirse.

Para este app es el ingrediente que hace que el budget se sienta verdaderamente *compartido*: cuando tu pareja agrega un gasto desde su teléfono, el tuyo lo muestra en segundos sin que toques nada.

**Importante**: este paso solo **habilita** la capacidad (le dice a Postgres "estas tablas deben transmitir sus cambios"). El código que se suscribe y refresca el store vive en el cliente y lo escribimos en el **Paso 17**. Habilitar Realtime acá no rompe nada ni cambia el comportamiento actual — simplemente deja la puerta abierta.

### Qué tablas habilitar

Las cinco tablas que contienen datos compartidos del household:

- `households` — para ver cuando se renombra o cambia de moneda
- `memberships` — para ver cuando entra/sale un miembro
- `categories` — para ver categorías nuevas o presupuestos editados
- `expenses` — el más importante: gastos en vivo
- `bills` — cuentas pagadas/pendientes

> `profiles` **no** lo habilitamos — los perfiles casi no cambian y no aportan al "feed en vivo".

### Opción A — Desde el dashboard (recomendado)

1. Andá a *Database → Publications* en el menú lateral de Supabase.
2. Vas a ver una publication llamada **`supabase_realtime`**. Hacé click en ella (o en el ícono de editar / "Source").
3. Activá el toggle de las cinco tablas: `households`, `memberships`, `categories`, `expenses`, `bills`.
4. Guardá.

> En algunas versiones del dashboard esto está en *Database → Replication*. El concepto es el mismo: agregar tablas a la publication `supabase_realtime`.

### Opción B — Por SQL (si preferís dejarlo versionado)

Equivale exactamente a los toggles del dashboard:

```sql
alter publication supabase_realtime add table public.households;
alter publication supabase_realtime add table public.memberships;
alter publication supabase_realtime add table public.categories;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.bills;
```

> Si una tabla ya estaba agregada, el comando falla con `table is already member of publication`. No pasa nada — significa que ya estaba habilitada.

### Realtime y RLS

Un detalle clave de seguridad: **Realtime respeta las RLS policies**. Cuando un cliente se suscribe a cambios de `expenses`, solo recibe eventos de las filas que su user tiene permiso de ver (según las policies del Paso 9). No vas a recibir notificaciones de gastos de households ajenos. Esto funciona automáticamente porque el canal de Realtime evalúa las policies con el `auth.uid()` del cliente suscrito.

### Cómo verificar que funcionó

```sql
-- Listar las tablas incluidas en la publication de realtime
select schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
order by tablename;
```

Deberías ver las cinco tablas (`bills`, `categories`, `expenses`, `households`, `memberships`).

**Prueba visual rápida** (opcional): en el dashboard, andá a *Realtime → Inspector* (o la pestaña de Realtime). Suscribite al canal de `expenses`, y en otra pestaña del SQL Editor insertá un expense de prueba. Deberías ver el evento aparecer en el inspector en tiempo real. Esto confirma que la transmisión funciona aun antes de tocar el cliente.

> **Recordatorio**: el "wow factor" real lo vas a ver en el Paso 17, cuando el cliente se suscriba a estos canales y actualice la UI sola. Por ahora con habilitarlo alcanza.

---

# Conectar el frontend

A partir de acá ya no se ejecuta SQL en Supabase — se reemplaza el `mockData` del cliente por queries reales.

## Paso 12 — Variables de entorno  *(completado)*

A partir de acá ya no tocamos Supabase — empezamos a modificar el código del proyecto. El primer paso es darle al cliente las credenciales para conectarse.

### Cómo funcionan las env vars en Expo

Expo (SDK 54) inyecta automáticamente cualquier variable que empiece con **`EXPO_PUBLIC_`** dentro del bundle del cliente, accesible vía `process.env.EXPO_PUBLIC_NOMBRE`. No necesitás librerías extra ni configuración en `app.json`. La condición es el prefijo `EXPO_PUBLIC_` — sin él, la variable no llega al cliente.

### Dónde sacar los valores

En el dashboard de Supabase: *Project Settings → API* (URL) y *Project Settings → API Keys* (la key). Vas a necesitar dos cosas:

- **Project URL** → algo como `https://abcdefgh.supabase.co`
- **Publishable key** → empieza con `sb_publishable_...`

> **Nota sobre el sistema nuevo de keys**: los proyectos recientes de Supabase usan un formato nuevo de API keys:
> - **`sb_publishable_...`** (publishable key) → la que va en el cliente. Reemplaza la vieja "anon key". **No es un JWT.**
> - **`sb_secret_...`** (secret key) → solo backend. Reemplaza el viejo `service_role`.
> - **JWT Signing Key** → es la llave con la que Supabase firma internamente los JWTs de los usuarios logueados. Es infraestructura, **no va en tu código** — no la toques.
>
> Si tu proyecto fuera viejo verías en su lugar una `anon` key en formato JWT (`eyJ...`); ambas cumplen la misma función en el cliente. Nosotros usamos la **publishable key**.

> **Sobre seguridad**: la publishable key es **pública por diseño** — está pensada para vivir en el cliente. Cualquiera que inspeccione tu app la puede ver, y está bien: lo que protege tus datos es el RLS que configuramos en el Paso 9, no el secreto de la key. **NUNCA** pongas la `secret` key ni la JWT Signing Key en el cliente.

### Crear el archivo `.env`

En la raíz del proyecto (junto a `package.json`), creá un archivo `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://tu-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...tu-publishable-key-completa
```

> Mantenemos el nombre de variable `EXPO_PUBLIC_SUPABASE_ANON_KEY` (es la convención que usa `supabase-js` y casi todos los ejemplos) aunque el *valor* sea ahora la publishable key. El cliente no distingue — solo le importa el valor.

Ya dejé en el repo un **`.env.example`** con la plantilla — copialo a `.env` y reemplazá los valores. El `.gitignore` ya excluye `.env` (verificado), así que tus credenciales no se van a subir a git; el `.env.example` sí se commitea como referencia para vos o cualquier otro dev.

### Después de crear el `.env`

**Reiniciá el dev server** — Expo lee las env vars al arrancar, así que un servidor ya corriendo no las va a ver:

```bash
# Cortá el server actual (Ctrl+C) y volvé a arrancar
npx expo start -c
```

El flag `-c` limpia la caché de Metro, que a veces se queda con valores viejos de env.

### Cómo verificar (rápido, temporal)

Podés agregar un `console.log` temporal en cualquier archivo que se ejecute al inicio (ej. `App.tsx`):

```ts
console.log('SUPABASE URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
```

Si en la consola de Metro ves la URL (y no `undefined`), las env vars están llegando. Borrá el `console.log` después.

> **No corras esto todavía si no querés** — la verificación real viene en el Paso 13, cuando creemos el cliente de Supabase y hagamos una query de prueba.

---

## Paso 13 — Instalar `@supabase/supabase-js` + cliente singleton  *(completado)*

### Instalar las dependencias

Supabase en React Native necesita tres paquetes:

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

Por qué cada uno:

- **`@supabase/supabase-js`** — el SDK oficial. Da `createClient`, queries, auth, realtime.
- **`@react-native-async-storage/async-storage`** — React Native no tiene `localStorage`. Supabase lo usa para **persistir la sesión** del usuario entre reinicios del app (si no, habría que loguearse cada vez que se abre).
- **`react-native-url-polyfill`** — `supabase-js` usa la API `URL` del navegador internamente; React Native no la trae completa, así que la polyfill la suple.

> Usamos `npx expo install` (en vez de `npm install`) porque AsyncStorage es un módulo nativo y Expo elige la versión compatible con el SDK 54.

### El cliente singleton

Ya creé el archivo **`src/lib/supabase.ts`** en el repo. Exporta una única instancia de Supabase que el resto del app va a importar. Puntos clave de la config:

```ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,        // persiste la sesión en el dispositivo
    autoRefreshToken: true,       // renueva el token antes de que expire
    persistSession: true,         // mantené la sesión entre reinicios
    detectSessionInUrl: false,    // RN no usa sesiones vía URL (eso es solo web)
  },
});
```

- **`import 'react-native-url-polyfill/auto'`** al tope del archivo — debe ir antes de cualquier uso de Supabase para que la polyfill se registre.
- **Validación de env vars** — si faltan, el cliente tira un error claro al arrancar en lugar de fallar de forma confusa más adelante.
- **`AppState` listener** — pausa el auto-refresh del token cuando el app pasa a background y lo reanuda al volver. Es el patrón oficial recomendado por Supabase para RN (evita refrescos innecesarios mientras la app está cerrada).

### Cómo verificar que la conexión funciona

Agregá temporalmente esto en `App.tsx` (dentro del componente o como efecto al inicio) para hacer una query de prueba contra una tabla pública:

```ts
import { supabase } from '@/lib/supabase';

// ... dentro de un useEffect en App o Shell:
useEffect(() => {
  supabase
    .from('households')
    .select('id, name')
    .then(({ data, error }) => {
      console.log('Supabase test →', { data, error });
    });
}, []);
```

Qué esperar en la consola de Metro:

- **`data: []` y `error: null`** → ¡conexión exitosa! La lista vacía es correcta: todavía no hay sesión, así que RLS no deja ver ningún household (recordá que `households_read` requiere ser miembro, y sin login `auth.uid()` es `null`). Lo importante es que **no hay error de red ni de auth** — el cliente habló con Supabase y RLS hizo su trabajo.
- **`error` con mensaje** → algo está mal: revisá la URL/key en `.env`, que reiniciaste el server con `-c`, y que instalaste las dependencias.

Borrá ese `useEffect` de prueba una vez confirmes que conecta.

> Si ves `data: []` sin error, estás listo: el cliente conecta y RLS funciona. En el **Paso 14** agregamos el login para que `auth.uid()` deje de ser `null` y empieces a ver tus datos reales.

---

## Paso 14 — Auth flow (sign up / sign in / sign out)  *(completado)*

Este paso "cierra" la app detrás de un login: sin sesión ves la pantalla de auth, con sesión ves la app normal.

### Config previa en Supabase — apagar confirmación de email

Para desarrollar más rápido, desactivamos la confirmación por email (decisión tomada para esta etapa):

1. Dashboard → *Authentication → Sign In / Providers → Email*
2. Desactivá el toggle **"Confirm email"**
3. Guardá

Con esto, un signup crea la sesión al instante (sin tener que clickear un link en el correo). **Antes de producción hay que reactivarlo.**

### Archivos creados / modificados

- **`src/store/authStore.ts`** (nuevo) — store de Zustand que guarda la `session` y expone `signIn`, `signUp`, `signOut`. Incluye `initAuth()` que llama a `getSession()` al arrancar y se suscribe a `onAuthStateChange`.
- **`src/screens/auth/AuthScreen.tsx`** (nuevo) — una sola pantalla con toggle Sign in / Sign up. Valida email, password (mín. 6 chars) y nombre (en signup).
- **`App.tsx`** (modificado) — nuevo componente `Root` que gatea: spinner mientras inicializa → `AuthScreen` si no hay sesión → `Shell` si hay sesión.
- **`src/screens/SettingsScreen.tsx`** (modificado) — el botón "Log out" ahora llama a `signOut`.

### Cómo funciona el flujo

1. Al arrancar, `initAuth()` pregunta a Supabase si hay una sesión guardada (persistida en AsyncStorage del Paso 13). Mientras tanto, `initializing = true` y se muestra el spinner.
2. Cuando responde, `initializing = false`. Si hay sesión → `Shell` (la app). Si no → `AuthScreen`.
3. En signup, mandamos `options.data.name` — ese valor llega a `raw_user_meta_data` y el trigger `handle_new_user` (Paso 2) lo usa para crear el row en `profiles` automáticamente.
4. `onAuthStateChange` mantiene el store sincronizado: al hacer login/logout, la UI cambia sola sin recargar.

### Cómo probar

1. Reiniciá el server (`npx expo start -c`).
2. Deberías ver la **pantalla de login** (ya no la app directamente).
3. Tocá "Sign up", creá una cuenta con tu email + password. Al enviar, deberías entrar directo al Dashboard.
4. Andá a *Settings → Log out*. Deberías volver a la pantalla de login.
5. Volvé a entrar con "Sign in" usando las mismas credenciales.
6. **Cerrá y reabrí la app** — deberías seguir logueado (sesión persistida).

Verificá en Supabase que tu signup creó todo:

```sql
-- Debe aparecer tu nuevo user
select id, email from auth.users order by created_at desc limit 1;

-- Y su profile creado por el trigger
select id, name, email from public.profiles order by created_at desc limit 1;
```

### Estado intermedio esperado (importante)

Después de loguearte, la app va a mostrar los **datos mock todavía** (categorías, gastos, households de `mockData.ts`). Eso es correcto en este punto: el auth ya funciona, pero los stores (`householdStore`, `budgetStore`) siguen usando datos falsos. Los conectamos a Supabase en los **Pasos 15-16**.

Esto significa que por ahora hay una desconexión: estás logueado como tu user real de Supabase, pero ves datos mock que no le pertenecen. Es esperado y temporal.

---

## Paso 15 — Reemplazar `householdStore` mock con queries reales

El `householdStore` pasa de tener arrays en memoria a leer/escribir contra Supabase. La forma del estado (`currentUserId`, `users`, `households`, `memberships`, `activeHouseholdId`) y los selectores se mantienen **idénticos**, así que los componentes que lo consumen no cambian.

### Decisiones aplicadas

- **Aliasing en los `select`**: para mantener los types en camelCase sin tocar componentes, los selects renombran las columnas. Ej: `.select('id, name, currency, createdBy:created_by, createdAt:created_at')`. La sintaxis de Supabase es `aliasCamelCase:columna_snake_case`.
- **Refetch tras cada mutación**: cada `create`/`update`/`delete` hace su llamada a Supabase y después llama a `fetchAll()` para recargar el estado. Simple y siempre consistente.
- **`currentUserId` viene de la sesión**: ya no es mock; sale de `supabase.auth.getSession()`.

### Cambios de tipos y datos

- **`CurrencyCode`** se angostó a `'USD' | 'CRC'` (antes tenía 6). El `CurrencyPicker` ahora solo ofrece esas dos. Esto es necesario porque el enum de la DB solo acepta esos dos valores — un insert con otro fallaría.
- **`Household.createdAt` y `Membership.joinedAt`** pasaron de `number` a `string` (la DB devuelve timestamps ISO). No se usan en ningún cálculo de fecha, así que el cambio es seguro.
- **`mockData.ts`** ya no exporta `mockUsers`, `mockCurrentUserId`, `mockHouseholds`, `mockMemberships` — el store ya no los usa. (Los mocks de categories/expenses/bills siguen ahí hasta el Paso 16.)

### Cómo funciona el fetch inicial

En `App.tsx`, el componente `Root` observa el `userId` de la sesión:
- Cuando hay login (userId aparece) → `householdStore.fetchAll()` carga profiles + households + memberships.
- Cuando hay logout (userId → null) → `householdStore.reset()` limpia todo.
- Usamos `userId` como dependencia (no el objeto `session` entero) para no recargar en cada refresh de token.

### Cómo probar

1. Reiniciá el server (`npx expo start -c`).
2. Logueate. Como tu cuenta de auth es nueva, **probablemente no tengas ningún household** todavía — la app va a verse sin budget activo (el selector de household no aparece). Esto es correcto.
3. Andá a *Settings → Create new budget* (o el botón de crear) y creá uno. Debería:
   - Insertarse en `households` con vos como `created_by`
   - Crear tu membership como `owner`
   - Aparecer como budget activo
4. Verificá en Supabase:
   ```sql
   select h.name, h.currency, p.email as creador
   from public.households h
   join public.profiles p on p.id = h.created_by
   order by h.created_at desc;

   select h.name, pr.email, m.role
   from public.memberships m
   join public.households h on h.id = m.household_id
   join public.profiles pr on pr.id = m.user_id;
   ```
5. Probá renombrar el budget y cambiar la moneda desde *Manage budget* — los cambios deben persistir (cerrá/reabrí la app para confirmar).

### Limitaciones conocidas (a resolver después)

- **Editar el nombre de OTRO miembro no funciona**: la policy `profiles_self_update` solo permite editar tu propio profile. El feature "Edit member" del `ManageHouseholdModal` que permite renombrar a cualquiera fue diseñado con datos mock; contra la DB real, editar a otro miembro hace un no-op silencioso. Tiene sentido: el `name` de un profile es global a esa persona en todos sus households — un owner no debería poder renombrar el perfil global de otro. **Decisión pendiente**: restringir "Edit member" a solo el usuario actual, o quitarlo.
- **Invitar miembros sigue siendo simulado**: el `InviteMemberSheet` muestra "Invitation sent" pero no agrega a nadie. Para invitar de verdad necesitamos un flujo de invitaciones (tabla `invitations` + aceptar por link), que es un feature aparte.
- **`createHousehold` hace 2 inserts no atómicos** (household + membership). Si el segundo fallara, quedaría un household sin miembros. Para hacerlo atómico se puede mover a una función RPC de Postgres más adelante.
- **categories/expenses/bills siguen mock** hasta el Paso 16, así que el Dashboard va a mezclar tu budget real con categorías/gastos falsos.

---

## Paso 16 — Reemplazar `budgetStore` mock con queries reales

Mismo tratamiento para `categories` (vía `categories_with_spent`), `expenses` y `bills`. Manejar loading/error states.

> Pendiente.

---

## Paso 17 — Suscripciones Realtime

Suscribirse con `supabase.channel(...)` a cambios en `expenses` y `categories` del household activo, refrescar el store local cuando lleguen eventos de otros miembros.

> Pendiente — el "wow factor" del app compartido.
