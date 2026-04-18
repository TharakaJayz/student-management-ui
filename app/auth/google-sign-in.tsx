"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

const errorMessages: Record<string, string> = {
  auth: "Sign-in did not complete. Please try again.",
}

function GoogleMark() {
  return (
    <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function GoogleSignIn() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("error")
  const [loading, setLoading] = React.useState(false)

  const errorMessage = errorCode
    ? (errorMessages[errorCode] ?? decodeURIComponent(errorCode))
    : null

  async function handleGoogle() {
    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      })
      if (error) throw error
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Sign in
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Use your Google account to access Institute Suite and manage your
          institute.
        </p>
      </div>

      {errorMessage ? (
        <p
          className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full gap-2 border-border bg-background text-foreground hover:bg-muted"
        disabled={loading}
        onClick={() => void handleGoogle()}
      >
        <GoogleMark />
        {loading ? "Redirecting…" : "Continue with Google"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/" className="text-primary underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  )
}
