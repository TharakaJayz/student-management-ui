"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Bell, LogOut, Menu, Search, UserCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getOwnerById } from "@/lib/api/institute-settings.api"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

type TopBarProps = {
  onToggleSidebar: () => void
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
  const router = useRouter()
  const [ownerDisplayName, setOwnerDisplayName] = useState<string | null>(null)
  const [logoutPending, setLogoutPending] = useState(false)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      const {
        data: { user },
      } = await getSupabaseBrowserClient().auth.getUser()
      if (!user || cancelled) return

      try {
        const owner = await getOwnerById(user.id)
        if (cancelled) return
        if (owner?.name) {
          setOwnerDisplayName(owner.name)
          return
        }
        setOwnerDisplayName(
          (typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : null) ??
            user.email ??
            "Account"
        )
      } catch {
        if (!cancelled) {
          setOwnerDisplayName(
            (typeof user.user_metadata?.full_name === "string"
              ? user.user_metadata.full_name
              : null) ??
              user.email ??
              "Account"
          )
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSignOut() {
    setLogoutPending(true)
    try {
      await getSupabaseBrowserClient().auth.signOut()
      router.push("/")
      router.refresh()
    } finally {
      setLogoutPending(false)
    }
  }

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border text-topbar-foreground bg-background">
      <div className="flex h-16 items-center">
        <div className="flex h-full w-72 shrink-0 items-center justify-between max-[700px]:justify-start px-4">
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 rounded-full bg-primary/10 text-center leading-9">
              🍛
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">Educa</p>
              <p className="text-xs text-muted-foreground max-[700px]:hidden">
                Institute App
              </p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-card-foreground hover:cursor-pointer max-[700px]:ml-5"
            aria-label="Toggle navigation"
            onClick={onToggleSidebar}
          >
            <Menu className="size-4 " />
          </button>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center px-4 max-[700px]:hidden">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search"
              className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 px-3 md:px-8">
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
          </button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto gap-2 rounded-full border-border bg-card px-2 py-1"
                aria-label="Open account menu"
              >
                <UserCircle2 className="size-7 shrink-0 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="truncate text-sm font-medium text-foreground">
                    {ownerDisplayName ?? "Loading…"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                disabled={logoutPending}
                onSelect={() => void handleSignOut()}
              >
                <LogOut className="size-4" />
                {logoutPending ? "Signing out…" : "Log out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export default TopBar
