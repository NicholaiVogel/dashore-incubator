"use client"

import { createContext, useContext, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { updateProfile, type ProfileData } from "@/app/actions/profile"

const ProfileFormContext = createContext<{ isPending: boolean } | null>(null)

function useProfileForm() {
  const ctx = useContext(ProfileFormContext)
  if (!ctx) throw new Error("useProfileForm must be used within ProfileForm")
  return ctx
}

export function ProfileFormSubmitButton() {
  const { isPending } = useProfileForm()
  return (
    <Button
      type="submit"
      form="profile-form"
      disabled={isPending}
      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6"
    >
      {isPending ? "Saving..." : "Save Changes"}
    </Button>
  )
}

const formSchema = z.object({
  displayName: z.string().max(50, "Display name too long").optional(),
  firstName: z.string().max(50, "First name too long").optional(),
  lastName: z.string().max(50, "Last name too long").optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  theme: z.enum(["system", "light", "dark"]),
  emailNotifications: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

interface ProfileFormProps {
  profile: ProfileData
  formId?: string
  children?: React.ReactNode
}

export function ProfileForm({ profile, formId = "profile-form", children }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { setTheme } = useTheme()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: profile.displayName === profile.email.split("@")[0]
        ? ""
        : profile.displayName,
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      bio: profile.bio ?? "",
      theme: profile.theme as "system" | "light" | "dark",
      emailNotifications: profile.emailNotifications,
    },
  })

  const onSubmit = (data: FormData) => {
    startTransition(async () => {
      const result = await updateProfile(profile.id, {
        displayName: data.displayName || undefined,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        bio: data.bio || undefined,
        theme: data.theme,
        emailNotifications: data.emailNotifications,
      })

      if (result.success) {
        toast.success("Profile updated")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update profile")
      }
    })
  }

  return (
    <ProfileFormContext.Provider value={{ isPending }}>
      {children}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Avatar</CardTitle>
            <CardDescription>
              Your avatar is managed through your authentication provider
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatarUrl ?? ""} alt={profile.displayName} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.displayName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profile.displayName}</p>
                <p className="text-muted-foreground text-sm">{profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your display name and personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                placeholder={profile.displayName}
                className="bg-muted/50 border-0"
                {...form.register("displayName")}
              />
              {form.formState.errors.displayName && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.displayName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder={profile.firstName ?? ""}
                  className="bg-muted/50 border-0"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder={profile.lastName ?? ""}
                  className="bg-muted/50 border-0"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-destructive text-sm">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself"
                className="bg-muted/50 border-0 min-h-[100px]"
                {...form.register("bio")}
              />
              {form.formState.errors.bio && (
                <p className="text-destructive text-sm">
                  {form.formState.errors.bio.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={form.watch("theme")}
                onValueChange={(value) => {
                  form.setValue("theme", value as FormData["theme"])
                  setTheme(value)
                }}
              >
                <SelectTrigger id="theme" className="w-40 bg-muted/50 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-muted-foreground text-sm">
                  Receive email updates about activity
                </p>
              </div>
              <Switch
                id="emailNotifications"
                checked={form.watch("emailNotifications")}
                onCheckedChange={(checked) =>
                  form.setValue("emailNotifications", checked)
                }
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </CardContent>
        </Card>

      </form>
      </div>
    </ProfileFormContext.Provider>
  )
}
