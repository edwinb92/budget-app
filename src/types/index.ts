import type { AccentName } from '@/theme';
import type { LucideIcon } from 'lucide-react-native';

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
  icon: LucideIcon;
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

export interface HouseholdMember {
  id: string;
  name: string;
  initial: string;
  accent: AccentName;
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
