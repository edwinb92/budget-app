import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LayoutDashboard, ListChecks, Settings, Tags } from 'lucide-react-native';

import { TabButton } from '@/components/navigation/TabButton';
import { TabId, useNavStore } from '@/store/navStore';
import { colors, shadows, spacing } from '@/theme';

const TAB_DEFS: { id: TabId; tKey: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', tKey: 'tabs.dashboard', icon: LayoutDashboard },
  { id: 'activity', tKey: 'tabs.activity', icon: ListChecks },
  { id: 'categories', tKey: 'tabs.categories', icon: Tags },
  { id: 'settings', tKey: 'tabs.settings', icon: Settings },
];

export const TabBar: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const activeTab = useNavStore((s) => s.activeTab);
  const setActiveTab = useNavStore((s) => s.setActiveTab);

  return (
    <View
      style={[
        styles.bar,
        shadows.card,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}
    >
      {TAB_DEFS.map((tab) => (
        <TabButton
          key={tab.id}
          label={t(tab.tKey)}
          icon={tab.icon}
          active={activeTab === tab.id}
          onPress={() => setActiveTab(tab.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
