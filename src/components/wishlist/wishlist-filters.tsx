"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface WishlistFiltersProps {
  search: string
  category: string
  priority: string
  sortBy: string
  onSearchChange: (search: string) => void
  onCategoryChange: (category: string) => void
  onPriorityChange: (priority: string) => void
  onSortChange: (sort: string) => void
}

export function WishlistFilters({
  search,
  category,
  priority,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onPriorityChange,
  onSortChange,
}: WishlistFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 px-4 lg:px-6">
      <Input
        placeholder="Search items..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-9 w-56"
      />

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-40">
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

      <Select value={priority} onValueChange={onPriorityChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priorities</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="score">Top Score</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
          <SelectItem value="priority">Priority</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
