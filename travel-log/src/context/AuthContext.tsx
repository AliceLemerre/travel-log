import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import type { Session, User, Provider } from "@supabase/supabase-js";

// Interface décrivant ce que le contexte d'authentification expose à toute l'application
// ensemble de méthodes accessibles depuis l'extérieur d'une classe
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (email: string, password: string) => Promise<string | null>;
  loginWithOAuth: (provider: Provider) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider global d'authentification, Doit envelopper l'application
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const user = session?.user ?? null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return error ? error.message : null;
  }

  async function signup(email: string, password: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return error ? error.message : null;
  }

  async function loginWithOAuth(provider: Provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/voyages`,
      },
    });
    return error ? error.message : null;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    // Provider qui engloble l'app, avec les valeurs de l'interfaces accessibles dans le composant enfant
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        login,
        signup,
        loginWithOAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook personnalisé pour consommer le contexte Auth, Empêche son utilisation hors du AuthProvider
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
