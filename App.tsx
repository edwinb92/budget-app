import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExpenseEditorSheet } from '@/components/activity';
import { CategoryEditor } from '@/components/categories';
import {
  CreateHouseholdModal,
  HouseholdPickerSheet,
  ManageHouseholdModal,
} from '@/components/household';
import { QuickAddButton } from '@/components/dashboard';
import {
  ChangePasswordSheet,
  ProfileEditorSheet,
} from '@/components/profile';
import { TabBar } from '@/components/navigation/TabBar';
import { ExpenseWizard } from '@/components/wizard';
import { ActivityFeedScreen } from '@/screens/ActivityFeedScreen';
import { AuthScreen } from '@/screens/auth';
import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { subscribeToHousehold } from '@/lib/realtime';
import { initAuth, useAuthStore } from '@/store/authStore';
import { useBudgetStore } from '@/store/budgetStore';
import { useHouseholdStore } from '@/store/householdStore';
import { useNavStore } from '@/store/navStore';
import { useWizardStore } from '@/store/wizardStore';
import { colors, spacing } from '@/theme';

const TAB_BAR_HEIGHT = 64;

const ActiveScreen: React.FC = () => {
  const activeTab = useNavStore((s) => s.activeTab);
  switch (activeTab) {
    case 'dashboard':
      return <DashboardScreen />;
    case 'activity':
      return <ActivityFeedScreen />;
    case 'categories':
      return <CategoriesScreen />;
    case 'settings':
      return <SettingsScreen />;
    default:
      return <DashboardScreen />;
  }
};

const FAB_TABS = new Set(['dashboard', 'activity']);

const FloatingFab: React.FC = () => {
  const insets = useSafeAreaInsets();
  const openWizard = useWizardStore((s) => s.open);
  const activeTab = useNavStore((s) => s.activeTab);
  const bottomOffset = TAB_BAR_HEIGHT + Math.max(insets.bottom, spacing.sm) + spacing.md;

  if (!FAB_TABS.has(activeTab)) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.fabLayer, { bottom: bottomOffset }]}
    >
      <QuickAddButton onPress={openWizard} />
    </View>
  );
};

const Shell: React.FC = () => {
  return (
    <View style={styles.root}>
      <ActiveScreen />
      <FloatingFab />
      <TabBar />
      <ExpenseWizard />
      <CategoryEditor />
      <ExpenseEditorSheet />
      <HouseholdPickerSheet />
      <CreateHouseholdModal />
      <ManageHouseholdModal />
      <ProfileEditorSheet />
      <ChangePasswordSheet />
    </View>
  );
};

const Root: React.FC = () => {
  const session = useAuthStore((s) => s.session);
  const initializing = useAuthStore((s) => s.initializing);
  const userId = session?.user.id ?? null;
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  useEffect(() => initAuth(), []);

  useEffect(() => {
    if (userId) {
      useHouseholdStore.getState().fetchAll();
    } else {
      useHouseholdStore.getState().reset();
      useBudgetStore.getState().reset();
    }
  }, [userId]);

  useEffect(() => {
    if (!activeHouseholdId) {
      useBudgetStore.getState().reset();
      return;
    }
    useBudgetStore.getState().fetchForActiveHousehold();
    const unsubscribe = subscribeToHousehold(activeHouseholdId);
    return unsubscribe;
  }, [activeHouseholdId]);

  if (initializing) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return session ? <Shell /> : <AuthScreen />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Root />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabLayer: {
    position: 'absolute',
    right: spacing.xl,
  },
});
