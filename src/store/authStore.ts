"use client";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  init: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null, profile: null, session: null, loading: true,

  init: async () => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) await get().fetchProfile(session.user.id);
    set({ session, user: session?.user ?? null, loading: false });
    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) await get().fetchProfile(session.user.id);
      else set({ profile: null });
    });
  },

  fetchProfile: async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) set({ profile: data as UserProfile });
  },

  signIn: async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null });
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    const { user } = get();
    if (!user) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles").update(updates).eq("id", user.id).select().single();
    if (!error && data) set({ profile: data as UserProfile });
  },
}));

export default useAuthStore;
