import React from 'react'
import { ChartBarLabelCustom } from './components/ChartBarLabelCustom'

const DashboardView = () => {
  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-card-foreground">
              Dashboard Overview
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time tracking for attendance, classes, and income.
            </p>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Monday</p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-100/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">Present</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
              420
            </p>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-100/70 p-4 dark:border-rose-900 dark:bg-rose-950/40">
            <p className="text-sm text-rose-700 dark:text-rose-300">Absent</p>
            <p className="mt-1 text-2xl font-semibold text-rose-900 dark:text-rose-100">
              60
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-100/70 p-4 dark:border-amber-900 dark:bg-amber-950/40">
            <p className="text-sm text-amber-700 dark:text-amber-300">Absent %</p>
            <p className="mt-1 text-2xl font-semibold text-amber-900 dark:text-amber-100">
              60%
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <p className="mt-2 text-3xl font-semibold">12500</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground">Total Classes</p>
          <p className="mt-2 text-3xl font-semibold">52</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2 xl:col-span-1">
          <p className="text-sm text-muted-foreground">Total Teachers</p>
          <p className="mt-2 text-3xl font-semibold">31</p>
        </div>
      </section>

      <ChartBarLabelCustom />
    </div>
  )
}

export default DashboardView
