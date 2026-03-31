"use client";

import { FormEvent, useMemo, useState } from "react";
import { CategoryPieChart, MonthlyTrendChart } from "@/components/charts";
import { formatCurrency, getMonthKey } from "@/lib/date";
import { useFinanceStore } from "@/store/finance-store";
import type { FinanceGoals, TransactionKind } from "@/types/finance";

interface TransactionFormState {
  id?: string;
  title: string;
  amount: string;
  kind: TransactionKind;
  categoryId: string;
  date: string;
  note: string;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function txIcon(kind: TransactionKind) {
  return kind === "income" ? "payments" : "shopping_bag";
}

export function Dashboard() {
  const user = useFinanceStore((s) => s.user);
  const logout = useFinanceStore((s) => s.logout);
  const categories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const goals = useFinanceStore((s) => s.goals);
  const addCategory = useFinanceStore((s) => s.addCategory);
  const removeCategory = useFinanceStore((s) => s.removeCategory);
  const updateGoals = useFinanceStore((s) => s.updateGoals);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);
  const removeTransaction = useFinanceStore((s) => s.removeTransaction);
  const resetDemoData = useFinanceStore((s) => s.resetDemoData);

  const [categoryName, setCategoryName] = useState("");
  const [goalDraft, setGoalDraft] = useState<FinanceGoals>(goals);
  const [txForm, setTxForm] = useState<TransactionFormState>({
    title: "",
    amount: "",
    kind: "expense",
    categoryId: categories[0]?.id ?? "",
    date: todayIsoDate(),
    note: "",
  });

  const currentMonthKey = getMonthKey(todayIsoDate());
  const monthTransactions = transactions.filter((t) => getMonthKey(t.date) === currentMonthKey);
  const totalIncome = monthTransactions
    .filter((t) => t.kind === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = monthTransactions
    .filter((t) => t.kind === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const remainingBalance = totalIncome - totalExpenses;
  const budgetUsedPct = goals.monthlyBudget > 0 ? (totalExpenses / goals.monthlyBudget) * 100 : 0;
  const discretionaryLeft = Math.max(0, goals.monthlyBudget - totalExpenses);

  const topExpenseCategories = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of monthTransactions) {
      if (t.kind !== "expense") continue;
      map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amount);
    }
    return Array.from(map.entries())
      .map(([categoryId, amount]) => ({
        categoryId,
        amount,
        name: categories.find((c) => c.id === categoryId)?.name ?? "—",
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 2);
  }, [monthTransactions, categories]);

  const rows = useMemo(
    () =>
      transactions
        .slice()
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .map((t) => ({
          ...t,
          categoryName: categories.find((c) => c.id === t.categoryId)?.name ?? "Uncategorized",
        })),
    [transactions, categories],
  );

  const recentRows = rows.slice(0, 5);

  function submitCategory(event: FormEvent) {
    event.preventDefault();
    addCategory(categoryName);
    setCategoryName("");
  }

  function submitGoals(event: FormEvent) {
    event.preventDefault();
    updateGoals(goalDraft);
  }

  function submitTransaction(event: FormEvent) {
    event.preventDefault();
    const amount = Number(txForm.amount);
    if (!txForm.title.trim() || !amount || !txForm.categoryId || !txForm.date) return;

    const payload = {
      title: txForm.title.trim(),
      amount,
      kind: txForm.kind,
      categoryId: txForm.categoryId,
      date: txForm.date,
      note: txForm.note.trim(),
    };

    if (txForm.id) {
      updateTransaction(txForm.id, payload);
    } else {
      addTransaction(payload);
    }

    setTxForm({
      title: "",
      amount: "",
      kind: "expense",
      categoryId: categories[0]?.id ?? "",
      date: todayIsoDate(),
      note: "",
    });
  }

  function editTransaction(id: string) {
    const found = transactions.find((t) => t.id === id);
    if (!found) return;
    setTxForm({
      id: found.id,
      title: found.title,
      amount: String(found.amount),
      kind: found.kind,
      categoryId: found.categoryId,
      date: found.date,
      note: found.note ?? "",
    });
    document.getElementById("add-transaction")?.scrollIntoView({ behavior: "smooth" });
  }

