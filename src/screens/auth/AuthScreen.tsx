import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet } from 'lucide-react-native';

import { useAuthStore } from '@/store/authStore';
import { colors, radius, spacing, typography } from '@/theme';

type Mode = 'signIn' | 'signUp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const AuthScreen: React.FC = () => {
  const signIn = useAuthStore((s) => s.signIn);
  const signUp = useAuthStore((s) => s.signUp);

  const [mode, setMode] = useState<Mode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isSignUp = mode === 'signUp';
  const emailValid = EMAIL_RE.test(email.trim());
  const passwordValid = password.length >= 6;
  const nameValid = !isSignUp || name.trim().length > 0;
  const canSubmit = emailValid && passwordValid && nameValid && !submitting;

  const toggleMode = () => {
    setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const { error: err } = isSignUp
      ? await signUp(email, password, name)
      : await signIn(email, password);

    if (err) {
      setError(err);
      setSubmitting(false);
    }
    // En éxito, onAuthStateChange actualiza la sesión y App desmonta esta pantalla.
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Wallet size={28} color={colors.onPrimary} strokeWidth={2.4} />
            </View>
            <Text style={styles.title}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp
                ? 'Start tracking your shared budgets.'
                : 'Sign in to your shared budgets.'}
            </Text>
          </View>

          <View style={styles.form}>
            {isSignUp ? (
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={colors.text.faint}
                  selectionColor={colors.primary}
                  autoCapitalize="words"
                  maxLength={48}
                />
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={colors.text.faint}
                selectionColor={colors.primary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.text.faint}
                selectionColor={colors.primary}
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={handleSubmit}
                returnKeyType="go"
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={handleSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.submitBtn,
                !canSubmit && styles.submitBtnDisabled,
                pressed && canSubmit && styles.pressed,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color={colors.onPrimary} />
              ) : (
                <Text style={styles.submitLabel}>
                  {isSignUp ? 'Create account' : 'Sign in'}
                </Text>
              )}
            </Pressable>
          </View>

          <Pressable onPress={toggleMode} hitSlop={8} style={styles.toggle}>
            <Text style={styles.toggleText}>
              {isSignUp
                ? 'Already have an account? '
                : "Don't have an account? "}
              <Text style={styles.toggleLink}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  label: {
    ...typography.overline,
    color: colors.text.muted,
  },
  input: {
    ...typography.subtitle,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.status.danger,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  submitBtnDisabled: {
    backgroundColor: colors.border,
  },
  submitLabel: {
    ...typography.subtitle,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
  },
  toggle: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  toggleText: {
    ...typography.body,
    color: colors.text.muted,
  },
  toggleLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});
