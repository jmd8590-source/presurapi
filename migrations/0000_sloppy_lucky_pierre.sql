CREATE TABLE `cliente` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`nombre` text NOT NULL,
	`nif` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`telefono` text DEFAULT '' NOT NULL,
	`direccion` text DEFAULT '' NOT NULL,
	`notas` text DEFAULT '' NOT NULL,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cliente_empresa` ON `cliente` (`empresa_id`,`nombre`);--> statement-breakpoint
CREATE TABLE `empresa` (
	`id` text PRIMARY KEY NOT NULL,
	`nombre` text DEFAULT '' NOT NULL,
	`cif` text DEFAULT '' NOT NULL,
	`direccion` text DEFAULT '' NOT NULL,
	`cp` text DEFAULT '' NOT NULL,
	`poblacion` text DEFAULT '' NOT NULL,
	`provincia` text DEFAULT '' NOT NULL,
	`telefono` text DEFAULT '' NOT NULL,
	`email_contacto` text DEFAULT '' NOT NULL,
	`logo_key` text DEFAULT '' NOT NULL,
	`iva_pct` real DEFAULT 21 NOT NULL,
	`condiciones` text DEFAULT '' NOT NULL,
	`pie_pdf` text DEFAULT '' NOT NULL,
	`onboarding_hecho` integer DEFAULT false NOT NULL,
	`creado_en` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `intento_acceso` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`clave` text NOT NULL,
	`tipo` text NOT NULL,
	`ts` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `intento_clave` ON `intento_acceso` (`tipo`,`clave`,`ts`);--> statement-breakpoint
CREATE TABLE `obra` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`cliente_id` text NOT NULL,
	`nombre` text NOT NULL,
	`direccion` text DEFAULT '' NOT NULL,
	`estado` text DEFAULT 'pendiente' NOT NULL,
	`notas` text DEFAULT '' NOT NULL,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`cliente_id`) REFERENCES `cliente`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `obra_empresa` ON `obra` (`empresa_id`,`creado_en`);--> statement-breakpoint
CREATE INDEX `obra_cliente` ON `obra` (`cliente_id`);--> statement-breakpoint
CREATE TABLE `sesion` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`expira_en` integer NOT NULL,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `sesion_usuario` ON `sesion` (`usuario_id`);--> statement-breakpoint
CREATE TABLE `token_reset` (
	`id` text PRIMARY KEY NOT NULL,
	`usuario_id` text NOT NULL,
	`expira_en` integer NOT NULL,
	FOREIGN KEY (`usuario_id`) REFERENCES `usuario`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `token_reset_usuario` ON `token_reset` (`usuario_id`);--> statement-breakpoint
CREATE TABLE `usuario` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`email` text NOT NULL,
	`nombre` text NOT NULL,
	`password_hash` text NOT NULL,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuario_email` ON `usuario` (`email`);--> statement-breakpoint
CREATE INDEX `usuario_empresa` ON `usuario` (`empresa_id`);