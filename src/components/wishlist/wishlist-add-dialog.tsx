"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { addWishlistItem, type WishlistItemInput } from "@/app/actions/wishlist"

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  category: z.enum(["hardware", "software", "network", "storage", "other"]),
  priority: z.enum(["critical", "high", "medium", "low"]),
  estimatedCost: z.string().optional(),
  link: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface WishlistAddDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  userName: string
}

export function WishlistAddDialog({
  open,
  onOpenChange,
  userId,
  userName,
}: WishlistAddDialogProps) {
  const isMobile = useIsMobile()
  const [isPending, startTransition] = useTransition()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "hardware",
      priority: "medium",
      estimatedCost: "",
      link: "",
    },
  })

  const onSubmit = (data: FormData) => {
    const input: WishlistItemInput = {
      name: data.name,
      description: data.description,
      category: data.category,
      priority: data.priority,
      estimatedCost: data.estimatedCost ? Number(data.estimatedCost) : null,
      link: data.link || null,
    }

    startTransition(async () => {
      const result = await addWishlistItem(input, userId, userName)
      if (result.success) {
        toast.success("Item added to wishlist")
        form.reset()
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to add item")
      }
    })
  }

  const FormContent = (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="e.g., RTX 4090 GPU"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-destructive text-sm">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What is this for and why do we need it?"
          rows={3}
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-destructive text-sm">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={form.watch("category")}
            onValueChange={(value) =>
              form.setValue("category", value as FormData["category"])
            }
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hardware">Hardware</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="network">Network</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={form.watch("priority")}
            onValueChange={(value) =>
              form.setValue("priority", value as FormData["priority"])
            }
          >
            <SelectTrigger id="priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
          <Input
            id="estimatedCost"
            type="number"
            step="0.01"
            min="0"
            placeholder="Optional"
            {...form.register("estimatedCost")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link">Link</Label>
          <Input
            id="link"
            type="url"
            placeholder="Optional URL"
            {...form.register("link")}
          />
        </div>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add Wishlist Item</DrawerTitle>
            <DrawerDescription>
              Submit a new infrastructure request for the team to vote on.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4">{FormContent}</div>
          <DrawerFooter>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending}
            >
              {isPending ? "Adding..." : "Add Item"}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Wishlist Item</DialogTitle>
          <DialogDescription>
            Submit a new infrastructure request for the team to vote on.
          </DialogDescription>
        </DialogHeader>
        {FormContent}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? "Adding..." : "Add Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
