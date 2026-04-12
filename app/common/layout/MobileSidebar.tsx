"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function isNavActive(pathname: string, href: string) {
  if (pathname === href) return true
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true
  return false
}

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

type MobileSidebarProps = {
  isOpen: boolean
  navItems: NavItem[]
  onClose: () => void
}

const MobileSidebar = ({ isOpen, navItems, onClose }: MobileSidebarProps) => {
  const pathname = usePathname()

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-transparent transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-72 border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="h-full overflow-y-auto px-3 py-5">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isNavActive(pathname, item.href)
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    active && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-sidebar-accent-foreground" : "text-muted-foreground"
                    )}
                  />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </nav>
      </aside>
    </>
  )
}

export default MobileSidebar
