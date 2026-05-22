import {
  Wifi,
  Zap,
  Droplets,
  Tv,
} from 'lucide-react-native';

import type {
  Bill,
  BudgetCategory,
  Expense,
  HouseholdMember,
  MonthlySummary,
} from '@/types';

export const mockSummary: MonthlySummary = {
  monthLabel: 'May 2026',
  budgeted: 4500,
  spent: 2785,
};

export const mockCategories: BudgetCategory[] = [
  {
    id: 'food',
    name: 'Food',
    iconKey: 'food',
    accent: 'coral',
    budgeted: 800,
    spent: 610,
  },
  {
    id: 'transport',
    name: 'Transport',
    iconKey: 'transport',
    accent: 'sky',
    budgeted: 400,
    spent: 215,
  },
  {
    id: 'fun',
    name: 'Entertainment',
    iconKey: 'fun',
    accent: 'violet',
    budgeted: 300,
    spent: 280,
  },
  {
    id: 'home',
    name: 'Home',
    iconKey: 'home',
    accent: 'amber',
    budgeted: 1200,
    spent: 740,
  },
  {
    id: 'health',
    name: 'Health',
    iconKey: 'health',
    accent: 'rose',
    budgeted: 250,
    spent: 90,
  },
  {
    id: 'learning',
    name: 'Learning',
    iconKey: 'learning',
    accent: 'mint',
    budgeted: 200,
    spent: 60,
  },
];

export const mockMembers: HouseholdMember[] = [
  { id: 'm-edan', name: 'Edan', initial: 'E', accent: 'violet' },
  { id: 'm-partner', name: 'Partner', initial: 'P', accent: 'rose' },
];

export const mockBills: Bill[] = [
  {
    id: 'internet',
    name: 'Internet',
    icon: Wifi,
    accent: 'sky',
    amount: 55,
    status: 'paid',
    dueDay: 3,
  },
  {
    id: 'electricity',
    name: 'Electricity',
    icon: Zap,
    accent: 'amber',
    amount: 92,
    status: 'paid',
    dueDay: 8,
  },
  {
    id: 'water',
    name: 'Water',
    icon: Droplets,
    accent: 'mint',
    amount: 38,
    status: 'pending',
    dueDay: 22,
  },
  {
    id: 'streaming',
    name: 'Streaming',
    icon: Tv,
    accent: 'violet',
    amount: 24,
    status: 'pending',
    dueDay: 27,
  },
];

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const now = Date.now();

export const mockExpenses: Expense[] = [
  {
    id: 'seed-1',
    categoryId: 'food',
    amount: 32,
    note: 'Lunch with team',
    paidById: 'm-edan',
    createdAt: now - 3 * HOUR,
  },
  {
    id: 'seed-2',
    categoryId: 'transport',
    amount: 14,
    note: '',
    paidById: 'm-partner',
    createdAt: now - 6 * HOUR,
  },
  {
    id: 'seed-3',
    categoryId: 'fun',
    amount: 48,
    note: 'Movie tickets',
    paidById: 'm-edan',
    createdAt: now - 1 * DAY - 2 * HOUR,
  },
  {
    id: 'seed-4',
    categoryId: 'food',
    amount: 76,
    note: 'Groceries',
    paidById: 'm-partner',
    createdAt: now - 1 * DAY - 5 * HOUR,
  },
  {
    id: 'seed-5',
    categoryId: 'home',
    amount: 120,
    note: 'New lamp',
    paidById: 'm-edan',
    createdAt: now - 3 * DAY,
  },
  {
    id: 'seed-6',
    categoryId: 'health',
    amount: 22,
    note: '',
    paidById: 'm-partner',
    createdAt: now - 5 * DAY,
  },
];
