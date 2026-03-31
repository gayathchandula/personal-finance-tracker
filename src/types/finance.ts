export type TransactionKind = "income" | "expense";

export interface Category {
  id: string;
  name: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  kind: TransactionKind;
  categoryId: string;
  date: string;
  note?: string;
}

export interface FinanceGoals {
  monthlyIncome: number;
  monthlyBudget: number;
  savingsTarget: number;
}

export interface UserProfile {
  username: string;
}
