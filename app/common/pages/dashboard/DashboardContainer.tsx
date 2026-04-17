import type { ChartConfig } from "@/components/ui/chart"

import React from "react"

import DashboardView, { type DashboardViewProps } from "./DashboardView"

const gradeIncomeChartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig

const dashboardProps = {
  headerWeekday: "Monday",
  attendance: {
    present: 420,
    absent: 60,
    absentPercent: "60%",
  },
  summary: {
    totalStudents: 12500,
    totalClasses: 52,
    totalTeachers: 31,
  },
  gradeIncomeChart: {
    data: [
      { grade: "grade-5", income: 12500 },
      { grade: "grade-6", income: 14200 },
      { grade: "grade-7", income: 11800 },
      { grade: "grade-8", income: 15600 },
      { grade: "grade-9", income: 13100 },
      { grade: "grade-10", income: 14900 },
      { grade: "grade-11", income: 13800 },
    ],
    config: gradeIncomeChartConfig,
  },
} satisfies DashboardViewProps

const DashboardContainer = () => {
  return (
    <div>
      <DashboardView {...dashboardProps} />
    </div>
  )
}

export default DashboardContainer
