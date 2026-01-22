"use client"

import { IconList, IconStar, IconUser, IconClock } from "@tabler/icons-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface WishlistStatsProps {
  stats: {
    totalItems: number
    yourItems: number
    mostWanted: { name: string; votes: number } | null
    recentItems: number
  }
}

export function WishlistStats({ stats }: WishlistStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Total Items</CardDescription>
          <IconList className="text-muted-foreground size-4" />
        </CardHeader>
        <CardTitle className="px-6 pb-6 text-2xl font-semibold tabular-nums">
          {stats.totalItems}
        </CardTitle>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Most Wanted</CardDescription>
          <IconStar className="text-muted-foreground size-4" />
        </CardHeader>
        <CardTitle className="px-6 pb-6 text-2xl font-semibold">
          {stats.mostWanted ? (
            <span className="flex items-center gap-2">
              <span className="truncate">{stats.mostWanted.name}</span>
              <span className="text-muted-foreground text-sm font-normal">
                ({stats.mostWanted.votes} votes)
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground text-base font-normal">
              No votes yet
            </span>
          )}
        </CardTitle>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Your Submissions</CardDescription>
          <IconUser className="text-muted-foreground size-4" />
        </CardHeader>
        <CardTitle className="px-6 pb-6 text-2xl font-semibold tabular-nums">
          {stats.yourItems}
        </CardTitle>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardDescription>Recent (Last 5)</CardDescription>
          <IconClock className="text-muted-foreground size-4" />
        </CardHeader>
        <CardTitle className="px-6 pb-6 text-2xl font-semibold tabular-nums">
          {stats.recentItems}
        </CardTitle>
      </Card>
    </div>
  )
}
