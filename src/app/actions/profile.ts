"use server"

import { getCloudflareContext } from "@opennextjs/cloudflare"
import { getDb } from "@/db"
import { userProfiles } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export interface WorkOSUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  profilePictureUrl?: string | null
}

export interface ProfileData {
  id: string
  email: string
  displayName: string
  firstName: string | null
  lastName: string | null
  bio: string | null
  avatarUrl: string | null
  theme: string
  emailNotifications: boolean
}

export interface UpdateProfileInput {
  displayName?: string
  firstName?: string
  lastName?: string
  bio?: string
  theme?: string
  emailNotifications?: boolean
}

function computeDisplayName(
  displayName: string | null | undefined,
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  email: string
): string {
  if (displayName) return displayName
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (firstName) return firstName
  if (lastName) return lastName
  return email.split("@")[0]
}

export async function ensureProfile(workosUser: WorkOSUser): Promise<ProfileData> {
  const { env } = await getCloudflareContext()
  const db = getDb(env.DB)

  const existing = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, workosUser.id))
    .limit(1)

  if (existing.length > 0) {
    const profile = existing[0]
    return {
      id: profile.id,
      email: profile.email,
      displayName: computeDisplayName(
        profile.displayName,
        profile.firstName,
        profile.lastName,
        profile.email
      ),
      firstName: profile.firstName,
      lastName: profile.lastName,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl ?? workosUser.profilePictureUrl ?? null,
      theme: profile.theme,
      emailNotifications: profile.emailNotifications === "true",
    }
  }

  const now = new Date().toISOString()
  await db.insert(userProfiles).values({
    id: workosUser.id,
    email: workosUser.email,
    displayName: null,
    firstName: workosUser.firstName ?? null,
    lastName: workosUser.lastName ?? null,
    bio: null,
    avatarUrl: workosUser.profilePictureUrl ?? null,
    theme: "system",
    emailNotifications: "true",
    createdAt: now,
    updatedAt: now,
  })

  return {
    id: workosUser.id,
    email: workosUser.email,
    displayName: computeDisplayName(
      null,
      workosUser.firstName,
      workosUser.lastName,
      workosUser.email
    ),
    firstName: workosUser.firstName ?? null,
    lastName: workosUser.lastName ?? null,
    bio: null,
    avatarUrl: workosUser.profilePictureUrl ?? null,
    theme: "system",
    emailNotifications: true,
  }
}

export async function getProfile(userId: string): Promise<ProfileData | null> {
  const { env } = await getCloudflareContext()
  const db = getDb(env.DB)

  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, userId))
    .limit(1)

  if (result.length === 0) return null

  const profile = result[0]
  return {
    id: profile.id,
    email: profile.email,
    displayName: computeDisplayName(
      profile.displayName,
      profile.firstName,
      profile.lastName,
      profile.email
    ),
    firstName: profile.firstName,
    lastName: profile.lastName,
    bio: profile.bio,
    avatarUrl: profile.avatarUrl,
    theme: profile.theme,
    emailNotifications: profile.emailNotifications === "true",
  }
}

export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { env } = await getCloudflareContext()
    const db = getDb(env.DB)

    const updates: Record<string, string> = {
      updatedAt: new Date().toISOString(),
    }

    if (input.displayName !== undefined) {
      updates.displayName = input.displayName
    }
    if (input.firstName !== undefined) {
      updates.firstName = input.firstName
    }
    if (input.lastName !== undefined) {
      updates.lastName = input.lastName
    }
    if (input.bio !== undefined) {
      updates.bio = input.bio
    }
    if (input.theme !== undefined) {
      updates.theme = input.theme
    }
    if (input.emailNotifications !== undefined) {
      updates.emailNotifications = input.emailNotifications ? "true" : "false"
    }

    await db
      .update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.id, userId))

    revalidatePath("/dashboard/settings/profile")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/wishlist")

    return { success: true }
  } catch (error) {
    console.error("Failed to update profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}
