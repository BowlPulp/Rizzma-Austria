"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/api";

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncUser = useCallback(
    async (name: string, email: string) => {
      try {
        await apiFetch("/auth/sync", {
          method: "POST",
          body: JSON.stringify({ name, email }),
        });
      } catch (err) {
        console.error("Failed to sync user to backend:", err);
      }
    },
    [],
  );

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiFetch<{ user: UserProfile } | UserProfile>(
        "/auth/profile",
      );
      // Backend wraps response in { user: ... }
      const profileData = "user" in data ? data.user : data;
      setProfile(profileData);
    } catch {
      setProfile(null);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        fetchProfile().finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        // On SIGNED_IN after signup, sync user to backend
        if (event === "SIGNED_IN") {
          const name = newSession.user.user_metadata?.name;
          const email = newSession.user.email;
          if (name && email) {
            syncUser(name, email).then(() => fetchProfile());
            return;
          }
        }
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, syncUser]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Profile will be fetched by onAuthStateChange
    },
    [],
  );

  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (error) throw error;

      // If we got a session immediately (email confirmation disabled),
      // sync user to backend now
      if (data.session) {
        await syncUser(name, email);
        await fetchProfile();
      }
      // If no session (email confirmation enabled), sync happens
      // when user confirms email and onAuthStateChange fires SIGNED_IN
    },
    [fetchProfile, syncUser],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const isAdmin = profile?.role === "admin";

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      isLoading,
      isAdmin,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, profile, isLoading, isAdmin, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
