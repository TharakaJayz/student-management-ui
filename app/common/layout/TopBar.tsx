import { Bell, Menu, Search, UserCircle2 } from "lucide-react"

type TopBarProps = {
  onToggleSidebar: () => void
}

const TopBar = ({ onToggleSidebar }: TopBarProps) => {
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
  )
}

export default TopBar
