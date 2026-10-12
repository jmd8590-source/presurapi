/**
 * Catálogo base de referencia para albañiles y reformas en España.
 *
 * Todas las partidas y precios son 100% editables por cada empresa.
 * Los importes están expresados en céntimos de euro.
 */

export interface CapituloBase {
  id: string;
  nombre: string;
  orden: number;
  icono: string;
}

export interface PartidaBase {
  capituloId: string;
  codigo: string;
  concepto: string;
  descripcion: string;
  unidad: string;
  precioVenta: number;   // Céntimos
  costeEstimado: number; // Céntimos
}

export const CAPITULOS_BASE: CapituloBase[] = [
  { id: "cap_demolicion", nombre: "1. Demoliciones y trabajos previos", orden: 1, icono: "hammer" },
  { id: "cap_albanileria", nombre: "2. Albañilería y tabiquería", orden: 2, icono: "brick" },
  { id: "cap_fontaneria", nombre: "3. Fontanería y saneamiento", orden: 3, icono: "droplet" },
  { id: "cap_electricidad", nombre: "4. Electricidad e iluminación", orden: 4, icono: "zap" },
  { id: "cap_clima", nombre: "5. Climatización y ventilación", orden: 5, icono: "flame" },
  { id: "cap_revestimientos", nombre: "6. Revestimientos, solados y alicatados", orden: 6, icono: "grid" },
  { id: "cap_carpinteria", nombre: "7. Carpintería interior y cerrajería", orden: 7, icono: "door" },
  { id: "cap_pintura", nombre: "8. Pintura y acabados", orden: 8, icono: "brush" },
  { id: "cap_medios", nombre: "9. Medios auxiliares y protecciones", orden: 9, icono: "shield" },
  { id: "cap_limpieza", nombre: "10. Limpieza final y gestión de residuos", orden: 10, icono: "trash" },
];

