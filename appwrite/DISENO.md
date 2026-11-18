# Presurapi — diseño del backend en Appwrite

Sustituye al diseño de `supabase/migrations/` (Fase 2 original). Este documento
es el plan; se aplica de verdad con las herramientas MCP de Appwrite en cuanto
haya una sesión con la autenticación completada — no es un fichero que
Appwrite vaya a leer directamente.

## Por qué cambia la forma del esquema, no solo el proveedor

Appwrite no tiene Row Level Security estilo Postgres (una política SQL que
evalúa un `join` en cada fila). Su modelo de seguridad es **permisos por
documento**: cada documento lleva su propia lista de "quién puede
leer/escribir", y hay que activarla (`documentSecurity`) por colección. No
existe un equivalente directo a "este capítulo es tuyo si el presupuesto al
que pertenece es tuyo" evaluado automáticamente en cada consulta.

Por eso, los documentos que antes dependían de una cadena de `join` para
saber su dueño (`capitulos`, `partidas`, `partida_materiales`,
`partida_mano_obra`) llevan aquí su propio campo `user_id`, con permisos de
documento fijados al crearlos — en vez de depender de a qué presupuesto
pertenecen. Es más repetitivo que la RLS de Postgres, pero es el patrón
nativo y correcto en Appwrite (igual de seguro, aplicado distinto).

## Autenticación

Appwrite Authentication sustituye a Supabase Auth: email + contraseña,
verificación de email, recuperación de contraseña — las mismas piezas que
pedía el proyecto original, nativas de Appwrite, sin tener que montarlas a
mano.

## Base de datos: `presurapi`

Todas las colecciones viven en una base de datos Appwrite llamada
`presurapi`. Catálogos globales (`materiales`, `trabajos`,
`trabajo_materiales`, `trabajo_mano_obra`): solo lectura para usuarios
autenticados (`read: role:users`), sin permisos de escritura para ellos —
los mantiene quien tenga la API key de servidor. El resto: `documentSecurity`
activado, sin permisos a nivel de colección salvo `create: role:users`
(cualquier usuario autenticado puede crear sus propios documentos); lectura,
actualización y borrado se conceden documento a documento a
`Role.user(userId)` al crearlo.

### `perfiles`

Un documento por usuario; **el ID del documento es el propio userId** (igual
que en Supabase la PK de `perfiles` era `auth.users.id`), así se busca sin
necesidad de índice adicional.

| Atributo | Tipo | Notas |
|---|---|---|
| nombre_empresa | string | vacío hasta que el usuario lo rellena |
| nif_empresa | string | |
| direccion_empresa | string | |
| telefono_empresa | string | |
| email_empresa | string (email) | |
| logo_file_id | string | ID del fichero en el bucket `logos`, nullable |
| precio_hora_oficial | float, nullable | NULL = sin fijar, usa el valor por defecto |
| precio_hora_peon | float, nullable | ídem |
| gastos_generales_pct | float | por defecto 13 |
| beneficio_industrial_pct | float | por defecto 6 |
| iva_pct | float | por defecto 21 |
| idioma | enum (es, en) | |

Permisos: `read`, `update` → `Role.user(userId)` (documento = el propio
usuario). Se crea automáticamente con una Appwrite Function disparada por el
evento `users.*.create` (equivalente al trigger `handle_new_user` de
Postgres).

### `clientes`

| Atributo | Tipo |
|---|---|
| user_id | string, indexado |
| nombre | string |
| nif | string |
| email | string |
| telefono | string |
| direccion | string |
| notas | string |
| estado | enum (activo, archivado) |

Permisos por documento: `read/update/delete` → `Role.user(user_id)`.

### `obras`

| Atributo | Tipo |
|---|---|
| user_id | string, indexado |
| cliente_id | string, indexado |
| nombre | string |
| direccion | string |
| descripcion | string |
| estado | enum (activa, archivada) |

Mismo patrón de permisos que `clientes`.

### `materiales` (banco de precios, catálogo global)

| Atributo | Tipo |
|---|---|
| nombre | string |
| unidad | enum (m2, ml, ud, kg, l, saco, h) |
| precio_referencia | float |
| fuente | string |
| fecha_actualizacion | datetime |
| categoria | string, indexado |

