-- Presurapi — banco de precios y catálogo de trabajos de arranque
--
-- IMPORTANTE: estos precios de materiales son una ESTIMACIÓN ORIENTATIVA
-- interna (no vienen de una fuente de mercado verificada en tiempo real).
-- Se marcan así explícitamente en fuente/fecha_actualizacion, tal y como
-- exige la app: ningún precio se presenta nunca como exacto. Si el usuario
-- aporta una fuente real (generador de precios, proveedor, etc.), estos
-- valores deben sustituirse.
--
-- Las cantidades de materiales y horas de oficial/peón por m² son órdenes de
-- magnitud habituales en albañilería básica, pensadas para que el asistente
-- de presupuesto funcione de forma razonable desde el primer día; se podrán
-- afinar con datos reales del usuario.
insert into
  public.materiales (
    nombre,
    unidad,
    precio_referencia,
    fuente,
    fecha_actualizacion,
    categoria
  )
values
  (
    'Ladrillo hueco doble 24x11,5x7 cm',
    'ud',
    0.22,
    'Estimación orientativa interna — Presurapi',
    current_date,
    'Albañilería'
  ),
  (
    'Mortero de cemento premezclado, saco 25 kg',
    'saco',
    7.90,
    'Estimación orientativa interna — Presurapi',
    current_date,
    'Albañilería'
  ),
  (
    'Yeso de enlucir, saco 25 kg',
    'saco',
    8.50,
    'Estimación orientativa interna — Presurapi',
    current_date,
    'Revestimientos'
  ),
  (
    'Azulejo cerámico 20x20 cm',
    'm2',
    9.90,
    'Estimación orientativa interna — Presurapi',
    current_date,
    'Alicatados'
  ),
  (
    'Gres porcelánico 60x60 cm',
    'm2',
    14.90,
    'Estimación orientativa interna — Presurapi',
    current_date,
    'Solados'
  ),
  (
    'Cemento cola, saco 25 kg',
    'saco',
    11.50,
    'Estimación orientativa interna — Presurapi',
    current_date,
    'Solados y alicatados'
  ),
  (
    'Junta de alicatado/solado',
    'kg',
    2.10,
    'Estimación orientativa interna — Presurapi',
    current_date,
    'Solados y alicatados'
  ),
  (
    'Pintura plástica blanca mate',
    'l',
    4.20,
    'Estimación orientativa interna — Presurapi',
    current_date,
    'Pintura'
  ),
  (
    'Imprimación selladora',
    'l',
    5.80,
    'Estimación orientativa interna — Presurapi',
    current_date,
    'Pintura'
  );

insert into
  public.trabajos (slug, nombre, unidad, descripcion)
values
  (
    'tabique_ladrillo_hueco_7',
    'Tabique de ladrillo hueco doble (7 cm)',
    'm2',
    'Fábrica de ladrillo hueco doble tomado con mortero, incluso replanteo y aplomado.'
  ),
  (
    'enfoscado_maestreado',
    'Enfoscado maestreado y fratasado',
    'm2',
    'Enfoscado de mortero de cemento, maestreado y fratasado, sobre fábrica de ladrillo.'
  ),
  (
    'enlucido_yeso',
    'Enlucido de yeso',
    'm2',
    'Enlucido de yeso sobre guarnecido, acabado liso.'
  ),
  (
    'alicatado_20x20',
    'Alicatado con azulejo (20x20 cm)',
    'm2',
    'Alicatado con azulejo cerámico 20x20 cm recibido con cemento cola, rejuntado.'
  ),
  (
    'solado_gres_60x60',
    'Solado de gres porcelánico (60x60 cm)',
    'm2',
    'Solado con baldosa de gres porcelánico 60x60 cm recibida con cemento cola, rejuntado.'
  ),
  (
    'pintura_plastica',
    'Pintura plástica (dos manos)',
    'm2',
    'Pintura plástica lisa en dos manos sobre paramento, incluso imprimación selladora.'
  );

-- Recetas de materiales por m² (cantidad_por_unidad)
insert into
  public.trabajo_materiales (trabajo_id, material_id, cantidad_por_unidad)
select
  t.id,
  m.id,
  v.cantidad
from
  (
    values
      (
        'tabique_ladrillo_hueco_7',
        'Ladrillo hueco doble 24x11,5x7 cm',
        28.0
      ),
      (
        'tabique_ladrillo_hueco_7',
        'Mortero de cemento premezclado, saco 25 kg',
        0.15
      ),
      (
        'enfoscado_maestreado',
        'Mortero de cemento premezclado, saco 25 kg',
        0.12
      ),
      ('enlucido_yeso', 'Yeso de enlucir, saco 25 kg', 0.30),
      (
        'alicatado_20x20',
        'Azulejo cerámico 20x20 cm',
        1.05
      ),
      (
        'alicatado_20x20',
        'Cemento cola, saco 25 kg',
        0.20
      ),
      (
        'alicatado_20x20',
        'Junta de alicatado/solado',
        0.50
      ),
      (
        'solado_gres_60x60',
        'Gres porcelánico 60x60 cm',
        1.08
      ),
      (
        'solado_gres_60x60',
        'Cemento cola, saco 25 kg',
        0.22
      ),
      (
        'solado_gres_60x60',
        'Junta de alicatado/solado',
        0.30
      ),
      (
        'pintura_plastica',
        'Pintura plástica blanca mate',
        0.20
      ),
      ('pintura_plastica', 'Imprimación selladora', 0.10)
  ) as v (trabajo_slug, material_nombre, cantidad)
  join public.trabajos t on t.slug = v.trabajo_slug
  join public.materiales m on m.nombre = v.material_nombre;

-- Horas de oficial/peón por m²
insert into
  public.trabajo_mano_obra (trabajo_id, rol, horas_por_unidad)
select
  t.id,
  v.rol,
  v.horas
from
  (
    values
      ('tabique_ladrillo_hueco_7', 'oficial', 0.35),
      ('tabique_ladrillo_hueco_7', 'peon', 0.35),
      ('enfoscado_maestreado', 'oficial', 0.30),
      ('enfoscado_maestreado', 'peon', 0.20),
      ('enlucido_yeso', 'oficial', 0.25),
      ('enlucido_yeso', 'peon', 0.10),
      ('alicatado_20x20', 'oficial', 0.55),
      ('alicatado_20x20', 'peon', 0.25),
      ('solado_gres_60x60', 'oficial', 0.45),
      ('solado_gres_60x60', 'peon', 0.20),
      ('pintura_plastica', 'oficial', 0.15)
  ) as v (trabajo_slug, rol, horas)
  join public.trabajos t on t.slug = v.trabajo_slug;
