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
    <div className="mx-auto mt-16 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Personal Finance Tracker</h1>
      <p className="mt-2 text-sm text-slate-600">
        Demo login for review purpose only. Credentials are prefilled.
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <label className="block text-sm font-medium text-slate-700">
          Username
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Demo username: <b>{demoCredentials.username}</b> | password:{" "}
        <b>{demoCredentials.password}</b>
      </p>
    </div>
  );
}