Permisos de colección: `read: role:users`; sin create/update/delete para
usuarios (gestionado por servidor).

### `precios_usuario` (precio propio, prioridad sobre el de referencia)

| Atributo | Tipo |
|---|---|
| user_id | string, indexado |
| material_id | string, indexado |
| precio | float |

Índice único compuesto `(user_id, material_id)`. Permisos por documento:
`Role.user(user_id)`.

### `trabajos`, `trabajo_materiales`, `trabajo_mano_obra` (catálogo global)

Mismos campos que en `supabase/seed.sql` (slug, nombre, unidad, descripción;
receta de materiales por unidad; horas de oficial/peón por unidad). Mismo
patrón de permisos de solo lectura que `materiales`.

### `presupuestos`

| Atributo | Tipo |
|---|---|
| user_id | string, indexado |
| obra_id | string, indexado |
| numero | integer |
| estado | enum (borrador, enviado, aceptado, rechazado) |
| precio_hora_oficial, precio_hora_peon | float — snapshot al crear |
| gastos_generales_pct, beneficio_industrial_pct, iva_pct | float — snapshot |
| subtotal_materiales, subtotal_mano_obra | float |
| gastos_generales_importe, beneficio_industrial_importe | float |
| base_imponible, iva_importe, total | float |
| notas | string |
| token_publico | string, índice único — enlace público de solo lectura |
| enviado_at | datetime, nullable |

Índice único compuesto `(user_id, numero)`. Permisos por documento:
`Role.user(user_id)`. El enlace público (`/p/[token]`) se resuelve con una
Appwrite Function server-side usando la API key, nunca dando permiso de
lectura a `role:any` sobre el documento completo.

### `capitulos`

| Atributo | Tipo |
|---|---|
| user_id | string, indexado — **denormalizado desde el presupuesto, ver más arriba** |
| presupuesto_id | string, indexado |
| nombre | string |
| posicion | integer |

### `partidas`

| Atributo | Tipo |
|---|---|
| user_id | string, indexado |
| capitulo_id | string, indexado |
| trabajo_slug | string, nullable |
| descripcion | string |
| unidad | enum (m2, ml, ud, h) |
| medicion | float |
| importe_materiales, importe_mano_obra | float |
| precio_unitario, importe | float |
| posicion | integer |

### `partida_materiales` / `partida_mano_obra`

Igual que en Supabase (snapshot de nombre/precio de material, o de
rol/horas/precio-hora de mano de obra), más `user_id` denormalizado para el
permiso de documento.

## Storage

Bucket `logos`: permisos por fichero, `Role.user(userId)` al subir — mismo
criterio que el bucket privado de Supabase Storage.

## Lo que todavía no está decidido

- **IDs de referencia simples (string) vs. relationships nativas de
  Appwrite**: este diseño usa IDs simples (igual que los tipos TS ya
  construidos en `src/lib/demo/types.ts`), para que portar la demo cueste lo
  mínimo. Las relationships nativas de Appwrite permitirían traer datos
  relacionados en una sola consulta, a cambio de más complejidad; se puede
  añadir después si hace falta.
- **Appwrite Functions** para: crear el perfil al registrarse, mantener
  `numero` de presupuesto secuencial por usuario de forma atómica, y
  resolver el enlace público del presupuesto.

## Próximos pasos (necesitan la sesión con Appwrite autenticado)

1. Crear la base de datos `presurapi` y las colecciones de este documento
   con las herramientas MCP de Appwrite.
2. Sembrar `materiales` y `trabajos` con los mismos datos de
   `supabase/seed.sql`.
3. Sustituir `src/lib/demo/store.tsx` por un cliente real de Appwrite
   (mismo patrón que se iba a hacer con `src/lib/supabase/*`), manteniendo
   intactas `src/lib/demo/calculo.ts` y `src/lib/demo/catalog.ts` (no
   dependen de dónde viven los datos).
4. Conectar `Appwrite Authentication` en las páginas de entrar/registro,
   sustituyendo el inicio de sesión simulado.
