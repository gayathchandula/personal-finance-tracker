"use client";

import { FormEvent, useState } from "react";
import { demoCredentials, useFinanceStore } from "@/store/finance-store";

export function LoginCard() {
  const login = useFinanceStore((s) => s.login);
  const error = useFinanceStore((s) => s.loginError);
  const [username, setUsername] = useState(demoCredentials.username);
  const [password, setPassword] = useState(demoCredentials.password);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login(username, password);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="mb-10 flex items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-container text-on-primary">
          <span className="material-symbols-outlined filled text-[28px]">account_balance_wallet</span>
        </div>
        <div className="text-left font-headline">
          <p className="text-lg font-extrabold text-primary">Prosper Ledger</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            The Financial Atelier
          </p>
        </div>
      </div>

      <div className="w-full max-w-md rounded-2xl bg-surface-container-lowest p-8 shadow-sm ring-1 ring-outline-variant/10">
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">Welcome back</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Demo login for review only. Credentials are prefilled.
        </p>
        <form className="mt-8 space-y-5" onSubmit={onSubmit}>
          <label className="block text-sm font-semibold text-on-surface">
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface-container-low px-4 py-3.5 text-sm outline-none transition-colors focus:border-primary/35"
            />
          </label>
          <label className="block text-sm font-semibold text-on-surface">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-xl border border-outline-variant/15 bg-surface-container-low px-4 py-3.5 text-sm outline-none transition-colors focus:border-primary/35"
            />
          </label>
          {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-full bg-gradient-to-br from-primary to-primary-container py-3.5 text-sm font-bold text-on-primary shadow-md transition-opacity hover:opacity-95"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 rounded-xl bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">
          Demo username: <span className="font-semibold text-on-surface">{demoCredentials.username}</span>{" "}
          · password:{" "}
          <span className="font-semibold text-on-surface">{demoCredentials.password}</span>
        </p>
      </div>
    </div>
  );
}
