"use client"

import { useState, useTransition } from "react"
import {
  IconArrowBigDown,
  IconArrowBigDownFilled,
  IconArrowBigUp,
  IconArrowBigUpFilled,
  IconMessageCircle,
  IconServer,
  IconCode,
  IconNetwork,
  IconDatabase,
  IconDots,
  IconExternalLink,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  toggleItemVote,
  deleteWishlistItem,
  type WishlistItemWithMeta,
  type VoteType,
} from "@/app/actions/wishlist"

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  hardware: IconServer,
  software: IconCode,
  network: IconNetwork,
  storage: IconDatabase,
  other: IconDots,
}

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
}

interface WishlistItemCardProps {
  item: WishlistItemWithMeta
  userId: string
  onViewDetails: (item: WishlistItemWithMeta) => void
}

export function WishlistItemCard({
  item,
  userId,
  onViewDetails,
}: WishlistItemCardProps) {
  const [isPending, startTransition] = useTransition()
  const [voteState, setVoteState] = useState({
    upvotes: item.upvotes,
    downvotes: item.downvotes,
    userVote: item.userVote,
  })

  const score = voteState.upvotes - voteState.downvotes
  const CategoryIcon = categoryIcons[item.category] || IconDots
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
      } else {
        toast.error(result.error || "Failed to delete")
      }
    })
  }

  return (
    <Card className="group relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <CategoryIcon className="text-muted-foreground size-4 shrink-0" />
            <CardTitle
              className="cursor-pointer text-base hover:underline"
              onClick={() => onViewDetails(item)}
            >
              {item.name}
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={priorityColors[item.priority]}
            >
              {item.priority}
            </Badge>
            {isOwner && (
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
                  {item.link && (
                    <DropdownMenuItem asChild>
                      <a href={item.link} target="_blank" rel="noopener noreferrer">
                        <IconExternalLink className="size-4" />
                        Open Link
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    <IconTrash className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground line-clamp-2 text-sm">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              {item.category}
            </Badge>
            {item.estimatedCost && (
              <span className="text-muted-foreground text-xs">
                ~${item.estimatedCost.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2"
              onClick={() => onViewDetails(item)}
            >
              <IconMessageCircle className="size-3.5" />
              <span className="text-xs">{item.commentCount}</span>
            </Button>
            <div className="flex items-center gap-0.5">
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
                className={`min-w-[1.5rem] text-center text-xs font-medium ${
                  score > 0
                    ? "text-green-500"
                    : score < 0
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
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
          </div>
        </div>
        <div className="text-muted-foreground text-xs">
          by {item.submittedByName}
        </div>
      </CardContent>
    </Card>
  )
}
