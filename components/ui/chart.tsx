"use client"

import * as React from "react"
import { Tooltip, ResponsiveContainer } from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode
    color?: string
  }
>

const ChartContext = React.createContext<ChartConfig | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

function ChartContainer({
  config,
  className,
  children,
}: React.ComponentProps<"div"> & {
  config: ChartConfig
  children: React.ReactNode
}) {
  const style = Object.entries(config).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (value.color) {
        acc[`--color-${key}`] = value.color
      }
      return acc
    },
    {}
  )

  return (
    <ChartContext.Provider value={config}>
      <div className={cn("h-80 w-full", className)} style={style}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartTooltip = Tooltip

type ChartTooltipPayloadItem = {
  dataKey?: string | number
  color?: string
  value?: string | number
}

type ChartTooltipContentProps = {
  active?: boolean
  payload?: ChartTooltipPayloadItem[]
  label?: string | number
  className?: string
  indicator?: "line" | "dot"
}

function ChartTooltipContent({
  active,
  payload,
  label,
  className,
  indicator = "dot",
}: ChartTooltipContentProps) {
  const config = useChart()

  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm",
        className
      )}
    >
      {label ? <p className="mb-2 font-medium">{String(label)}</p> : null}
      <div className="space-y-1">
        {payload.map((item) => {
          const key = String(item.dataKey)
          const token = config[key]

          return (
            <div key={key} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {indicator === "dot" ? (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                ) : (
                  <span
                    className="h-0.5 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                )}
                <span>{token?.label ?? key}</span>
              </div>
              <span className="font-medium">{item.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }
