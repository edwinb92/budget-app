import { create } from 'zustand';

import {
  mockCurrentUserId,
  mockHouseholds,
  mockMemberships,
  mockUsers,
} from '@/data/mockData';
import type {
  CurrencyCode,
  Household,
  Membership,
  User,
} from '@/types';

interface HouseholdState {
  currentUserId: string;
  users: User[];
  households: Household[];
  memberships: Membership[];
  activeHouseholdId: string;

  setActiveHousehold: (id: string) => void;
  createHousehold: (input: { name: string; currency: CurrencyCode }) => string;
  renameHousehold: (id: string, name: string) => void;
  setHouseholdCurrency: (id: string, currency: CurrencyCode) => void;
  removeUserFromHousehold: (householdId: string, userId: string) => void;
  deleteHousehold: (id: string) => void;
  addMembership: (input: { householdId: string; userId: string; role: Membership['role'] }) => void;
}

const makeId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

export const useHouseholdStore = create<HouseholdState>((set) => ({
  currentUserId: mockCurrentUserId,
  users: mockUsers,
  households: mockHouseholds,
  memberships: mockMemberships,
  activeHouseholdId: mockHouseholds[0]?.id ?? '',

  setActiveHousehold: (id) => set({ activeHouseholdId: id }),

  createHousehold: ({ name, currency }) => {
    const id = makeId('h');
    set((s) => {
      const household: Household = {
        id,
        name: name.trim(),
        createdBy: s.currentUserId,
        createdAt: Date.now(),
        currency,
      };
      const membership: Membership = {
        householdId: id,
        userId: s.currentUserId,
        role: 'owner',
        joinedAt: Date.now(),
      };
      return {
        households: [...s.households, household],
        memberships: [...s.memberships, membership],
        activeHouseholdId: id,
      };
    });
    return id;
  },

  renameHousehold: (id, name) =>
    set((s) => ({
      households: s.households.map((h) =>
        h.id === id ? { ...h, name: name.trim() } : h,
      ),
    })),

  setHouseholdCurrency: (id, currency) =>
    set((s) => ({
      households: s.households.map((h) =>
        h.id === id ? { ...h, currency } : h,
      ),
    })),

  removeUserFromHousehold: (householdId, userId) =>
    set((s) => ({
      memberships: s.memberships.filter(
        (m) => !(m.householdId === householdId && m.userId === userId),
      ),
    })),

  deleteHousehold: (id) =>
    set((s) => {
      const households = s.households.filter((h) => h.id !== id);
      const memberships = s.memberships.filter((m) => m.householdId !== id);
      const activeHouseholdId =
        s.activeHouseholdId === id
          ? households[0]?.id ?? ''
          : s.activeHouseholdId;
      return { households, memberships, activeHouseholdId };
    }),

  addMembership: ({ householdId, userId, role }) =>
    set((s) => ({
      memberships: [
        ...s.memberships,
        { householdId, userId, role, joinedAt: Date.now() },
      ],
    })),
}));

export const selectActiveHousehold = (s: HouseholdState): Household | undefined =>
  s.households.find((h) => h.id === s.activeHouseholdId);

export const selectActiveHouseholdMembers = (s: HouseholdState): User[] => {
  const userIdsInHousehold = new Set(
    s.memberships
      .filter((m) => m.householdId === s.activeHouseholdId)
      .map((m) => m.userId),
  );
  return s.users.filter((u) => userIdsInHousehold.has(u.id));
};

export const selectCurrentUser = (s: HouseholdState): User | undefined =>
  s.users.find((u) => u.id === s.currentUserId);

export const selectMembersByHousehold = (
  s: HouseholdState,
  householdId: string,
): { user: User; role: Membership['role'] }[] => {
  const householdMemberships = s.memberships.filter(
    (m) => m.householdId === householdId,
  );
  return householdMemberships
    .map((m) => {
      const user = s.users.find((u) => u.id === m.userId);
      return user ? { user, role: m.role } : null;
    })
    .filter((x): x is { user: User; role: Membership['role'] } => x !== null);
};
