"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { IconLoader2 } from "@tabler/icons-react"

import { WishlistStats } from "./wishlist-stats"
import { WishlistFilters } from "./wishlist-filters"
import { WishlistItemCard } from "./wishlist-item-card"
import { WishlistAddDialog } from "./wishlist-add-dialog"
import { WishlistItemDetail } from "./wishlist-item-detail"
import {
  getWishlistItems,
  getWishlistStats,
  type WishlistItemWithMeta,
  type SortOption,
} from "@/app/actions/wishlist"

interface WishlistTableProps {
  userId: string
  userName: string
}

export function WishlistTable({ userId, userName }: WishlistTableProps) {
  const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState<WishlistItemWithMeta[]>([])
  const [stats, setStats] = useState({
    totalItems: 0,
    yourItems: 0,
    mostWanted: null as { name: string; votes: number } | null,
    recentItems: 0,
  })
  const [category, setCategory] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WishlistItemWithMeta | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const fetchData = useCallback(() => {
    startTransition(async () => {
      const [itemsData, statsData] = await Promise.all([
        getWishlistItems(userId, category === "all" ? undefined : category, sortBy),
        getWishlistStats(userId),
      ])
      setItems(itemsData)
      setStats(statsData)
    })
  }, [userId, category, sortBy])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleViewDetails = (item: WishlistItemWithMeta) => {
    setSelectedItem(item)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <WishlistStats stats={stats} />

      <WishlistFilters
        category={category}
        sortBy={sortBy}
        onCategoryChange={setCategory}
        onSortChange={(sort) => setSortBy(sort as SortOption)}
        onAddClick={() => setAddDialogOpen(true)}
      />

      <div className="px-4 lg:px-6">
        {isPending && items.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <IconLoader2 className="text-muted-foreground size-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <p className="text-muted-foreground text-center">
              No wishlist items yet.
            </p>
            <p className="text-muted-foreground text-center text-sm">
              Be the first to add something!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <WishlistItemCard
                key={item.id}
                item={item}
                userId={userId}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      <WishlistAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        userId={userId}
        userName={userName}
      />

      <WishlistItemDetail
        item={selectedItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        userId={userId}
        userName={userName}
      />
    </div>
  )
}
