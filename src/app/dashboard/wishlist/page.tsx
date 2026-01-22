import { withAuth } from "@workos-inc/authkit-nextjs"
import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { WishlistTable } from "@/components/wishlist/wishlist-table"
import { ensureProfile } from "@/app/actions/profile"

export default async function WishlistPage() {
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
            <WishlistTable userId={user.id} userName={profile.displayName} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
