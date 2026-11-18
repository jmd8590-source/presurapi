# Presurapi — backend en Appwrite

Este documento describe el backend real ya creado en Appwrite (proyecto
`presurapi`, región Frankfurt) y por qué su forma difiere en algunos puntos
del diseño original pensado para Supabase/Postgres.

## Por qué cambia la forma del esquema, no solo el proveedor

Appwrite no tiene Row Level Security estilo Postgres (una política SQL que
evalúa un `join` en cada fila). Su modelo de seguridad es **permisos por
documento**: cada fila lleva su propia lista de "quién puede leer/escribir",
activada (`rowSecurity`) por tabla. No existe un equivalente directo a "este
capítulo es tuyo si el presupuesto al que pertenece es tuyo" evaluado
automáticamente en cada consulta.

Por eso, las filas que antes dependían de una cadena de `join` para saber su
dueño (`capitulos`, `partidas`) llevan su propio campo `user_id`, con
permisos de fila fijados al crearlas — en vez de depender de a qué
presupuesto pertenecen. Es más repetitivo que la RLS de Postgres, pero es el
patrón nativo y correcto en Appwrite (igual de seguro, aplicado distinto).

## Autenticación

Appwrite Authentication (email + contraseña, recuperación de contraseña).
Las server actions (`src/app/acciones/auth.ts`) crean la sesión con la API
key de servidor (nunca desde el navegador) y guardan el secreto en una
cookie `httpOnly` propia (`presurapi_session`); ver `src/lib/appwrite/server.ts`.

## Base de datos: `presurapi`

Siete tablas, todas con `rowSecurity: true` salvo donde se indica. Salvo
`perfiles` (que solo crea el servidor), el permiso de tabla es
`create("users")`: cualquier usuario autenticado puede crear sus propias
filas; lectura/actualización/borrado se conceden fila a fila a
`Role.user(userId)` al crearla.

### `perfiles`

Un documento por usuario; **el ID de la fila es el propio userId**. Sin
permisos de tabla (solo la crea el servidor, con la API key, justo después
del registro — ver `registrar()` en `auth.ts`).

| Columna | Tipo | Notas |
|---|---|---|
| nombre_empresa, nif_empresa, direccion_empresa, telefono_empresa | string | por defecto `""` |
| email_empresa | email, sin valor por defecto | llega como `null` hasta que el usuario lo rellena; el store lo normaliza a `""` |
| email_cuenta | email | copia del email de la cuenta, guardada al registrarse |
| logo_data_url | longtext | `data:` URL del logo subido en Ajustes, sin bucket de Storage |
| precio_hora_oficial, precio_hora_peon | double, sin valor por defecto | `null` = sin fijar, usa el valor por defecto de `calculo.ts` |
| gastos_generales_pct, beneficio_industrial_pct, iva_pct | double | 13 / 6 / 21 por defecto |
| idioma | enum (es, en) | por defecto `es` |

### `clientes`

user_id (indexado), nombre, nif, email, telefono, direccion, notas (text),
estado (enum activo/archivado, por defecto activo).

### `obras`

user_id (indexado), cliente_id (indexado), nombre, direccion, descripcion
(text), estado (enum activa/archivada, por defecto activa).

### `precios_usuario`

Precio propio del usuario para un material del catálogo, con prioridad sobre
el precio de referencia. user_id (indexado), material_nombre, precio
(double). Índice único compuesto `(user_id, material_nombre)`.

### `presupuestos`

user_id (indexado), obra_id (indexado), numero (integer), estado (enum
borrador/enviado/aceptado/rechazado), snapshot de tarifas y porcentajes al
crearlo, subtotales e importes calculados, notas (text). Índice único
compuesto `(user_id, numero)` para la numeración por usuario.

### `capitulos`

user_id (indexado, denormalizado desde el presupuesto — ver más arriba),
presupuesto_id (indexado), nombre, posicion.

### `partidas`

user_id (indexado), capitulo_id (indexado), trabajo_slug, descripcion,
unidad (enum m2/ml/ud/h), medicion, importes calculados, posicion. Las
líneas de materiales y mano de obra se guardan como JSON en
`materiales_json`/`mano_obra_json` (columnas `longtext`) en vez de en tablas
aparte `partida_materiales`/`partida_mano_obra`: son 2-3 líneas por partida,
nunca se consultan sueltas de la partida que las contiene, así que
normalizarlas solo añadiría llamadas sin ningún beneficio real.

## Lo que no se implementó (y por qué)

- **`materiales`/`trabajos`/`trabajo_materiales`/`trabajo_mano_obra` como
  tablas de Appwrite**: nadie los edita desde la app (son de solo lectura),
  así que siguen viviendo en `src/lib/demo/catalog.ts`, empaquetados con el
  código. Moverlos a Appwrite solo tendría sentido si en el futuro se quiere
  editar el banco de precios sin desplegar código.
- **Bucket de Storage para el logo**: una imagen pequeña como `data:` URL en
  una columna `longtext` de `perfiles` evita montar todo un flujo de subida
  de ficheros (bucket, permisos por fichero, URLs firmadas) para un caso de
  uso tan simple.
- **Enlace público de presupuesto (`/p/[token]`)**: no llegó a construirse
  en la demo tampoco, así que no es una regresión; se puede añadir más
  adelante con una Appwrite Function que resuelva el token server-side.
- **Appwrite Functions**: no hicieron falta. Crear el perfil al registrarse
  y mantener el número de presupuesto secuencial se hacen directamente en
  las server actions / el store con la API key o la sesión del propio
  usuario, sin necesitar código desplegado por separado en Appwrite.
