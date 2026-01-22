"use client"

import { useState, useTransition, useEffect } from "react"
import {
  IconThumbUp,
  IconThumbUpFilled,
  IconExternalLink,
  IconSend,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  getItemWithComments,
  toggleVote,
  addComment,
  type WishlistItemWithMeta,
} from "@/app/actions/wishlist"
import type { WishlistComment } from "@/db/schema"

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
}

interface WishlistItemDetailProps {
  item: WishlistItemWithMeta | null
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
}

export function WishlistItemDetail({
  item,
  open,
  onOpenChange,
  userId,
  userName,
}: WishlistItemDetailProps) {
  const isMobile = useIsMobile()
  const [isPending, startTransition] = useTransition()
  const [comments, setComments] = useState<WishlistComment[]>([])
  const [newComment, setNewComment] = useState("")
  const [voteState, setVoteState] = useState({
    hasVoted: item?.hasVoted ?? false,
    voteCount: item?.voteCount ?? 0,
  })

  useEffect(() => {
    if (item && open) {
      setVoteState({ hasVoted: item.hasVoted, voteCount: item.voteCount })
      startTransition(async () => {
        const data = await getItemWithComments(item.id, userId)
        if (data) {
          setComments(data.comments)
          setVoteState({ hasVoted: data.hasVoted, voteCount: data.voteCount })
        }
      })
    }
  }, [item, open, userId])

  if (!item) return null

  const handleVote = () => {
    const newVoted = !voteState.hasVoted
    const newCount = newVoted ? voteState.voteCount + 1 : voteState.voteCount - 1
    setVoteState({ hasVoted: newVoted, voteCount: newCount })

    startTransition(async () => {
      const result = await toggleVote(item.id, userId)
      if (!result.success) {
        setVoteState({ hasVoted: item.hasVoted, voteCount: item.voteCount })
        toast.error(result.error || "Failed to vote")
      }
    })
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return

    startTransition(async () => {
      const result = await addComment(item.id, userId, userName, newComment.trim())
      if (result.success) {
        setComments([
          ...comments,
          {
            id: crypto.randomUUID(),
            itemId: item.id,
            userId,
            userName,
            content: newComment.trim(),
            createdAt: new Date().toISOString(),
          },
        ])
        setNewComment("")
        toast.success("Comment added")
      } else {
        toast.error(result.error || "Failed to add comment")
      }
    })
  }

  const Content = (
    <>
      <div className="space-y-4 px-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{item.category}</Badge>
          <Badge variant="outline" className={priorityColors[item.priority]}>
            {item.priority}
          </Badge>
          {item.estimatedCost && (
            <Badge variant="outline">~${item.estimatedCost.toLocaleString()}</Badge>
          )}
        </div>

        <p className="text-muted-foreground text-sm">{item.description}</p>

        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary inline-flex items-center gap-1 text-sm hover:underline"
          >
            <IconExternalLink className="size-3.5" />
            View Link
          </a>
        )}

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">
            Submitted by {item.submittedByName} &middot;{" "}
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </span>
          <Button
            variant={voteState.hasVoted ? "default" : "outline"}
            size="sm"
            className="gap-1"
            onClick={handleVote}
            disabled={isPending}
          >
            {voteState.hasVoted ? (
              <IconThumbUpFilled className="size-4" />
            ) : (
              <IconThumbUp className="size-4" />
            )}
            {voteState.voteCount}
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            Comments ({comments.length})
          </h4>
          <ScrollArea className="h-[200px]">
            {comments.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-3 pr-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {comment.userName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {comment.userName}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </>
  )

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{item.name}</DrawerTitle>
        </DrawerHeader>
        {Content}
        <DrawerFooter>
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[60px] flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            <Button
              size="icon"
              onClick={handleAddComment}
              disabled={!newComment.trim() || isPending}
            >
              <IconSend className="size-4" />
            </Button>
          </div>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
