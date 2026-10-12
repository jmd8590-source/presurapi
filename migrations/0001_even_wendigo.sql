CREATE TABLE `capitulo` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text,
	`nombre` text NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`icono` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `capitulo_empresa` ON `capitulo` (`empresa_id`,`orden`);--> statement-breakpoint
CREATE TABLE `linea_presupuesto` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`presupuesto_id` text NOT NULL,
	`opcion_id` text NOT NULL,
	`capitulo_id` text DEFAULT '' NOT NULL,
	`codigo_partida` text DEFAULT '' NOT NULL,
	`concepto` text NOT NULL,
	`descripcion` text DEFAULT '' NOT NULL,
	`unidad` text DEFAULT 'ud' NOT NULL,
	`cantidad` real DEFAULT 1 NOT NULL,
	`precio_unitario` integer DEFAULT 0 NOT NULL,
	`coste_unitario` integer DEFAULT 0 NOT NULL,
	`es_opcional` integer DEFAULT false NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `linea_presupuesto_empresa` ON `linea_presupuesto` (`empresa_id`);--> statement-breakpoint
CREATE INDEX `linea_presupuesto_opcion` ON `linea_presupuesto` (`presupuesto_id`,`opcion_id`,`orden`);--> statement-breakpoint
CREATE TABLE `opcion_presupuesto` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`presupuesto_id` text NOT NULL,
	`nombre` text NOT NULL,
	`orden` integer DEFAULT 0 NOT NULL,
	`es_seleccionada` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `opcion_presupuesto_empresa` ON `opcion_presupuesto` (`empresa_id`);--> statement-breakpoint
CREATE INDEX `opcion_presupuesto_id` ON `opcion_presupuesto` (`presupuesto_id`);--> statement-breakpoint
CREATE TABLE `partida` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`capitulo_id` text NOT NULL,
	`codigo` text DEFAULT '' NOT NULL,
	`concepto` text NOT NULL,
	`descripcion` text DEFAULT '' NOT NULL,
	`unidad` text DEFAULT 'ud' NOT NULL,
	`precio_venta` integer DEFAULT 0 NOT NULL,
	`coste_estimado` integer DEFAULT 0 NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`capitulo_id`) REFERENCES `capitulo`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `partida_empresa` ON `partida` (`empresa_id`,`concepto`);--> statement-breakpoint
CREATE INDEX `partida_capitulo` ON `partida` (`capitulo_id`);--> statement-breakpoint
CREATE TABLE `presupuesto` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`cliente_id` text NOT NULL,
	`obra_id` text,
	`codigo` text NOT NULL,
	`titulo` text NOT NULL,
	`estado` text DEFAULT 'borrador' NOT NULL,
	`iva_pct` real DEFAULT 21 NOT NULL,
	`retencion_pct` real DEFAULT 0 NOT NULL,
	`descuento_pct` real DEFAULT 0 NOT NULL,
	`condiciones` text DEFAULT '' NOT NULL,
	`validez_dias` integer DEFAULT 30 NOT NULL,
	`fecha_emision` integer NOT NULL,
	`notas_cliente` text DEFAULT '' NOT NULL,
	`notas_internas` text DEFAULT '' NOT NULL,
	`token_publico` text NOT NULL,
	`creado_en` integer NOT NULL,
	`actualizado_en` integer NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`obra_id`) REFERENCES `obra`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `presupuesto_empresa` ON `presupuesto` (`empresa_id`,`creado_en`);--> statement-breakpoint
CREATE INDEX `presupuesto_cliente` ON `presupuesto` (`cliente_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `presupuesto_token` ON `presupuesto` (`token_publico`);