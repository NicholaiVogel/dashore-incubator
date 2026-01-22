-- SQLite doesn't support ADD COLUMN with NOT NULL without a default
-- So we need to set a default and then remove it, or use a temp table approach
-- Using default approach since SQLite allows adding column with default
ALTER TABLE `wishlist_votes` ADD `vote_type` text NOT NULL DEFAULT 'up';
