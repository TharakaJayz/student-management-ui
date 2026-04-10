"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Bell,
  BookOpen,
  GraduationCap,
  Home,
  Menu,
  Search,
  Settings,
  Users,
  UserCircle2,
} from "lucide-react"

const primaryNav = [
  { title: "Dashboard", icon: Home },
  { title: "Students", icon: GraduationCap },
  { title: "Classes", icon: BookOpen },
  { title: "Teachers", icon: Users },
  { title: "Institute Settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background text-card-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-topbar text-topbar-foreground">
        <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="size-9 shrink-0 rounded-full bg-primary/10 text-center leading-9">
              🍛
            </div>
            <div>
              <p className="text-sm font-semibold tracking-wide">CURRY KING</p>
              <p className="text-xs text-muted-foreground">Product App</p>
            </div>
            <button
              type="button"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-card text-card-foreground"
              aria-label="Toggle navigation"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
            >
              <Menu className="size-4" />
            </button>
            <div className="relative w-68 max-w-full sm:w-88">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search"
                className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1"
              aria-label="Profile"
            >
              <UserCircle2 className="size-7 text-primary" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`flex min-h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ${
            isSidebarOpen ? "w-72" : "w-16"
          }`}
        >
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            <div className="space-y-1">
              {primaryNav.map((item) => (
                <Link
                  key={item.title}
                  href="#"
                  className={`flex rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    isSidebarOpen ? "items-center gap-3" : "items-center justify-center"
                  }`}
                >
                  <item.icon className="size-4 shrink-0 text-muted-foreground" />
                  {isSidebarOpen ? <span>{item.title}</span> : null}
                </Link>
              ))}
            </div>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 md:px-8 md:py-7">{children}</main>
      </div>
    </div>
  )
}