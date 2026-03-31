"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CATEGORIES, DEFAULT_GOALS, DEFAULT_TRANSACTIONS } from "@/lib/demo-data";
import type { Category, FinanceGoals, Transaction, UserProfile } from "@/types/finance";

const DEMO_USERNAME = "demo";
const DEMO_PASSWORD = "demo123";

interface FinanceState {
  hydrated: boolean;
  user: UserProfile | null;
  categories: Category[];
  transactions: Transaction[];
  goals: FinanceGoals;
  loginError: string | null;
  setHydrated: (hydrated: boolean) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addCategory: (name: string) => void;
  removeCategory: (id: string) => void;
  updateGoals: (goals: FinanceGoals) => void;
  addTransaction: (data: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, data: Omit<Transaction, "id">) => void;
  removeTransaction: (id: string) => void;
  resetDemoData: () => void;
}

function makeId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      user: null,
      categories: DEFAULT_CATEGORIES,
      transactions: DEFAULT_TRANSACTIONS,
      goals: DEFAULT_GOALS,
      loginError: null,
      setHydrated: (hydrated) => set({ hydrated }),
      login: (username, password) => {
        if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
          set({ user: { username }, loginError: null });
          return true;
        }

        set({ loginError: "Invalid credentials. Try demo / demo123." });
        return false;
      },
      logout: () => set({ user: null, loginError: null }),
      addCategory: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const exists = get().categories.some(
          (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (exists) return;

        set((state) => ({
          categories: [...state.categories, { id: makeId("cat"), name: trimmed }],
        }));
      },
      removeCategory: (id) => {
        const fallbackCategory = get().categories.find((category) => category.id !== id);
        if (!fallbackCategory) return;

        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          transactions: state.transactions.map((transaction) =>
            transaction.categoryId === id
              ? { ...transaction, categoryId: fallbackCategory.id }
              : transaction,
          ),
        }));
      },
      updateGoals: (goals) => set({ goals }),
      addTransaction: (data) => {
        set((state) => ({
          transactions: [{ ...data, id: makeId("txn") }, ...state.transactions],
        }));
      },
      updateTransaction: (id, data) => {
        set((state) => ({
          transactions: state.transactions.map((transaction) =>
            transaction.id === id ? { ...data, id } : transaction,
          ),
        }));
      },
      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((transaction) => transaction.id !== id),
        }));
      },
      resetDemoData: () =>
        set({
          categories: DEFAULT_CATEGORIES,
          transactions: DEFAULT_TRANSACTIONS,
          goals: DEFAULT_GOALS,
        }),
    }),
    {
      name: "finance-demo-store",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        user: state.user,
        categories: state.categories,
        transactions: state.transactions,
        goals: state.goals,
      }),
    },
  ),
);

export const demoCredentials = {
  username: DEMO_USERNAME,
  password: DEMO_PASSWORD,
};
