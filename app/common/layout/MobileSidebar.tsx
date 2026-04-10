import Link from "next/link"
import type { LucideIcon } from "lucide-react"

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
            {navItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <item.icon className="size-4 shrink-0 text-muted-foreground" />
                {item.title}
              </Link>
            ))}
          </div>
        </nav>
      </aside>
    </>
  )
}

export default MobileSidebar
