CREATE TABLE `admin_wallets` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`payment_method` enum('bkash','nagad','rocket') NOT NULL,
	`wallet_number` varchar(20) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_wallets_payment_method_unique` UNIQUE(`payment_method`)
);
--> statement-breakpoint
CREATE TABLE `admins` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`username` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admins_id` PRIMARY KEY(`id`),
	CONSTRAINT `admins_username_unique` UNIQUE(`username`),
	CONSTRAINT `admins_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `balance_requests` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`payment_method` enum('bkash','nagad','rocket') NOT NULL,
	`sender_wallet` varchar(20) NOT NULL,
	`transaction_id` varchar(100) NOT NULL,
	`request_status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `balance_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_settings_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `tournament_participants` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`tournament_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`joined_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tournament_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`game_type` enum('battle_royale','clash_squad','lone_wolf') NOT NULL,
	`team_formation` enum('solo','duo','squad','1v1','2v2','4v4') NOT NULL DEFAULT 'solo',
	`max_players` int NOT NULL DEFAULT 50,
	`current_players` int NOT NULL DEFAULT 0,
	`entry_fee` decimal(10,2) NOT NULL,
	`prize_pool` decimal(10,2) NOT NULL,
	`room_id` varchar(50),
	`room_password` varchar(50),
	`tournament_status` enum('upcoming','active','started','waiting','finished','completed','cancelled') NOT NULL DEFAULT 'upcoming',
	`start_time` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tournaments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`username` varchar(50) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`balance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `withdraw_requests` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`payment_method` enum('bkash','nagad','rocket') NOT NULL,
	`receiver_wallet` varchar(20) NOT NULL,
	`request_status` enum('pending','approved','rejected','completed') NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `withdraw_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `balance_requests` ADD CONSTRAINT `balance_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tournament_participants` ADD CONSTRAINT `tournament_participants_tournament_id_tournaments_id_fk` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tournament_participants` ADD CONSTRAINT `tournament_participants_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `withdraw_requests` ADD CONSTRAINT `withdraw_requests_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;