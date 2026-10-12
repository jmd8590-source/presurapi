CREATE TABLE `envio_email` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`presupuesto_id` text NOT NULL,
	`destinatario` text NOT NULL,
	`asunto` text NOT NULL,
	`ok` integer DEFAULT false NOT NULL,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `envio_email_presupuesto` ON `envio_email` (`presupuesto_id`,`creado_en`);--> statement-breakpoint
CREATE INDEX `envio_email_empresa` ON `envio_email` (`empresa_id`);--> statement-breakpoint
CREATE TABLE `firma` (
	`id` text PRIMARY KEY NOT NULL,
	`empresa_id` text NOT NULL,
	`presupuesto_id` text NOT NULL,
	`accion` text NOT NULL,
	`opcion_id` text DEFAULT '' NOT NULL,
	`opcionales_ids` text DEFAULT '[]' NOT NULL,
	`nombre` text DEFAULT '' NOT NULL,
	`comentario` text DEFAULT '' NOT NULL,
	`firma_png` text DEFAULT '' NOT NULL,
	`ip_hash` text DEFAULT '' NOT NULL,
	`user_agent` text DEFAULT '' NOT NULL,
	`creado_en` integer NOT NULL,
	FOREIGN KEY (`empresa_id`) REFERENCES `empresa`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`presupuesto_id`) REFERENCES `presupuesto`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `firma_presupuesto` ON `firma` (`presupuesto_id`,`creado_en`);--> statement-breakpoint
CREATE INDEX `firma_empresa` ON `firma` (`empresa_id`);