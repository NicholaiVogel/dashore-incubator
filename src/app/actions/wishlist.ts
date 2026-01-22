"use server"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@/db"
import { wishlistItems, wishlistVotes, wishlistComments } from "@/db/schema"
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
  content: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext()
    const db = getDb(env.DB)

    await db.insert(wishlistComments).values({
      id: generateId(),
      itemId,
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

  const comments = await db
    .select()
    .from(wishlistComments)
    .where(eq(wishlistComments.itemId, itemId))
    .orderBy(asc(wishlistComments.createdAt))

  return {
    ...item[0],
    voteCount: votes.length,
    hasVoted: votes.some((v) => v.userId === userId),
    comments,
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
