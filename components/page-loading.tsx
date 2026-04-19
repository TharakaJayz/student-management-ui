import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

export type PageLoadingProps = {
  /** Primary line (e.g. "Loading your workspace") */
  title?: string
  /** Optional secondary line; omit for title-only */
  description?: string
  className?: string
  /** Min height of the block, e.g. min-h-[40vh] or min-h-[32vh] */
  minHeight?: string
}

export function PageLoading({
  title = "Loading…",
  description,
  className,
  minHeight = "min-h-[40vh]",
}: PageLoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-4 py-12",
        minHeight,
        className,
      )}
    >
      <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
