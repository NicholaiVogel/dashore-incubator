CREATE TABLE `wishlist_comment_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`comment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`vote_type` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`comment_id`) REFERENCES `wishlist_comments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `wishlist_comments` ADD `parent_id` text;