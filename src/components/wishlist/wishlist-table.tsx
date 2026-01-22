"use client"

import { useState, useEffect, useTransition, useCallback, useMemo } from "react"
import {
  IconArrowBigDown,
  IconArrowBigDownFilled,
  IconArrowBigUp,
  IconArrowBigUpFilled,
  IconClipboardList,
  IconDownload,
  IconDots,
  IconExternalLink,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconLoader2,
  IconPlus,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { WishlistStats } from "./wishlist-stats"
import { WishlistFilters } from "./wishlist-filters"
import { WishlistAddDialog } from "./wishlist-add-dialog"
import { WishlistItemDetail } from "./wishlist-item-detail"
import {
  getWishlistItems,
  getWishlistStats,
  toggleItemVote,
  deleteWishlistItem,
  type WishlistItemWithMeta,
  type WishlistStats as WishlistStatsType,
  type SortOption,
  type VoteType,
} from "@/app/actions/wishlist"

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
}

interface WishlistTableProps {
  userId: string
  userName: string
}

export function WishlistTable({ userId, userName }: WishlistTableProps) {
  const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState<WishlistItemWithMeta[]>([])
  const [stats, setStats] = useState<WishlistStatsType>({
    totalItems: 0,
    highPriority: 0,
    yourSubmissions: 0,
    totalBudget: 0,
  })
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [priority, setPriority] = useState("all")
  const [sortBy, setSortBy] = useState<SortOption>("score")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<WishlistItemWithMeta | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
      const matchesPriority = priority === "all" || item.priority === priority
      return matchesSearch && matchesPriority
    })
  }, [items, search, priority])

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

  const getExportData = () => {
    const headers = ["Name", "Description", "Category", "Priority", "Est. Cost", "Score", "Submitted By", "Created"]
    const rows = filteredItems.map((item) => [
      item.name,
      item.description,
      item.category,
      item.priority,
      item.estimatedCost ? `$${item.estimatedCost}` : "—",
      item.score.toString(),
      item.submittedByName,
      new Date(item.createdAt).toLocaleDateString(),
    ])
    return { headers, rows }
  }

  const handleExportCSV = () => {
    const { headers, rows } = getExportData()
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `wishlist-export-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Exported as CSV")
  }

  const handleExportPDF = () => {
    const { headers, rows } = getExportData()
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.text("Infrastructure Wishlist", 14, 22)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Exported on ${new Date().toLocaleDateString()}`, 14, 30)

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 38,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 37, 36] },
      columnStyles: {
        1: { cellWidth: 50 },
      },
    })

    doc.save(`wishlist-export-${new Date().toISOString().split("T")[0]}.pdf`)
    toast.success("Exported as PDF")
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
            <IconClipboardList className="text-primary size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Infrastructure Wishlist
            </h1>
            <p className="text-muted-foreground text-sm">
              Request and vote on infrastructure items
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={filteredItems.length === 0}
                className="gap-2"
              >
                <IconDownload className="size-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <IconFileSpreadsheet className="size-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                <IconFileTypePdf className="size-4" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isPending}
            className="gap-2"
          >
            <IconRefresh className={cn("size-4", isPending && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button size="sm" onClick={() => setAddDialogOpen(true)} className="gap-2">
            <IconPlus className="size-4" />
            <span className="hidden sm:inline">Add Item</span>
          </Button>
        </div>
      </div>

      <WishlistStats stats={stats} />

      <WishlistFilters
        search={search}
        category={category}
        priority={priority}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onPriorityChange={setPriority}
        onSortChange={(sort) => setSortBy(sort as SortOption)}
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
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <p className="text-muted-foreground text-center">
              No items match your filters.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="hidden lg:table-cell">Est. Cost</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="hidden sm:table-cell">Submitted By</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <WishlistTableRow
                    key={item.id}
                    item={item}
                    userId={userId}
                    onViewDetails={handleViewDetails}
                    onRefresh={fetchData}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <WishlistAddDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        userId={userId}
        userName={userName}
        onSuccess={fetchData}
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

interface WishlistTableRowProps {
  item: WishlistItemWithMeta
  userId: string
  onViewDetails: (item: WishlistItemWithMeta) => void
  onRefresh: () => void
}

function WishlistTableRow({ item, userId, onViewDetails, onRefresh }: WishlistTableRowProps) {
  const [isPending, startTransition] = useTransition()
  const [voteState, setVoteState] = useState({
    upvotes: item.upvotes,
    downvotes: item.downvotes,
    userVote: item.userVote,
  })

  const score = voteState.upvotes - voteState.downvotes
  const isOwner = item.submittedBy === userId

  const handleVote = (voteType: VoteType) => {
    const prevState = { ...voteState }
    let newUpvotes = voteState.upvotes
    let newDownvotes = voteState.downvotes
    let newUserVote: VoteType | null = voteType

    if (voteState.userVote === voteType) {
      if (voteType === "up") newUpvotes--
      else newDownvotes--
      newUserVote = null
    } else if (voteState.userVote) {
      if (voteState.userVote === "up") newUpvotes--
      else newDownvotes--
      if (voteType === "up") newUpvotes++
      else newDownvotes++
    } else {
      if (voteType === "up") newUpvotes++
      else newDownvotes++
    }

    setVoteState({ upvotes: newUpvotes, downvotes: newDownvotes, userVote: newUserVote })

    startTransition(async () => {
      const result = await toggleItemVote(item.id, userId, voteType)
      if (!result.success) {
        setVoteState(prevState)
        toast.error(result.error || "Failed to vote")
      } else {
        setVoteState({
          upvotes: result.upvotes,
          downvotes: result.downvotes,
          userVote: result.userVote,
        })
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteWishlistItem(item.id, userId)
      if (result.success) {
        toast.success("Item deleted")
        onRefresh()
      } else {
        toast.error(result.error || "Failed to delete")
      }
    })
  }

  return (
    <TableRow className="group">
      <TableCell>
        <button
          className="text-left font-medium hover:underline"
          onClick={() => onViewDetails(item)}
        >
          {item.name}
        </button>
        <p className="text-muted-foreground line-clamp-1 text-xs md:hidden">
          {item.category}
        </p>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <Badge variant="secondary" className="text-xs">
          {item.category}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn("text-xs", priorityColors[item.priority])}>
          {item.priority}
        </Badge>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {item.estimatedCost ? (
          <span className="text-muted-foreground text-sm">
            ${item.estimatedCost.toLocaleString()}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleVote("up")}
            disabled={isPending}
          >
            {voteState.userVote === "up" ? (
              <IconArrowBigUpFilled className="size-4 text-green-500" />
            ) : (
              <IconArrowBigUp className="size-4" />
            )}
          </Button>
          <span
            className={cn(
              "min-w-[1.5rem] text-center text-xs font-medium",
              score > 0 && "text-green-500",
              score < 0 && "text-red-500",
              score === 0 && "text-muted-foreground"
            )}
          >
            {score}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => handleVote("down")}
            disabled={isPending}
          >
            {voteState.userVote === "down" ? (
              <IconArrowBigDownFilled className="size-4 text-red-500" />
            ) : (
              <IconArrowBigDown className="size-4" />
            )}
          </Button>
        </div>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <span className="text-muted-foreground text-sm">{item.submittedByName}</span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100"
            >
              <IconDots className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(item)}>
              View Details
            </DropdownMenuItem>
            {item.link && (
              <DropdownMenuItem asChild>
                <a href={item.link} target="_blank" rel="noopener noreferrer">
                  <IconExternalLink className="size-4" />
                  Open Link
                </a>
              </DropdownMenuItem>
            )}
            {isOwner && (
              <DropdownMenuItem
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <IconTrash className="size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
