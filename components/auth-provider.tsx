"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser, supabaseConfigured } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!supabaseConfigured);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    let alive = true;
    // Auth events update the UI; RLS always enforces access on the server.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      if (event === "SIGNED_OUT") setUser(null);
      else if (event !== "INITIAL_SESSION") setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => {
      if (alive) { setUser(data.user); setReady(true); }
    }).catch(() => { if (alive) setReady(true); });
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user, ready, configured: supabaseConfigured,
    signOut: async () => {
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    },
  }), [user, ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
