CREATE TABLE `user_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text,
	`first_name` text,
	`last_name` text,
	`bio` text,
	`avatar_url` text,
	`theme` text DEFAULT 'system' NOT NULL,
	`email_notifications` text DEFAULT 'true' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
