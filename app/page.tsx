import Link from "next/link"
import { Building2, ClipboardList, Users } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Institute Suite
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/auth">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            For institute owners
          </p>
          <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Register your institute and run day-to-day operations in one place
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
            This system helps institute owners onboard their organization, keep
            records organized, and manage the work that keeps the business
            running—from people and programs to the details that matter every
            day.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/auth">Continue with sign in</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/auth">Create or access your account</Link>
            </Button>
          </div>
        </div>

        <ul className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-3">
          <li className="rounded-lg border border-border bg-card p-5 text-left shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
              <Building2 className="h-4 w-4" aria-hidden />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-card-foreground">
              Institute registration
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Set up your institute profile so your team works from a single,
              trusted source of truth.
            </p>
          </li>
          <li className="rounded-lg border border-border bg-card p-5 text-left shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
              <Users className="h-4 w-4" aria-hidden />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-card-foreground">
              People &amp; operations
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Coordinate the moving parts of your institute without losing
              context between tools and spreadsheets.
            </p>
          </li>
          <li className="rounded-lg border border-border bg-card p-5 text-left shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-primary">
              <ClipboardList className="h-4 w-4" aria-hidden />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-card-foreground">
              Day-to-day management
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Stay on top of routine work so owners and staff can focus on
              students and outcomes.
            </p>
          </li>
        </ul>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>Institute Suite — tools for owners who run educational organizations.</p>
      </footer>
    </div>
  )
}
