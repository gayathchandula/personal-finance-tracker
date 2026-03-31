import type { Category, FinanceGoals, Transaction } from "@/types/finance";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-food", name: "Food" },
  { id: "cat-transport", name: "Transport" },
  { id: "cat-bills", name: "Bills" },
  { id: "cat-entertainment", name: "Entertainment" },
];

export const DEFAULT_GOALS: FinanceGoals = {
  monthlyIncome: 5000,
  monthlyBudget: 3200,
  savingsTarget: 1200,
};

const today = new Date();
const month = String(today.getMonth() + 1).padStart(2, "0");
const year = today.getFullYear();

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-income-1",
    title: "Main Salary",
    amount: 5000,
    kind: "income",
    categoryId: "cat-bills",
    date: `${year}-${month}-01`,
    note: "Monthly salary",
  },
  {
    id: "txn-exp-1",
    title: "Grocery run",
    amount: 180,
    kind: "expense",
    categoryId: "cat-food",
    date: `${year}-${month}-04`,
  },
  {
    id: "txn-exp-2",
    title: "Metro card",
    amount: 75,
    kind: "expense",
    categoryId: "cat-transport",
    date: `${year}-${month}-06`,
  },
  {
    id: "txn-exp-3",
    title: "Streaming plan",
    amount: 20,
    kind: "expense",
    categoryId: "cat-entertainment",
    date: `${year}-${month}-08`,
  },
];
