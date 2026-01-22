import { sqliteTable, text, real } from "drizzle-orm/sqlite-core"

export const wishlistItems = sqliteTable("wishlist_items", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // hardware, software, network, storage, other
  priority: text("priority").notNull(), // critical, high, medium, low
  estimatedCost: real("estimated_cost"),
  link: text("link"),
  submittedBy: text("submitted_by").notNull(),
  submittedByName: text("submitted_by_name").notNull(),
  createdAt: text("created_at").notNull(),
})

export const wishlistVotes = sqliteTable("wishlist_votes", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => wishlistItems.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  voteType: text("vote_type").notNull(), // "up" | "down"
  createdAt: text("created_at").notNull(),
})

export const wishlistComments = sqliteTable("wishlist_comments", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => wishlistItems.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
})

export const wishlistCommentVotes = sqliteTable("wishlist_comment_votes", {
  id: text("id").primaryKey(),
  commentId: text("comment_id")
    .notNull()
    .references(() => wishlistComments.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  voteType: text("vote_type").notNull(), // "up" | "down"
  createdAt: text("created_at").notNull(),
})

export type WishlistItem = typeof wishlistItems.$inferSelect
export type WishlistVote = typeof wishlistVotes.$inferSelect
export type WishlistComment = typeof wishlistComments.$inferSelect
export type WishlistCommentVote = typeof wishlistCommentVotes.$inferSelect
