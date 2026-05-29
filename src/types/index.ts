import type { AccentName } from '@/theme';

export type CategoryId = string;

export interface BudgetCategory {
  id: CategoryId;
  name: string;
  iconKey: string;
  accent: AccentName;
  budgeted: number;
  spent: number;
}

export type BillStatus = 'paid' | 'pending';

export interface Bill {
  id: string;
  name: string;
  iconKey: string;
  accent: AccentName;
  amount: number;
  status: BillStatus;
  dueDay: number;
}

export interface MonthlySummary {
  monthLabel: string;
  budgeted: number;
  spent: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initial: string;
  accent: AccentName;
}

export type CurrencyCode = 'USD' | 'CRC';

export interface Household {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  currency: CurrencyCode;
}

export type MembershipRole = 'owner' | 'member';

export interface Membership {
  householdId: string;
  userId: string;
  role: MembershipRole;
  joinedAt: string;
}

export interface Expense {
  id: string;
  categoryId: CategoryId;
  amount: number;
  note: string;
  paidById: string;
  createdAt: number;
}

export interface DraftExpense {
  categoryId: CategoryId | null;
  amount: number;
  note: string;
  paidById: string | null;
}
