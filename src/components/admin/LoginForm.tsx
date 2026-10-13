"use client";

import { useActionState } from "react";

import { login } from "@/lib/admin/actions/auth";
import { initialState } from "@/lib/admin/form";

const input =
  "w-full rounded-xl border border-line bg-steel px-4 py-3 text-bone placeholder:text-mist/60 focus:border-bone focus:outline-none";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-bone"
        >
          {state.message}
        </p>
      )}
      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em] text-mist">
          Email
        </span>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className={input}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-[11px] uppercase tracking-[0.28em] text-mist">
          Password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={input}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-6 py-3 text-[12px] font-medium uppercase tracking-[0.2em] text-bone transition-colors hover:bg-accent-deep disabled:opacity-60"
      >
        {pending ? "Signing in" : "Sign in"}
      </button>
    </form>
  );
}
