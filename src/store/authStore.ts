import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(() => ({
  session: null,
  initializing: true,

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error?.message };
  },

  signUp: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    return { error: error?.message };
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },
}));

// Inicializa la sesión al arrancar y escucha cambios de auth.
// Devuelve una función de cleanup para desuscribir el listener.
export const initAuth = (): (() => void) => {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session, initializing: false });
  });

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session, initializing: false });
  });

  return () => data.subscription.unsubscribe();
};
