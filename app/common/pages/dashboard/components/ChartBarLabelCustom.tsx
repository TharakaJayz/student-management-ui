"use client"

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

const chartData = [
  { grade: "grade-5", income: 12500 },
  { grade: "grade-6", income: 14200 },
  { grade: "grade-7", income: 11800 },
  { grade: "grade-8", income: 15600 },
  { grade: "grade-9", income: 13100 },
  { grade: "grade-10", income: 14900 },
  { grade: "grade-11", income: 13800 },
]

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig

export function ChartBarLabelCustom() {
  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle>Monthly Income Summary by Grade</CardTitle>
        <CardDescription>Grades 5–11</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72">
          <BarChart
            accessibilityLayer
            data={chartData}
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
      <CardFooter className="flex-col items-start gap-2 text-sm hidden">
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
