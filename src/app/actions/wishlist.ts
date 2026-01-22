"use server"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@/db"
import {
  wishlistItems,
  wishlistVotes,
  wishlistComments,
  wishlistCommentVotes,
} from "@/db/schema"
import { eq, asc, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export type WishlistCategory =
  | "hardware"
  | "software"
  | "network"
  | "storage"
  | "other"
export type WishlistPriority = "critical" | "high" | "medium" | "low"
export type SortOption = "newest" | "oldest" | "votes" | "priority"

export interface WishlistItemInput {
  name: string
  description: string
  category: WishlistCategory
  priority: WishlistPriority
  estimatedCost?: number | null
  link?: string | null
}

export interface WishlistItemWithMeta {
  id: string
  name: string
  description: string
  category: string
  priority: string
  estimatedCost: number | null
  link: string | null
  submittedBy: string
  submittedByName: string
  createdAt: string
  voteCount: number
  commentCount: number
  hasVoted: boolean
}

function generateId(): string {
  return crypto.randomUUID()
}

export async function getWishlistItems(
  userId: string,
  category?: string,
  sortBy: SortOption = "newest"
): Promise<WishlistItemWithMeta[]> {
  const { env } = await getCloudflareContext()
  const db = getDb(env.DB)

  const items = await db
    .select({
      id: wishlistItems.id,
      name: wishlistItems.name,
      description: wishlistItems.description,
      category: wishlistItems.category,
      priority: wishlistItems.priority,
      estimatedCost: wishlistItems.estimatedCost,
      link: wishlistItems.link,
      submittedBy: wishlistItems.submittedBy,
      submittedByName: wishlistItems.submittedByName,
      createdAt: wishlistItems.createdAt,
    })
    .from(wishlistItems)
    .where(
      category && category !== "all"
        ? eq(wishlistItems.category, category)
        : undefined
    )

  const votes = await db.select().from(wishlistVotes)
  const comments = await db.select().from(wishlistComments)

  const itemsWithMeta = items.map((item) => {
    const itemVotes = votes.filter((v) => v.itemId === item.id)
    const itemComments = comments.filter((c) => c.itemId === item.id)
    return {
      ...item,
      voteCount: itemVotes.length,
      commentCount: itemComments.length,
      hasVoted: itemVotes.some((v) => v.userId === userId),
    }
  })

  const priorityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  switch (sortBy) {
    case "oldest":
      return itemsWithMeta.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case "votes":
      return itemsWithMeta.sort((a, b) => b.voteCount - a.voteCount)
    case "priority":
      return itemsWithMeta.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      )
    case "newest":
    default:
      return itemsWithMeta.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  }
}

export async function addWishlistItem(
  input: WishlistItemInput,
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext()
    const db = getDb(env.DB)

    await db.insert(wishlistItems).values({
      id: generateId(),
      name: input.name,
      description: input.description,
      category: input.category,
      priority: input.priority,
      estimatedCost: input.estimatedCost ?? null,
      link: input.link ?? null,
      submittedBy: userId,
      submittedByName: userName,
      createdAt: new Date().toISOString(),
    })

    revalidatePath("/dashboard/wishlist")
    return { success: true }
  } catch (error) {
    console.error("Failed to add wishlist item:", error)
    return { success: false, error: "Failed to add item" }
  }
}

export async function toggleVote(
  itemId: string,
  userId: string
): Promise<{ success: boolean; voted: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext()
    const db = getDb(env.DB)

    const existingVote = await db
      .select()
      .from(wishlistVotes)
      .where(
        and(eq(wishlistVotes.itemId, itemId), eq(wishlistVotes.userId, userId))
      )
      .limit(1)

    if (existingVote.length > 0) {
      await db
        .delete(wishlistVotes)
        .where(eq(wishlistVotes.id, existingVote[0].id))
      revalidatePath("/dashboard/wishlist")
      return { success: true, voted: false }
    } else {
      await db.insert(wishlistVotes).values({
        id: generateId(),
        itemId,
        userId,
        createdAt: new Date().toISOString(),
      })
      revalidatePath("/dashboard/wishlist")
      return { success: true, voted: true }
    }
  } catch (error) {
    console.error("Failed to toggle vote:", error)
    return { success: false, voted: false, error: "Failed to toggle vote" }
  }
}

export async function addComment(
  itemId: string,
  userId: string,
  userName: string,
  content: string,
  parentId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext()
    const db = getDb(env.DB)

    if (parentId) {
      const parent = await db
        .select()
        .from(wishlistComments)
        .where(eq(wishlistComments.id, parentId))
        .limit(1)

      if (parent.length === 0) {
        return { success: false, error: "Parent comment not found" }
      }
      if (parent[0].parentId !== null) {
        return { success: false, error: "Cannot reply to a reply" }
      }
    }

    await db.insert(wishlistComments).values({
      id: generateId(),
      itemId,
      parentId: parentId ?? null,
      userId,
      userName,
      content,
      createdAt: new Date().toISOString(),
    })

    revalidatePath("/dashboard/wishlist")
    return { success: true }
  } catch (error) {
    console.error("Failed to add comment:", error)
    return { success: false, error: "Failed to add comment" }
  }
}

export async function deleteComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext()
    const db = getDb(env.DB)

    const comment = await db
      .select()
      .from(wishlistComments)
      .where(eq(wishlistComments.id, commentId))
      .limit(1)

    if (comment.length === 0) {
      return { success: false, error: "Comment not found" }
    }

    if (comment[0].userId !== userId) {
      return { success: false, error: "You can only delete your own comments" }
    }

    await db
      .delete(wishlistComments)
      .where(eq(wishlistComments.parentId, commentId))
    await db.delete(wishlistComments).where(eq(wishlistComments.id, commentId))

    revalidatePath("/dashboard/wishlist")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete comment:", error)
    return { success: false, error: "Failed to delete comment" }
  }
}

