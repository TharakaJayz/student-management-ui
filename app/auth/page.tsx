import { Suspense } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { GoogleSignIn } from "./google-sign-in"

function SignInFallback() {
  return (
    <div
      className="h-32 w-full max-w-md animate-pulse rounded-lg bg-muted"
      aria-hidden
    />
  )
}

export default function AuthPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground hover:text-primary"
          >
            Institute Suite
          </Link>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
        <Suspense fallback={<SignInFallback />}>
          <GoogleSignIn />
        </Suspense>
      </main>
    </div>
  )
}
