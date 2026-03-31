"use client";

import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, getMonthKey } from "@/lib/date";
import type { Category, Transaction } from "@/types/finance";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#db2777", "#7c3aed", "#0f766e"];

export function CategoryPieChart({
  categories,
  transactions,
}: {
  categories: Category[];
  transactions: Transaction[];
}) {
  const byCategory = categories
    .map((category) => {
      const total = transactions
        .filter((t) => t.kind === "expense" && t.categoryId === category.id)
        .reduce((sum, t) => sum + t.amount, 0);
      return { name: category.name, value: total };
    })
    .filter((entry) => entry.value > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} label>
            {byCategory.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyTrendChart({ transactions }: { transactions: Transaction[] }) {
  const monthMap = new Map<string, number>();
  for (const transaction of transactions) {
    if (transaction.kind !== "expense") continue;
    const key = getMonthKey(transaction.date);
    monthMap.set(key, (monthMap.get(key) ?? 0) + transaction.amount);
  }

  const points = Array.from(monthMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, expense]) => ({ month, expense }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={points}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value: number) => formatCurrency(Number(value))} />
          <Line type="monotone" dataKey="expense" stroke="#2563eb" strokeWidth={3} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
