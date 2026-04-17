"use client"

import { useMemo, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export type GradeIncomeRow = {
  grade: string
  income: number
}

export type ChartBarLabelCustomProps = {
  data: GradeIncomeRow[]
  config: ChartConfig
}

const MONTH_OPTIONS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function ChartBarLabelCustom({ data, config }: ChartBarLabelCustomProps) {
  const now = useMemo(() => new Date(), [])
  const [selectedMonth, setSelectedMonth] = useState(
    MONTH_OPTIONS[now.getMonth()]
  )
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()))
  const yearOptions = useMemo(() => {
    const currentYear = now.getFullYear()
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1]
  }, [now])

  return (
    <Card className="border border-border bg-card">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Monthly Income Summary by Grade</CardTitle>
          <CardDescription>
            {selectedMonth} {selectedYear} · Grades 5-11
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Select month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="h-8 rounded-md border border-border bg-card px-2 text-sm"
          >
            {MONTH_OPTIONS.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
          <select
            aria-label="Select year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
            className="h-8 rounded-md border border-border bg-card px-2 text-sm"
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-72">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              right: 16,
            }}
            barCategoryGap="12%"
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="grade"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                String(value).replace(/^grade-/, "G")
              }
              hide
            />
            <XAxis dataKey="income" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="income"
              fill="var(--color-income)"
              radius={6}
              maxBarSize={28}
            >
              <LabelList
                dataKey="grade"
                position="insideLeft"
                offset={8}
                className="fill-(--color-label)"
                fontSize={12}
                formatter={(value) =>
                  String(value ?? "").replace(/^grade-/, "G")
                }
              />
              <LabelList
                dataKey="income"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value) =>
                  Number(value ?? 0).toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })
                }
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="hidden flex-col items-start gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Income by grade (sample figures — adjust as needed)
        </div>
      </CardFooter>
    </Card>
  )
}
