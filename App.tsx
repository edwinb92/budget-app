import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryEditor } from '@/components/categories';
import {
  CreateHouseholdModal,
  HouseholdPickerSheet,
  ManageHouseholdModal,
} from '@/components/household';
import { QuickAddButton } from '@/components/dashboard';
import { TabBar } from '@/components/navigation/TabBar';
import { ExpenseWizard } from '@/components/wizard';
import { ActivityFeedScreen } from '@/screens/ActivityFeedScreen';
import { CategoriesScreen } from '@/screens/CategoriesScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
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
      <HouseholdPickerSheet />
      <CreateHouseholdModal />
      <ManageHouseholdModal />
    </View>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Shell />
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
  fabLayer: {
    position: 'absolute',
    right: spacing.xl,
  },
});
