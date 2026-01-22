import { withAuth } from "@workos-inc/authkit-nextjs"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ProfileForm, ProfileFormSubmitButton } from "@/components/settings/profile-form"
import { ensureProfile } from "@/app/actions/profile"

export default async function ProfilePage() {
  const { user } = await withAuth()

  if (!user) {
    redirect("/")
  }

  const profile = await ensureProfile({
    id: user.id,
    email: user.email ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    profilePictureUrl: user.profilePictureUrl,
  })

  const sidebarUser = {
    name: profile.displayName,
    email: profile.email,
    avatar: profile.avatarUrl ?? "",
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={sidebarUser} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="px-4 py-8 lg:px-8">
              <div className="mx-auto max-w-2xl">
                <ProfileForm profile={profile}>
                  <div className="mb-8 flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight">
                        Profile Settings
                      </h1>
                      <p className="text-muted-foreground text-sm">
                        Manage your profile information and preferences
                      </p>
                    </div>
                    <ProfileFormSubmitButton />
                  </div>
                </ProfileForm>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