export type VoteType = "up" | "down"

export interface ToggleVoteResult {
  success: boolean
  upvotes: number
  downvotes: number
  userVote: VoteType | null
  error?: string
}

export async function toggleCommentVote(
  commentId: string,
  userId: string,
  voteType: VoteType
): Promise<ToggleVoteResult> {
  try {
    const { env } = await getCloudflareContext()
    const db = getDb(env.DB)

    const existingVote = await db
      .select()
      .from(wishlistCommentVotes)
      .where(
        and(
          eq(wishlistCommentVotes.commentId, commentId),
          eq(wishlistCommentVotes.userId, userId)
        )
      )
      .limit(1)

    if (existingVote.length > 0) {
      if (existingVote[0].voteType === voteType) {
        await db
          .delete(wishlistCommentVotes)
          .where(eq(wishlistCommentVotes.id, existingVote[0].id))
      } else {
        await db
          .update(wishlistCommentVotes)
          .set({ voteType })
          .where(eq(wishlistCommentVotes.id, existingVote[0].id))
      }
    } else {
      await db.insert(wishlistCommentVotes).values({
        id: generateId(),
        commentId,
        userId,
        voteType,
        createdAt: new Date().toISOString(),
      })
    }

    const allVotes = await db
      .select()
      .from(wishlistCommentVotes)
      .where(eq(wishlistCommentVotes.commentId, commentId))

    const upvotes = allVotes.filter((v) => v.voteType === "up").length
    const downvotes = allVotes.filter((v) => v.voteType === "down").length
    const currentUserVote = allVotes.find((v) => v.userId === userId)

    revalidatePath("/dashboard/wishlist")
    return {
      success: true,
      upvotes,
      downvotes,
      userVote: currentUserVote ? (currentUserVote.voteType as VoteType) : null,
    }
  } catch (error) {
    console.error("Failed to toggle comment vote:", error)
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      error: "Failed to toggle vote",
    }
  }
}

export interface CommentWithMeta {
  id: string
  itemId: string
  parentId: string | null
  userId: string
  userName: string
  content: string
  createdAt: string
  upvotes: number
  downvotes: number
  userVote: VoteType | null
  replies: CommentWithMeta[]
}

export async function getItemWithComments(itemId: string, userId: string) {
  const { env } = await getCloudflareContext()
  const db = getDb(env.DB)

  const item = await db
    .select()
    .from(wishlistItems)
    .where(eq(wishlistItems.id, itemId))
    .limit(1)

  if (item.length === 0) {
    return null
  }

  const votes = await db
    .select()
    .from(wishlistVotes)
    .where(eq(wishlistVotes.itemId, itemId))

  const rawComments = await db
    .select()
    .from(wishlistComments)
    .where(eq(wishlistComments.itemId, itemId))
    .orderBy(asc(wishlistComments.createdAt))

  const commentIds = rawComments.map((c) => c.id)
  const commentVotes =
    commentIds.length > 0
      ? await db.select().from(wishlistCommentVotes)
      : []

  const commentsWithMeta: CommentWithMeta[] = rawComments.map((comment) => {
    const votesForComment = commentVotes.filter(
      (v) => v.commentId === comment.id
    )
    const upvotes = votesForComment.filter((v) => v.voteType === "up").length
    const downvotes = votesForComment.filter((v) => v.voteType === "down").length
    const userVoteRecord = votesForComment.find((v) => v.userId === userId)

    return {
      ...comment,
      upvotes,
      downvotes,
      userVote: userVoteRecord ? (userVoteRecord.voteType as VoteType) : null,
      replies: [],
    }
  })

  const topLevel = commentsWithMeta.filter((c) => c.parentId === null)
  const replies = commentsWithMeta.filter((c) => c.parentId !== null)

  for (const reply of replies) {
    const parent = topLevel.find((c) => c.id === reply.parentId)
    if (parent) {
      parent.replies.push(reply)
    }
  }

  return {
    ...item[0],
    voteCount: votes.length,
    hasVoted: votes.some((v) => v.userId === userId),
    comments: topLevel,
  }
}

export async function getWishlistStats(userId: string) {
  const { env } = await getCloudflareContext()
  const db = getDb(env.DB)

  const allItems = await db.select().from(wishlistItems)
  const allVotes = await db.select().from(wishlistVotes)

  const totalItems = allItems.length
  const yourItems = allItems.filter((i) => i.submittedBy === userId).length

  let mostWanted = null
  if (allItems.length > 0) {
    const itemVoteCounts = allItems.map((item) => ({
      item,
      votes: allVotes.filter((v) => v.itemId === item.id).length,
    }))
    const topItem = itemVoteCounts.sort((a, b) => b.votes - a.votes)[0]
    if (topItem.votes > 0) {
      mostWanted = { name: topItem.item.name, votes: topItem.votes }
    }
  }

  const recentItems = allItems
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5).length

  return {
    totalItems,
    yourItems,
    mostWanted,
    recentItems,
  }
}

export async function deleteWishlistItem(
  itemId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext()
    const db = getDb(env.DB)

    const item = await db
      .select()
      .from(wishlistItems)
      .where(eq(wishlistItems.id, itemId))
      .limit(1)

    if (item.length === 0) {
      return { success: false, error: "Item not found" }
    }

    if (item[0].submittedBy !== userId) {
      return { success: false, error: "You can only delete your own items" }
    }

    await db.delete(wishlistItems).where(eq(wishlistItems.id, itemId))

    revalidatePath("/dashboard/wishlist")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete wishlist item:", error)
    return { success: false, error: "Failed to delete item" }
  }
}
