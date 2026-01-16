import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
// Import du type Session
import type { Session } from "@supabase/supabase-js";
import "./Auth.css"

// Création du client Supabase avec les variables d'environnement
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

export default function Auth() {
    // création d'une constante avec la fonction associée pour set sa valeur, use state pour la valeur par défaut, le code entre <> c'est le type
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [session, setSession] = useState<Session | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Effet exécuté une seule fois au montage du composant
    useEffect(() => {

        // Récupère la session actuelle (si l'utilisateur est déjà connecté)
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

         // Écoute les changements d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        // Nettoyage de l'écouteur lors du démontage du composant
        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Empêche le rechargement de la page
        setLoading(true);
        setErrorMsg(null);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) setErrorMsg(error.message);

        setLoading(false);
    };

    const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) setErrorMsg(error.message);
        else alert("Compte créé ! Vérifie ton email");

        setLoading(false);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
    };

    if (session) {
        return (
            <div>
                <h1>Bienvenue !</h1>
                <p>Connecté en tant que : {session.user.email}</p>
                <button onClick={handleLogout}>Se déconnecter</button>
            </div>
        );
    }

    return (
        <div>
            <h1>Connexion / Inscription</h1>

            {/* Affichage du message d'erreur s'il existe */}
            {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

            {}
            <form onSubmit={handleLogin} style={{ marginBottom: 20 }}>
                <h2>Connexion</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button disabled={loading}>
                    {loading ? "Chargement..." : "Se connecter"}
                </button>
            </form>

            {}
            <form onSubmit={handleSignup}>
                <h2>Créer un compte</h2>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button disabled={loading}>
                    {loading ? "Chargement..." : "S'inscrire"}
                </button>
            </form>
        </div>
    );
}