  const initial = (user?.username ?? "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <aside className="font-headline fixed left-0 top-0 z-50 flex h-screen w-64 flex-col gap-y-6 border-r-0 bg-slate-50/90 px-6 py-8 tracking-tight backdrop-blur-xl dark:bg-slate-950/90">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary">
            <span className="material-symbols-outlined filled text-[22px]">account_balance_wallet</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-primary-container dark:text-white">
              Prosper Ledger
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              The Financial Atelier
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-2">
          <a
            className="flex items-center gap-4 rounded-lg border-r-4 border-primary bg-surface-container-low/80 px-4 py-3 font-bold text-primary transition-all duration-200"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="material-symbols-outlined">home</span>
            <span>Home</span>
          </a>
          <a
            className="flex items-center gap-4 rounded-lg px-4 py-3 font-medium text-slate-500 transition-colors hover:bg-surface-container-low hover:text-primary"
            href="#transactions"
          >
            <span className="material-symbols-outlined">history</span>
            <span>History</span>
          </a>
          <a
            className="flex items-center gap-4 rounded-lg px-4 py-3 font-medium text-slate-500 transition-colors hover:bg-surface-container-low hover:text-primary"
            href="#add-transaction"
          >
            <span className="material-symbols-outlined">add_circle</span>
            <span>Add</span>
          </a>
          <a
            className="flex items-center gap-4 rounded-lg px-4 py-3 font-medium text-slate-500 transition-colors hover:bg-surface-container-low hover:text-primary"
            href="#charts"
          >
            <span className="material-symbols-outlined">insights</span>
            <span>Insights</span>
          </a>
          <a
            className="flex items-center gap-4 rounded-lg px-4 py-3 font-medium text-slate-500 transition-colors hover:bg-surface-container-low hover:text-primary"
            href="#manage"
          >
            <span className="material-symbols-outlined">tune</span>
            <span>Setup</span>
          </a>
        </nav>
        <div className="mt-auto space-y-4">
          <div className="rounded-xl bg-primary-fixed/40 p-4 dark:bg-primary-container/20">
            <p className="mb-1 text-xs font-bold text-on-primary-fixed">Local demo</p>
            <p className="text-[11px] leading-relaxed text-on-surface-variant">
              Data stays in your browser. Reset anytime to try fresh sample numbers.
            </p>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary">
              {initial}
            </div>
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="truncate text-sm font-bold capitalize">{user?.username}</p>
              <p className="truncate text-xs text-slate-500">Signed in locally</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={resetDemoData}
              className="flex-1 rounded-full bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container-highest"
            >
              Reset data
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex-1 rounded-full bg-gradient-to-br from-primary to-primary-container px-3 py-2 text-xs font-semibold text-on-primary shadow-sm hover:opacity-95"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-64 flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-transparent bg-slate-50/80 px-8 py-3 text-sm font-medium backdrop-blur-xl dark:bg-slate-950/80 font-headline">
          <div className="flex w-1/3 items-center gap-4">
            <div className="relative w-full max-w-xs">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                search
              </span>
              <input
                readOnly
                className="w-full rounded-full border-0 bg-surface-container py-2 pl-10 pr-4 text-xs text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary/20"
                placeholder="Search transactions…"
                aria-label="Search (display only)"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-full p-2 text-slate-500 transition-colors hover:bg-surface-container-low"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>
          </div>
        </header>

        <div className="mx-auto w-full max-w-7xl space-y-12 p-8 lg:p-12">
          <section className="grid grid-cols-1 items-end gap-8 lg:grid-cols-3">
            <div className="space-y-2 lg:col-span-2">
              <h2 className="text-sm font-medium uppercase tracking-wide text-on-surface-variant">
                Month balance
              </h2>
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="font-headline text-[clamp(2.5rem,6vw,3.5rem)] font-extrabold leading-none text-primary">
                  {formatCurrency(remainingBalance)}
                </span>
                <span className="flex items-center gap-1 rounded-lg bg-secondary-container px-2 py-1 text-sm font-bold text-on-secondary-container">
                  <span className="material-symbols-outlined text-base">trending_up</span>
                  {formatCurrency(totalIncome)} in · {formatCurrency(totalExpenses)} out
                </span>
              </div>
            </div>
            <div className="space-y-4 rounded-xl bg-surface-container-low p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-on-surface-variant">Budget usage</span>
                <span className="text-sm font-bold">{budgetUsedPct.toFixed(0)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full rounded-full bg-primary-container"
                  style={{ width: `${Math.min(100, budgetUsedPct)}%` }}
                />
              </div>
              <p className="text-xs text-on-surface-variant">
                You have{" "}
                <span className="font-bold text-on-surface">{formatCurrency(discretionaryLeft)}</span>{" "}
                left against your allocated budget this month.
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-8 lg:col-span-8">
              <section id="charts" className="scroll-mt-24 space-y-8">
                <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm md:p-8">
                  <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="font-headline text-xl font-bold">Insights</h3>
                      <p className="text-sm text-on-surface-variant">Categories and spending trend</p>
                    </div>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        By category
                      </p>
                      <CategoryPieChart categories={categories} transactions={transactions} />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Monthly expenses
                      </p>
                      <MonthlyTrendChart transactions={transactions} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
                <div className="flex items-center justify-between bg-surface-container-low/50 px-6 py-5 md:px-8">
                  <h3 className="font-headline text-lg font-bold">Recent transactions</h3>
                  <a
                    className="flex items-center gap-1 text-sm font-bold text-primary-container dark:text-primary-fixed"
                    href="#transactions"
                  >
                    Full history
                    <span className="material-symbols-outlined text-base">arrow_outward</span>
                  </a>
                </div>
                <div>
                  {recentRows.length === 0 ? (
                    <p className="px-8 py-10 text-sm text-on-surface-variant">No transactions yet.</p>
                  ) : (
                    recentRows.map((row, i) => (
                      <div
                        key={row.id}
                        className={`flex cursor-default items-center justify-between px-6 py-5 transition-colors hover:bg-surface-bright md:px-8 ${i % 2 === 1 ? "bg-surface-container-low/20" : ""}`}
                      >
                        <div className="flex items-center gap-5">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
                            <span className="material-symbols-outlined">{txIcon(row.kind)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold">{row.title}</p>
                            <p className="text-xs text-on-surface-variant">
                              {row.categoryName} · {row.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${row.kind === "expense" ? "text-error" : "text-secondary"}`}
                          >
                            {row.kind === "expense" ? "-" : "+"}
                            {formatCurrency(row.amount)}
                          </p>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                            {row.kind}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-8 lg:col-span-4">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 text-on-primary shadow-xl">
                <div className="absolute right-0 top-0 p-6 opacity-20">
                  <span className="material-symbols-outlined text-6xl">account_balance</span>
                </div>
                <div className="relative z-10">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary-fixed/90">
                    Monthly expenses
                  </p>
                  <p className="mb-6 font-headline text-4xl font-extrabold">{formatCurrency(totalExpenses)}</p>
                  <div className="space-y-4 text-sm">
                    {topExpenseCategories.length === 0 ? (
                      <p className="text-primary-fixed/80">No expenses this month yet.</p>
                    ) : (
                      topExpenseCategories.map((c) => (
                        <div key={c.categoryId}>
                          <div className="flex items-center justify-between">
                            <span className="text-primary-fixed/85">{c.name}</span>
                            <span className="font-bold">{formatCurrency(c.amount)}</span>
                          </div>
                          <div className="mt-2 h-1 w-full rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-white/50"
                              style={{
                                width: `${totalExpenses > 0 ? Math.round((c.amount / totalExpenses) * 100) : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <a
                    href="#charts"
                    className="mt-8 flex w-full items-center justify-center rounded-full bg-on-primary py-4 text-sm font-bold text-primary transition-colors hover:bg-primary-fixed"
                  >
                    Analyze breakdown
                  </a>
                </div>
              </div>

              <div className="relative rounded-xl border border-secondary/10 bg-secondary-container p-8">
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-on-secondary">
                  <span className="material-symbols-outlined filled">lightbulb</span>
                </div>
                <h4 className="mb-3 font-headline text-lg font-bold text-on-secondary-container">
                  Smart saving tip
                </h4>
                <p className="mb-6 text-sm leading-relaxed text-on-secondary-container">
                  Try aligning discretionary spend with what&apos;s left after your budget. Small weekly
                  reviews beat one big reckoning at month end.
                </p>
                <a
                  className="flex items-center gap-2 text-sm font-bold text-secondary"
                  href="#manage"
                >
                  Adjust goals
                  <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </a>
              </div>

              <div className="rounded-xl bg-surface-container-low p-8" id="add-transaction">
                <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  Quick add
                </h4>
                <p className="mb-6 text-sm text-on-surface-variant">
                  Jump to the full form below to log income or expenses with categories and notes.
                </p>
                <a
                  href="#transaction-form"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-primary to-primary-container py-4 text-sm font-bold text-on-primary shadow-sm hover:opacity-95"
                >
                  Add transaction
                  <span className="material-symbols-outlined text-lg">add</span>
                </a>
              </div>
            </div>
          </div>

          <section id="manage" className="scroll-mt-24 space-y-8">
            <h2 className="font-headline text-xl font-bold">Manage</h2>
            <div className="grid gap-6 lg:grid-cols-2">
              <ManageCard title="Budget & savings">
                <form className="space-y-3" onSubmit={submitGoals}>
                  <NumberInput
                    label="Monthly income (target)"
                    value={goalDraft.monthlyIncome}
                    onChange={(value) =>
                      setGoalDraft((prev) => ({ ...prev, monthlyIncome: value }))
                    }
                  />
                  <NumberInput
                    label="Allocated monthly budget"
                    value={goalDraft.monthlyBudget}
                    onChange={(value) =>
                      setGoalDraft((prev) => ({ ...prev, monthlyBudget: value }))
                    }
                  />
                  <NumberInput
                    label="Savings target"
                    value={goalDraft.savingsTarget}
                    onChange={(value) =>
                      setGoalDraft((prev) => ({ ...prev, savingsTarget: value }))
                    }
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary hover:opacity-95"
                  >
                    Save goals
                  </button>
                </form>
              </ManageCard>

              <ManageCard title="Categories">
                <form className="flex flex-wrap gap-2" onSubmit={submitCategory}>
                  <input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Add category"
                    className="min-w-[12rem] flex-1 rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm outline-none transition-colors focus:border-primary/30"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary hover:opacity-95"
                  >
                    Add
                  </button>
                </form>
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-2 text-sm"
                    >
                      {category.name}
                      {categories.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeCategory(category.id)}
                          className="text-error hover:underline"
                        >
                          Remove
                        </button>
                      ) : null}
                    </span>
                  ))}
                </div>
              </ManageCard>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <ManageCard
                title={txForm.id ? "Update transaction" : "Add transaction"}
                className="scroll-mt-28 lg:col-span-1"
                id="transaction-form"
              >
                <form className="space-y-3" onSubmit={submitTransaction}>
                  <Field label="Title">
                    <input
                      value={txForm.title}
                      onChange={(e) => setTxForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary/30"
                    />
                  </Field>
                  <Field label="Amount">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={txForm.amount}
                      onChange={(e) => setTxForm((prev) => ({ ...prev, amount: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary/30"
                    />
                  </Field>
                  <Field label="Type">
                    <select
                      value={txForm.kind}
                      onChange={(e) =>
                        setTxForm((prev) => ({ ...prev, kind: e.target.value as TransactionKind }))
                      }
                      className="mt-1 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary/30"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </Field>
                  <Field label="Category">
                    <select
                      value={txForm.categoryId}
                      onChange={(e) =>
                        setTxForm((prev) => ({ ...prev, categoryId: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary/30"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Date">
                    <input
                      type="date"
                      value={txForm.date}
                      onChange={(e) => setTxForm((prev) => ({ ...prev, date: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary/30"
                    />
                  </Field>
                  <Field label="Note">
                    <textarea
                      value={txForm.note}
                      onChange={(e) => setTxForm((prev) => ({ ...prev, note: e.target.value }))}
                      className="mt-1 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary/30"
                      rows={3}
                    />
                  </Field>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="submit"
                      className="rounded-full bg-gradient-to-br from-primary to-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary hover:opacity-95"
                    >
                      {txForm.id ? "Update" : "Create"}
                    </button>
                    {txForm.id ? (
                      <button
                        type="button"
                        onClick={() =>
                          setTxForm({
                            title: "",
                            amount: "",
                            kind: "expense",
                            categoryId: categories[0]?.id ?? "",
                            date: todayIsoDate(),
                            note: "",
                          })
                        }
                        className="rounded-full border border-outline-variant/25 px-5 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container-low"
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </form>
              </ManageCard>

              <ManageCard title="All transactions" className="lg:col-span-2">
                <div id="transactions" className="scroll-mt-24 overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-on-surface-variant">
                      <tr className="border-b border-outline-variant/15">
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Title</th>
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Category</th>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id} className="border-b border-outline-variant/10">
                          <td className="py-3">{row.date}</td>
                          <td className="py-3">{row.title}</td>
                          <td className="py-3 capitalize">{row.kind}</td>
                          <td className="py-3">{row.categoryName}</td>
                          <td
                            className={`py-3 font-medium ${row.kind === "expense" ? "text-error" : "text-secondary"}`}
                          >
                            {formatCurrency(row.amount)}
                          </td>
                          <td className="py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => editTransaction(row.id)}
                                className="font-semibold text-primary-container hover:underline dark:text-primary-fixed"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => removeTransaction(row.id)}
                                className="font-semibold text-error hover:underline"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ManageCard>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-on-surface">
      {label}
      {children}
    </label>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-semibold text-on-surface">
      {label}
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-xl border border-outline-variant/15 bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary/30"
      />
    </label>
  );
}

function ManageCard({
  title,
  children,
  className,
  id,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`rounded-2xl bg-surface-container-lowest p-6 shadow-sm ring-1 ring-outline-variant/10 ${className ?? ""}`}
    >
      <h2 className="mb-4 font-headline text-lg font-bold text-on-surface">{title}</h2>
      {children}
    </section>
  );
}
