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
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <header className="mb-6 flex flex-col gap-3 rounded-2xl bg-slate-900 p-4 text-white md:flex-row md:items-center md:justify-between md:p-6">
        <div>
          <p className="text-sm text-slate-300">Welcome back</p>
          <h1 className="text-2xl font-semibold capitalize">{user?.username}</h1>
          <p className="text-xs text-slate-300">Mock persistence with localStorage.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={resetDemoData}
            className="rounded-lg bg-white/15 px-3 py-2 text-sm hover:bg-white/25"
          >
            Reset demo data
          </button>
          <button
            onClick={logout}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard title="Monthly Income" value={formatCurrency(totalIncome)} />
        <KpiCard title="Monthly Expenses" value={formatCurrency(totalExpenses)} />
        <KpiCard title="Remaining Balance" value={formatCurrency(remainingBalance)} />
        <KpiCard title="Budget Used" value={`${budgetUsedPct.toFixed(1)}%`} />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Category Distribution">
          <CategoryPieChart categories={categories} transactions={transactions} />
        </Card>
        <Card title="Monthly Spending Trend">
          <MonthlyTrendChart transactions={transactions} />
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title="Budget & Savings Setup">
          <form className="space-y-3" onSubmit={submitGoals}>
            <NumberInput
              label="Monthly income"
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
            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Save goals
            </button>
          </form>
        </Card>

        <Card title="Categories">
          <form className="flex gap-2" onSubmit={submitCategory}>
            <input
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Add category"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Add
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span
                key={category.id}
                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm"
              >
                {category.name}
                {categories.length > 1 ? (
                  <button
                    onClick={() => removeCategory(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    x
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card title={txForm.id ? "Update Transaction" : "Add Transaction"} className="lg:col-span-1">
          <form className="space-y-3" onSubmit={submitTransaction}>
            <label className="block text-sm font-medium text-slate-700">
              Title
              <input
                value={txForm.title}
                onChange={(e) => setTxForm((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Amount
              <input
                type="number"
                min="0"
                step="0.01"
                value={txForm.amount}
                onChange={(e) => setTxForm((prev) => ({ ...prev, amount: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Type
              <select
                value={txForm.kind}
                onChange={(e) =>
                  setTxForm((prev) => ({ ...prev, kind: e.target.value as TransactionKind }))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Category
              <select
                value={txForm.categoryId}
                onChange={(e) => setTxForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Date
              <input
                type="date"
                value={txForm.date}
                onChange={(e) => setTxForm((prev) => ({ ...prev, date: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Note
              <textarea
                value={txForm.note}
                onChange={(e) => setTxForm((prev) => ({ ...prev, note: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                rows={3}
              />
            </label>
            <div className="flex gap-2">
              <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
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
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card title="Transactions" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Title</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100">
                    <td className="py-2">{row.date}</td>
                    <td className="py-2">{row.title}</td>
                    <td className="py-2 capitalize">{row.kind}</td>
                    <td className="py-2">{row.categoryName}</td>
                    <td className={`py-2 ${row.kind === "expense" ? "text-red-600" : "text-green-700"}`}>
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button onClick={() => editTransaction(row.id)} className="text-blue-600">
                          Edit
                        </button>
                        <button onClick={() => removeTransaction(row.id)} className="text-red-600">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </article>
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
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        type="number"
        min="0"
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
      />
    </label>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className ?? ""}`}>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
