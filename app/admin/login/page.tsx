"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

// Deliberately outside the (protected) layout — this is the one admin page
// that must be reachable while signed out. Mobile-friendly per
// PROJECT_CONTEXT.md §12 (large touch targets, single-column form).
export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5">
      <form action={formAction} className="w-full max-w-sm space-y-5">
        <h1 className="font-display text-xl italic text-ink">Sign in</h1>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm text-graphite">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded border border-line bg-white px-3 py-3 text-ink"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="block text-sm text-graphite">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded border border-line bg-white px-3 py-3 text-ink"
          />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-accent px-4 py-3 text-sm text-paper disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
