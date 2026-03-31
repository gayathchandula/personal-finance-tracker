"use client";

import { Dashboard } from "@/components/dashboard";
import { LoginCard } from "@/components/login-card";
import { useFinanceStore } from "@/store/finance-store";

export default function Home() {
  const user = useFinanceStore((s) => s.user);
  const hydrated = useFinanceStore((s) => s.hydrated);

  if (!hydrated) {
    return <div className="p-6 text-center text-sm text-slate-500">Loading finance dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main>{user ? <Dashboard /> : <LoginCard />}</main>
    </div>
  );
}