export const PARTIDAS_BASE: PartidaBase[] = [
  // 1. Demoliciones
  {
    capituloId: "cap_demolicion",
    codigo: "DEM-01",
    concepto: "Picado y desescombro de alicatado de paredes",
    descripcion: "Picado de azulejos existentes y mortero de agarre, carga manual y transporte a contenedor.",
    unidad: "m2",
    precioVenta: 1850, // 18,50 €
    costeEstimado: 1100, // 11,00 €
  },
  {
    capituloId: "cap_demolicion",
    codigo: "DEM-02",
    concepto: "Desmontaje y retirada de sanitarios antiguos",
    descripcion: "Desmontaje de lavabo, inodoro, bidé y bañera/plato con taponado provisional de tomas.",
    unidad: "ud",
    precioVenta: 9500, // 95,00 €
    costeEstimado: 5500, // 55,00 €
  },
  {
    capituloId: "cap_demolicion",
    codigo: "DEM-03",
    concepto: "Demolición de tabique de ladrillo hueco sencillo",
    descripcion: "Derribo de tabique interior, acopio y bajada de escombros a contenedor autorizado.",
    unidad: "m2",
    precioVenta: 2200, // 22,00 €
    costeEstimado: 1350,
  },

  // 2. Albañilería
  {
    capituloId: "cap_albanileria",
    codigo: "ALB-01",
    concepto: "Tabique de placa de yeso laminado (Pladur) con aislamiento",
    descripcion: "Estructura metálica de 48 mm con lana de roca y placa estándar de 15 mm a ambas caras, encintado y lijado.",
    unidad: "m2",
    precioVenta: 4800, // 48,00 €
    costeEstimado: 2900,
  },
  {
    capituloId: "cap_albanileria",
    codigo: "ALB-02",
    concepto: "Recrecido y nivelación de solera con mortero",
    descripcion: "Nivelado y maestreado con mortero de cemento para colocación posterior de pavimento.",
    unidad: "m2",
    precioVenta: 1950,
    costeEstimado: 1200,
  },
  {
    capituloId: "cap_albanileria",
    codigo: "ALB-03",
    concepto: "Falso techo continuo de placa de yeso laminado",
    descripcion: "Montaje de estructura oculta suspendida y placas de yeso laminado de 13 mm.",
    unidad: "m2",
    precioVenta: 3400,
    costeEstimado: 2100,
  },

  // 3. Fontanería
  {
    capituloId: "cap_fontaneria",
    codigo: "FON-01",
    concepto: "Instalación completa de fontanería para baño en multicapa",
    descripcion: "Red interior de agua fría y caliente con tubería multicapa aislada y llaves de corte individuales.",
    unidad: "pa",
    precioVenta: 68000, // 680,00 €
    costeEstimado: 39000,
  },
  {
    capituloId: "cap_fontaneria",
    codigo: "FON-02",
    concepto: "Instalación y conexionado de plato de ducha de resina",
    descripcion: "Colocación sobre solera nivelada, sellado perimetral con silicona antimoho y válvula gran caudal.",
    unidad: "ud",
    precioVenta: 18000,
    costeEstimado: 9500,
  },
  {
    capituloId: "cap_fontaneria",
    codigo: "FON-03",
    concepto: "Instalación de conjunto de inodoro compacto adosado",
    descripcion: "Montaje, fijación al suelo y conexión de toma y desagüe para inodoro.",
    unidad: "ud",
    precioVenta: 9500,
    costeEstimado: 5000,
  },

  // 4. Electricidad
  {
    capituloId: "cap_electricidad",
    codigo: "ELE-01",
    concepto: "Punto de luz con mecanismo o foco LED empotrado",
    descripcion: "Tubo corrugado, cable libre de halógenos 1,5 mm2 y conexionado a caja de registro.",
    unidad: "ud",
    precioVenta: 4200, // 42,00 €
    costeEstimado: 2400,
  },
  {
    capituloId: "cap_electricidad",
    codigo: "ELE-02",
    concepto: "Punto de enchufe schuko con mecanismo estándar",
    descripcion: "Canalización, cable de 2,5 mm2 y mecanismo tipo Simon 270 o similar.",
    unidad: "ud",
    precioVenta: 4600,
    costeEstimado: 2600,
  },

  // 6. Revestimientos
  {
    capituloId: "cap_revestimientos",
    codigo: "REV-01",
    concepto: "Alicatado de paredes con azulejo porcelánico o gres",
    descripcion: "Colocación con cemento cola flexible C2TE y rejuntado con mortero hidrófugo.",
    unidad: "m2",
    precioVenta: 3200, // 32,00 €
    costeEstimado: 1950,
  },
  {
    capituloId: "cap_revestimientos",
    codigo: "REV-02",
    concepto: "Solado de suelo con pavimento porcelánico rectificado",
    descripcion: "Colocación con adhesivo de alta adherencia y crucetas autonivelantes, rejuntado fino.",
    unidad: "m2",
    precioVenta: 3450,
    costeEstimado: 2100,
  },

  // 8. Pintura
  {
    capituloId: "cap_pintura",
    codigo: "PIN-01",
    concepto: "Pintura plástica lisa lavable mate en techos y paredes",
    descripcion: "Plastecido de faltas, lijado y aplicación de dos manos de pintura acrílica de primera calidad.",
    unidad: "m2",
    precioVenta: 1250, // 12,50 €
    costeEstimado: 700,
  },

  // 9. Medios auxiliares y protecciones
  {
    capituloId: "cap_medios",
    codigo: "MED-01",
    concepto: "Protección integral de zonas de paso y ascensor",
    descripcion: "Colocación de cartón ondulado y plástico protector en zonas comunes del portal y pasillos.",
    unidad: "pa",
    precioVenta: 14000,
    costeEstimado: 7500,
  },

  // 10. Gestión de residuos
  {
    capituloId: "cap_limpieza",
    codigo: "LIM-01",
    concepto: "Gestión y tasa de contenedor de escombros de 5 m3",
    descripcion: "Colocación de contenedor en vía pública, retirada y canon de vertedero autorizado.",
    unidad: "ud",
    precioVenta: 26000, // 260,00 €
    costeEstimado: 21000,
  },
  {
    capituloId: "cap_limpieza",
    codigo: "LIM-02",
    concepto: "Limpieza fina de fin de obra para entrega al cliente",
    descripcion: "Aspirado, desincrustado de restos de obra en sanitarios y cristales.",
    unidad: "pa",
    precioVenta: 18000,
    costeEstimado: 11000,
  },
];
