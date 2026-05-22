
# Shared Budget App — Product & Architecture Notes

## Product Vision

The app is designed for couples and shared households that want an extremely simple way to manage shared expenses and monthly budgets.

This is NOT:
- a banking app
- accounting software
- enterprise finance software

The app should feel:
- calm
- modern
- collaborative
- lightweight
- mobile-first

Main goal:
> "How much do we have left this month?"

---

# Authentication Strategy

Authentication uses Supabase Auth.

The React Native app handles:
- login UI
- registration UI
- session handling

Supabase handles:
- passwords
- auth.users
- sessions
- JWT tokens

No custom backend is required initially.

---

# User Model

Supabase stores users in:

auth.users

The app should also have:

profiles
- id
- full_name
- avatar
- created_at

profiles.id references auth.users.id.

---

# Shared Budget Architecture

The app supports multiple households.

Examples:
- Casa Principal
- Viaje Japón
- Boda

Tables:

households
- id
- name
- created_by

household_members
- id
- household_id
- user_id
- role

categories
- id
- household_id
- name
- budget_amount

expenses
- id
- household_id
- category_id
- user_id
- amount
- note

---

# Navigation Structure

Bottom tabs:
1. Dashboard
2. Activity
3. Categories
4. Settings

---

# Categories UX

The Categories tab contains:
- active household selector
- categories
- quick budget actions

Selector example:

Casa Principal ▼

Changing the household refreshes:
- dashboard
- categories
- activity
- bills

Dropdown options:
- switch household
- create household
- manage budgets

Manage Budgets is a shortcut to the same screen accessible from Settings.

---

# Settings UX

Settings includes:

## Shared Budgets
- household list
- budget management access

## Account
- profile
- logout

## Preferences
- currency
- notifications

---

# Manage Budget Screen

Features:
- members
- invitations
- rename budget
- currency settings
- leave budget
- delete budget

---

# Frontend Stack

Use:
- React Native
- Expo
- TypeScript
- React Native StyleSheet
- Zustand
- Reanimated
- Gesture Handler
- Lucide React Native
- Supabase

Avoid:
- NativeWind
- Tailwind
- heavy UI frameworks

---

# Styling Philosophy

Use:
- StyleSheet.create()
- centralized theme constants
- reusable UI primitives

Theme structure:

/theme
- colors.ts
- spacing.ts
- radius.ts
- typography.ts
- shadows.ts

---

# Main UX Goal

The app should feel:
- fast
- simple
- collaborative
- visually calm

The expense wizard is the most important UX flow.
