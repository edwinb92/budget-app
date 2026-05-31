import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, X } from 'lucide-react-native';

import { getCategoryIcon } from '@/data/icons';
import { useCurrencySymbol } from '@/hooks/useFormatCurrency';
import { useBudgetStore } from '@/store/budgetStore';
import { useExpenseEditorStore } from '@/store/expenseEditorStore';
import { useHouseholdStore } from '@/store/householdStore';
import { colors, radius, spacing, typography } from '@/theme';

const sanitize = (input: string): number => {
  const digits = input.replace(/[^0-9]/g, '');
  if (!digits) return 0;
  const parsed = parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const ExpenseEditorSheet: React.FC = () => {
  const insets = useSafeAreaInsets();
  const editingId = useExpenseEditorStore((s) => s.editingId);
  const close = useExpenseEditorStore((s) => s.close);

  const expense = useBudgetStore((s) =>
    editingId ? s.expenses.find((e) => e.id === editingId) : undefined,
  );
  const category = useBudgetStore((s) =>
    expense ? s.categories.find((c) => c.id === expense.categoryId) : undefined,
  );
  const updateExpense = useBudgetStore((s) => s.updateExpense);
  const deleteExpense = useBudgetStore((s) => s.deleteExpense);
  const payer = useHouseholdStore((s) =>
    expense ? s.users.find((u) => u.id === expense.paidById) : undefined,
  );
  const currentUserId = useHouseholdStore((s) => s.currentUserId);
  const symbol = useCurrencySymbol();

  const [draftAmount, setDraftAmount] = useState(0);
  const [draftNote, setDraftNote] = useState('');

  useEffect(() => {
    if (expense) {
      setDraftAmount(expense.amount);
      setDraftNote(expense.note);
    }
  }, [expense]);

  if (!editingId || !expense || !category) return null;

  const accent = colors.accents[category.accent];
  const Icon = getCategoryIcon(category.iconKey);

  const trimmedNote = draftNote.trim();
  const amountValid = draftAmount > 0;
  const formattedAmount = draftAmount === 0 ? '' : draftAmount.toLocaleString('en-US');
  const isDirty =
    (amountValid && draftAmount !== expense.amount) ||
    trimmedNote !== expense.note;
  const canSave = amountValid && isDirty;

  const handleSave = () => {
    if (!canSave) return;
    updateExpense(expense.id, {
      amount: draftAmount,
      note: trimmedNote,
    });
    close();
  };

  const handleDelete = () => {
    const targetId = expense.id;
    const targetName = category.name.toLowerCase();
    close();
    Alert.alert(
      'Delete expense',
      `Remove this ${targetName} expense? This will update your category and monthly totals.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(targetId),
        },
      ],
    );
  };

  return (
    <Modal
      visible={!!editingId}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={close}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          pointerEvents="box-none"
        >
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: Math.max(insets.bottom, spacing.lg) },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={[styles.iconWrap, { backgroundColor: accent.soft }]}>
                <Icon size={20} color={accent.base} strokeWidth={2.2} />
              </View>
              <View style={styles.headerText}>
                <Text style={styles.eyebrow}>Edit expense</Text>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category.name}
                </Text>
                {payer ? (
                  <Text style={styles.payerLabel} numberOfLines={1}>
                    Paid by:{' '}
                    <Text
                      style={[
                        styles.payerName,
                        { color: colors.accents[payer.accent].base },
                      ]}
                    >
                      {payer.id === currentUserId ? 'You' : payer.name}
                    </Text>
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={close}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.iconBtn,
                  pressed && styles.pressed,
                ]}
              >
                <X size={18} color={colors.text.primary} strokeWidth={2.4} />
              </Pressable>
            </View>

            <Text style={styles.label}>Amount</Text>
            <View
              style={[
                styles.amountRow,
                !amountValid && styles.inputInvalid,
              ]}
            >
              <Text style={styles.amountSymbol}>{symbol}</Text>
              <TextInput
                value={formattedAmount}
                onChangeText={(text) => setDraftAmount(sanitize(text))}
                style={styles.amountInput}
                selectionColor={colors.primary}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.text.faint}
                maxLength={11}
                autoFocus
              />
            </View>

            <Text style={styles.label}>What was this for?</Text>
            <TextInput
              value={draftNote}
              onChangeText={setDraftNote}
              style={styles.noteInput}
              selectionColor={colors.primary}
              placeholder="e.g. Pizza with friends"
              placeholderTextColor={colors.text.faint}
              multiline
              maxLength={140}
              textAlignVertical="top"
            />
            <Text style={styles.noteCounter}>{draftNote.length}/140</Text>

            <Text style={styles.hint}>
              Need to change the category? Delete this expense and add it again.
            </Text>

            <Pressable
              onPress={handleSave}
              disabled={!canSave}
              style={({ pressed }) => [
                styles.saveBtn,
                !canSave && styles.saveBtnDisabled,
                pressed && canSave && styles.pressed,
              ]}
            >
              <Text style={styles.saveLabel}>Save changes</Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteBtn,
                pressed && styles.pressed,
              ]}
            >
              <Trash2 size={18} color={colors.status.danger} strokeWidth={2.4} />
              <Text style={styles.deleteLabel}>Delete expense</Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 34, 48, 0.45)',
    justifyContent: 'flex-end',
  },
  kav: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.text.muted,
    marginBottom: 2,
  },
  categoryName: {
    ...typography.title,
    color: colors.text.primary,
  },
  payerLabel: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: 6,
  },
  payerName: {
    fontWeight: '700',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    ...typography.overline,
    color: colors.text.muted,
    marginBottom: spacing.sm,
  },
  inputInvalid: {
    borderColor: colors.status.danger,
  },
  noteInput: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  noteCounter: {
    ...typography.caption,
    color: colors.text.faint,
    textAlign: 'right',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  amountSymbol: {
    ...typography.subtitle,
    color: colors.text.muted,
  },
  amountInput: {
    ...typography.subtitle,
    color: colors.text.primary,
    flex: 1,
    padding: 0,
  },
  hint: {
    ...typography.caption,
    color: colors.text.faint,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  saveBtn: {
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveBtnDisabled: {
    backgroundColor: colors.border,
  },
  saveLabel: {
    ...typography.subtitle,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 122, 107, 0.08)',
  },
  deleteLabel: {
    ...typography.subtitle,
    color: colors.status.danger,
    fontWeight: '700',
  },
});
