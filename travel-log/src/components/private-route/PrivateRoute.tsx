import { type ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

interface PrivateRouteProps {
  children: ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthenticated(!!session);
    } catch (error) {
      console.error("Erreur de vérification d'authentification:", error);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;