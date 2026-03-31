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

const COLORS = ["#396093", "#2c694e", "#d66853", "#1e4879", "#6186bc", "#316e52"];

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
    <div className="h-52 w-full sm:h-56 lg:h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={80} label>
            {byCategory.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
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
    <div className="h-52 w-full sm:h-56 lg:h-64">
      <ResponsiveContainer>
        <LineChart data={points}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
          <Line type="monotone" dataKey="expense" stroke="#2c694e" strokeWidth={3} dot={{ fill: "#2c694e" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
