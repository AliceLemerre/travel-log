import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const error = await login(email, password);
        if (error) setErrorMsg(error);
        else navigate("/voyages");
    }

    return (
        <div>
            <h1>Connexion</h1>

            {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

            <form onSubmit={handleSubmit}>
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

                <button>Se connecter</button>
            </form>

            <p>
                Pas de compte ? <Link to="/signup">Créer un compte</Link>
            </p>
        </div>
    );
}
