CREATE TABLE `chat_messages` (
	`id` integer PRIMARY KEY NOT NULL,
	`connection_id` integer NOT NULL,
	`sender_id` text NOT NULL,
	`content` text NOT NULL,
	`timestamp` integer NOT NULL,
	FOREIGN KEY (`connection_id`) REFERENCES `connections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_one_id` text NOT NULL,
	`user_two_id` text NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`user_one_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_two_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP INDEX `artists_spotify_id_unique`;--> statement-breakpoint
ALTER TABLE `artists` DROP COLUMN `spotify_id`;--> statement-breakpoint
DROP INDEX `movies_tmdb_id_unique`;--> statement-breakpoint
ALTER TABLE `movies` DROP COLUMN `tmdb_id`;--> statement-breakpoint
DROP INDEX `venues_google_place_id_unique`;--> statement-breakpoint
ALTER TABLE `venues` DROP COLUMN `google_place_id`;