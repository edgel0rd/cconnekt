CREATE TABLE `artists` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`spotify_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artists_name_unique` ON `artists` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `artists_spotify_id_unique` ON `artists` (`spotify_id`);--> statement-breakpoint
CREATE TABLE `movies` (
	`id` integer PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`tmdb_id` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `movies_title_unique` ON `movies` (`title`);--> statement-breakpoint
CREATE UNIQUE INDEX `movies_tmdb_id_unique` ON `movies` (`tmdb_id`);--> statement-breakpoint
CREATE TABLE `user_artists` (
	`user_id` text NOT NULL,
	`artist_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `artist_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist_id`) REFERENCES `artists`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_movies` (
	`user_id` text NOT NULL,
	`movie_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `movie_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_venues` (
	`user_id` text NOT NULL,
	`venue_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `venue_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `venues` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`google_place_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `venues_google_place_id_unique` ON `venues` (`google_place_id`);