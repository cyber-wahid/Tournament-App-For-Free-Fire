-- Create uid_change_logs table
CREATE TABLE `uid_change_logs` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36) NOT NULL,
	`old_uid` varchar(20),
	`new_uid` varchar(20) NOT NULL,
	`changed_by` varchar(36),
	`change_reason` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `uid_change_logs_id` PRIMARY KEY(`id`)
);

-- Add free_fire_uid column with default value first
ALTER TABLE `users` ADD `free_fire_uid` varchar(20) DEFAULT '00000000000000000000';

-- Update existing users with a temporary UID (they will need to update their profile)
UPDATE `users` SET `free_fire_uid` = CONCAT('TEMP_', `id`) WHERE `free_fire_uid` = '00000000000000000000';

-- Now make the column NOT NULL and add unique constraint
ALTER TABLE `users` MODIFY `free_fire_uid` varchar(20) NOT NULL;
ALTER TABLE `users` ADD CONSTRAINT `users_free_fire_uid_unique` UNIQUE(`free_fire_uid`);

-- Add foreign key constraints
ALTER TABLE `uid_change_logs` ADD CONSTRAINT `uid_change_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
ALTER TABLE `uid_change_logs` ADD CONSTRAINT `uid_change_logs_changed_by_admins_id_fk` FOREIGN KEY (`changed_by`) REFERENCES `admins`(`id`) ON DELETE no action ON UPDATE no action;