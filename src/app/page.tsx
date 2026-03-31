"use client";

import { Dashboard } from "@/components/dashboard";
import { LoginCard } from "@/components/login-card";
import { useFinanceStore } from "@/store/finance-store";

export default function Home() {
  const user = useFinanceStore((s) => s.user);
  const hydrated = useFinanceStore((s) => s.hydrated);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center text-sm text-on-surface-variant">
        Loading finance dashboard…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background">
      <main className="min-h-screen">{user ? <Dashboard /> : <LoginCard />}</main>
    </div>
  );
}
