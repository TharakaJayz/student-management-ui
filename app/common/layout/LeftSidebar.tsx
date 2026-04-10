import Link from "next/link"
import type { LucideIcon } from "lucide-react"

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

type LeftSidebarProps = {
  isSidebarOpen: boolean
  navItems: NavItem[]
  onToggleSidebar: () => void
}

const LeftSidebar = ({
  isSidebarOpen,
  navItems,
  onToggleSidebar,
}: LeftSidebarProps) => {
  return (
    <aside
      className={`flex min-h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ${
        isSidebarOpen ? "w-72" : "w-16"
      }`}
    >
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={onToggleSidebar}
              className={`flex rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                isSidebarOpen ? "items-center gap-3" : "items-center justify-center"
              }`}
            >
              <item.icon className="size-4 shrink-0 text-muted-foreground" />
              {isSidebarOpen ? item.title : null}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}

export default LeftSidebar
