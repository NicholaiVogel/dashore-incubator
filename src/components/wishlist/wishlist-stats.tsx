"use client"

import { Card } from "@/components/ui/card"
import type { WishlistStats as WishlistStatsType } from "@/app/actions/wishlist"

interface WishlistStatsProps {
  stats: WishlistStatsType
}

export function WishlistStats({ stats }: WishlistStatsProps) {
  return (
    <div className="px-4 lg:px-6">
      <Card className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span>
            <span className="text-muted-foreground">Total Items:</span>{" "}
            <span className="font-medium">{stats.totalItems}</span>
          </span>
          <span className="text-muted-foreground">|</span>
          <span>
            <span className="text-muted-foreground">High Priority:</span>{" "}
            <span className="font-medium">{stats.highPriority}</span>
          </span>
          <span className="text-muted-foreground">|</span>
          <span>
            <span className="text-muted-foreground">Your Submissions:</span>{" "}
            <span className="font-medium">{stats.yourSubmissions}</span>
          </span>
          <span className="text-muted-foreground">|</span>
          <span>
            <span className="text-muted-foreground">Est. Total Budget:</span>{" "}
            <span className="font-medium">
              ${stats.totalBudget.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </span>
        </div>
      </Card>
    </div>
  )
}
