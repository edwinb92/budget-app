import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { withMutation } from '@/store/mutationStore';
import type { AccentName } from '@/theme';
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
  loading: boolean;

  fetchAll: () => Promise<void>;
  reset: () => void;
  setActiveHousehold: (id: string) => void;
  createHousehold: (input: { name: string; currency: CurrencyCode }) => Promise<void>;
  renameHousehold: (id: string, name: string) => Promise<void>;
  setHouseholdCurrency: (id: string, currency: CurrencyCode) => Promise<void>;
  removeUserFromHousehold: (householdId: string, userId: string) => Promise<void>;
  deleteHousehold: (id: string) => Promise<void>;
  addMembership: (input: { householdId: string; userId: string; role: Membership['role'] }) => Promise<void>;
  updateUser: (userId: string, patch: Partial<Pick<User, 'name' | 'email' | 'accent'>>) => Promise<void>;
}

const mapProfile = (p: {
  id: string;
  name: string;
  email: string;
  accent: string;
}): User => ({
  id: p.id,
  name: p.name,
  email: p.email,
  accent: p.accent as AccentName,
  initial: (p.name.trim().charAt(0) || '?').toUpperCase(),
});

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  currentUserId: '',
  users: [],
  households: [],
  memberships: [],
  activeHouseholdId: '',
  loading: false,

  fetchAll: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user.id ?? '';
    if (!userId) {
      get().reset();
      return;
    }

    set({ loading: true });

    const [profilesRes, householdsRes, membershipsRes] = await Promise.all([
      supabase.from('profiles').select('id, name, email, accent'),
      supabase
        .from('households')
        .select('id, name, currency, createdBy:created_by, createdAt:created_at'),
      supabase
        .from('memberships')
        .select('householdId:household_id, userId:user_id, role, joinedAt:joined_at'),
    ]);

    const users = (profilesRes.data ?? []).map(mapProfile);
    const households = (householdsRes.data ?? []) as Household[];
    const memberships = (membershipsRes.data ?? []) as Membership[];

    set((s) => ({
      currentUserId: userId,
      users,
      households,
      memberships,
      activeHouseholdId:
        households.find((h) => h.id === s.activeHouseholdId)?.id ??
        households[0]?.id ??
        '',
      loading: false,
    }));
  },

  reset: () =>
    set({
      currentUserId: '',
      users: [],
      households: [],
      memberships: [],
      activeHouseholdId: '',
      loading: false,
    }),

  setActiveHousehold: (id) => set({ activeHouseholdId: id }),

  createHousehold: async ({ name, currency }) =>
    withMutation(async () => {
      const userId = get().currentUserId;
      if (!userId) return;

      const { data, error } = await supabase
        .from('households')
        .insert({ name: name.trim(), currency, created_by: userId })
        .select('id')
        .single();
      if (error || !data) return;

      await supabase.from('memberships').insert({
        household_id: data.id,
        user_id: userId,
        role: 'owner',
      });

      await get().fetchAll();
      set({ activeHouseholdId: data.id });
    }),

  renameHousehold: async (id, name) =>
    withMutation(async () => {
      await supabase.from('households').update({ name: name.trim() }).eq('id', id);
      await get().fetchAll();
    }),

  setHouseholdCurrency: async (id, currency) =>
    withMutation(async () => {
      await supabase.from('households').update({ currency }).eq('id', id);
      await get().fetchAll();
    }),

  removeUserFromHousehold: async (householdId, userId) =>
    withMutation(async () => {
      await supabase
        .from('memberships')
        .delete()
        .eq('household_id', householdId)
        .eq('user_id', userId);
      await get().fetchAll();
    }),

  deleteHousehold: async (id) =>
    withMutation(async () => {
      await supabase.from('households').delete().eq('id', id);
      await get().fetchAll();
    }),

  addMembership: async ({ householdId, userId, role }) =>
    withMutation(async () => {
      await supabase.from('memberships').insert({
        household_id: householdId,
        user_id: userId,
        role,
      });
      await get().fetchAll();
    }),

  updateUser: async (userId, patch) =>
    withMutation(async () => {
      const update: { name?: string; email?: string; accent?: string } = {};
      if (patch.name !== undefined) update.name = patch.name.trim();
      if (patch.email !== undefined) update.email = patch.email.trim();
      if (patch.accent !== undefined) update.accent = patch.accent;
      await supabase.from('profiles').update(update).eq('id', userId);
      await get().fetchAll();
    }),
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
