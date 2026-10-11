"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerAdmin } from "../actions";

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAdmin, undefined);

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-5 py-10">
      <form action={formAction} className="w-full max-w-sm space-y-5">
        <div className="space-y-2">
          <h1 className="font-display text-xl italic text-ink">
            Create admin account
          </h1>
          <p className="text-sm leading-6 text-graphite">
            This one-time setup creates the first administrator for this site.
          </p>
        </div>

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
            maxLength={254}
            suppressHydrationWarning
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
            minLength={12}
            maxLength={128}
            autoComplete="new-password"
            suppressHydrationWarning
            className="w-full rounded border border-line bg-white px-3 py-3 text-ink"
          />
          <p className="text-xs text-graphite">Use at least 12 characters.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="setupToken" className="block text-sm text-graphite">
            Private setup token
          </label>
          <input
            id="setupToken"
            name="setupToken"
            type="password"
            required
            autoComplete="off"
            suppressHydrationWarning
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
          suppressHydrationWarning
          className="w-full rounded bg-accent px-4 py-3 text-sm text-paper disabled:opacity-60"
        >
          {pending ? "Creating account…" : "Create admin account"}
        </button>

        <p className="text-center text-sm text-graphite">
          Already have an account?{" "}
          <Link href="/admin/login" className="text-accent underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
