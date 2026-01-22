"use client"

import { IconPlus } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface WishlistFiltersProps {
  category: string
  sortBy: string
  onCategoryChange: (category: string) => void
  onSortChange: (sort: string) => void
  onAddClick: () => void
}

export function WishlistFilters({
  category,
  sortBy,
  onCategoryChange,
  onSortChange,
  onAddClick,
}: WishlistFiltersProps) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[140px]" size="sm">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="hardware">Hardware</SelectItem>
            <SelectItem value="software">Software</SelectItem>
            <SelectItem value="network">Network</SelectItem>
            <SelectItem value="storage">Storage</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[130px]" size="sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="votes">Most Votes</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button size="sm" onClick={onAddClick}>
        <IconPlus className="size-4" />
        <span className="hidden sm:inline">Add Item</span>
      </Button>
    </div>
  )
}
