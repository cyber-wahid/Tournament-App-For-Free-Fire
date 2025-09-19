CREATE TABLE `password_reset_tokens` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
ALTER TABLE `uid_change_logs` MODIFY COLUMN `old_uid` varchar(9);--> statement-breakpoint
ALTER TABLE `uid_change_logs` MODIFY COLUMN `new_uid` varchar(9) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `free_fire_uid` varchar(9) NOT NULL;--> statement-breakpoint
ALTER TABLE `tournament_participants` ADD `free_fire_uid` varchar(9);--> statement-breakpoint
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;