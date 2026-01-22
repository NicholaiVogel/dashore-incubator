"use client"

import { useState, useTransition, useEffect } from "react"
import {
  IconArrowBigDown,
  IconArrowBigDownFilled,
  IconArrowBigUp,
  IconArrowBigUpFilled,
  IconThumbUp,
  IconThumbUpFilled,
  IconThumbDown,
  IconThumbDownFilled,
  IconExternalLink,
  IconSend,
  IconCornerDownRight,
  IconTrash,
  IconX,
} from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  getItemWithComments,
  toggleItemVote,
  addComment,
  deleteComment,
  toggleCommentVote,
  type WishlistItemWithMeta,
  type CommentWithMeta,
  type VoteType,
} from "@/app/actions/wishlist"

const priorityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/20",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
}

interface CommentItemProps {
  comment: CommentWithMeta
  userId: string
  isReply?: boolean
  onReply: (comment: CommentWithMeta) => void
  onDelete: (commentId: string, parentId: string | null) => void
  onVote: (commentId: string, voteType: VoteType, parentId: string | null) => void
  disabled?: boolean
}

function CommentItem({
  comment,
  userId,
  isReply = false,
  onReply,
  onDelete,
  onVote,
  disabled,
}: CommentItemProps) {
  const score = comment.upvotes - comment.downvotes
  const isOwner = comment.userId === userId

  return (
    <div className={isReply ? "ml-6 border-l-2 border-muted pl-4" : ""}>
      <div className="flex gap-3">
        <Avatar className="size-7">
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
            <span className="text-sm font-medium">{comment.userName}</span>
            <span className="text-muted-foreground text-xs">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
          <div className="flex items-center gap-1 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => onVote(comment.id, "up", comment.parentId)}
              disabled={disabled}
            >
              {comment.userVote === "up" ? (
                <IconThumbUpFilled className="size-3.5 text-green-500" />
              ) : (
                <IconThumbUp className="size-3.5" />
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
              className="h-6 w-6 p-0"
              onClick={() => onVote(comment.id, "down", comment.parentId)}
              disabled={disabled}
            >
              {comment.userVote === "down" ? (
                <IconThumbDownFilled className="size-3.5 text-red-500" />
              ) : (
                <IconThumbDown className="size-3.5" />
              )}
            </Button>
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6 gap-1 px-2 text-xs"
                onClick={() => onReply(comment)}
                disabled={disabled}
              >
                <IconCornerDownRight className="size-3" />
                Reply
              </Button>
            )}
            {isOwner && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={() => onDelete(comment.id, comment.parentId)}
                disabled={disabled}
              >
                <IconTrash className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              userId={userId}
              isReply
              onReply={onReply}
              onDelete={onDelete}
              onVote={onVote}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  )
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
  const [isPending, startTransition] = useTransition()
  const [comments, setComments] = useState<CommentWithMeta[]>([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<CommentWithMeta | null>(null)
  const [voteState, setVoteState] = useState({
    upvotes: item?.upvotes ?? 0,
    downvotes: item?.downvotes ?? 0,
    userVote: item?.userVote ?? null,
  })

  const score = voteState.upvotes - voteState.downvotes

  useEffect(() => {
    if (item && open) {
      setVoteState({
        upvotes: item.upvotes,
        downvotes: item.downvotes,
        userVote: item.userVote,
      })
      startTransition(async () => {
        const data = await getItemWithComments(item.id, userId)
        if (data) {
          setComments(data.comments)
          setVoteState({
            upvotes: data.upvotes,
            downvotes: data.downvotes,
            userVote: data.userVote,
          })
        }
      })
    }
  }, [item, open, userId])

  if (!item) return null

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

  const handleAddComment = () => {
    if (!newComment.trim() || isPending) return

    const parentId = replyingTo?.id
    startTransition(async () => {
      const result = await addComment(
        item.id,
        userId,
        userName,
        newComment.trim(),
        parentId
      )
      if (result.success) {
        const newCommentData: CommentWithMeta = {
          id: crypto.randomUUID(),
          itemId: item.id,
          parentId: parentId ?? null,
          userId,
          userName,
          content: newComment.trim(),
          createdAt: new Date().toISOString(),
          upvotes: 0,
          downvotes: 0,
          userVote: null,
          replies: [],
        }

        if (parentId) {
          setComments(
            comments.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...c.replies, newCommentData] }
                : c
            )
          )
        } else {
          setComments([...comments, newCommentData])
        }
        setNewComment("")
        setReplyingTo(null)
        toast.success(parentId ? "Reply added" : "Comment added")
      } else {
        toast.error(result.error || "Failed to add comment")
      }
    })
  }

  const handleDeleteComment = (commentId: string, parentId: string | null) => {
    startTransition(async () => {
      const result = await deleteComment(commentId, userId)
      if (result.success) {
        if (parentId) {
          setComments(
            comments.map((c) =>
              c.id === parentId
                ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
                : c
            )
          )
        } else {
          setComments(comments.filter((c) => c.id !== commentId))
        }
        toast.success("Comment deleted")
      } else {
        toast.error(result.error || "Failed to delete comment")
      }
    })
  }

  const handleCommentVote = (
    commentId: string,
    voteType: VoteType,
    parentId: string | null
  ) => {
    startTransition(async () => {
      const result = await toggleCommentVote(commentId, userId, voteType)
      if (result.success) {
        const updateComment = (c: CommentWithMeta): CommentWithMeta =>
          c.id === commentId
            ? {
                ...c,
                upvotes: result.upvotes,
                downvotes: result.downvotes,
                userVote: result.userVote,
              }
            : c

        if (parentId) {
          setComments(
            comments.map((c) =>
              c.id === parentId
                ? { ...c, replies: c.replies.map(updateComment) }
                : c
            )
          )
        } else {
          setComments(comments.map(updateComment))
        }
      } else {
        toast.error(result.error || "Failed to vote")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleVote("up")}
                disabled={isPending}
              >
                {voteState.userVote === "up" ? (
                  <IconArrowBigUpFilled className="size-5 text-green-500" />
                ) : (
                  <IconArrowBigUp className="size-5" />
                )}
              </Button>
              <span
                className={`min-w-[1.5rem] text-center text-sm font-medium ${
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
                className="h-8 w-8 p-0"
                onClick={() => handleVote("down")}
                disabled={isPending}
              >
                {voteState.userVote === "down" ? (
                  <IconArrowBigDownFilled className="size-5 text-red-500" />
                ) : (
                  <IconArrowBigDown className="size-5" />
                )}
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">
              Comments ({comments.length + comments.reduce((acc, c) => acc + c.replies.length, 0)})
            </h4>
            <ScrollArea className="h-[200px]">
              {comments.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                <div className="space-y-4 pr-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      userId={userId}
                      onReply={setReplyingTo}
                      onDelete={handleDeleteComment}
                      onVote={handleCommentVote}
                      disabled={isPending}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="space-y-2">
            {replyingTo && (
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2 text-sm">
                <IconCornerDownRight className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Replying to{" "}
                  <span className="font-medium text-foreground">
                    {replyingTo.userName}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-6 w-6 p-0"
                  onClick={() => setReplyingTo(null)}
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Textarea
                placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
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
                className="self-end"
              >
                <IconSend className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
