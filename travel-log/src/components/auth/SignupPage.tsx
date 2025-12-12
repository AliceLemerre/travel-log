import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function SignupPage() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const error = await signup(email, password);

        if (error) setErrorMsg(error);
        else navigate("/voyages");
    }

    return (
        <div>
            <h1>Créer un compte</h1>

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

                <button>S'inscrire</button>
            </form>

            <p>
                Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
        </div>
    );
}
