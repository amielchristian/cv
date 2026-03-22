CREATE TABLE `awards` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`conferrer` text NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `education` (
	`id` text PRIMARY KEY NOT NULL,
	`institution` text NOT NULL,
	`program` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`addenda` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `experience` (
	`id` text PRIMARY KEY NOT NULL,
	`organization` text NOT NULL,
	`role` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`bullets` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leadership` (
	`id` text PRIMARY KEY NOT NULL,
	`organization` text NOT NULL,
	`role` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`bullets` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`links_json` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skill_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`skills` text NOT NULL
);
