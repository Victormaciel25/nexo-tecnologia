CREATE TABLE `contacts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`company` text NOT NULL,
	`service` text NOT NULL,
	`cep` text NOT NULL,
	`street` text NOT NULL,
	`number` text NOT NULL,
	`district` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`message` text NOT NULL,
	`consent` integer NOT NULL,
	`created_at` text NOT NULL
);
