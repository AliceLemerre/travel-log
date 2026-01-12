import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import './Auth.css';


function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password: string) {
  return (
    password.length >= 6 &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function SignupPage() {
  const { signup, loginWithOAuth } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!isValidEmail(email)) {
      setErrorMsg("Email invalide");
      return;
    }

    if (!isValidPassword(password)) {
      setErrorMsg(
        "Le mot de passe doit contenir au moins 6 caractères, un chiffre et un caractère spécial"
      );
      return;
    }

    setLoading(true);
    const error = await signup(email, password);
    setLoading(false);

    if (error) setErrorMsg(error);
    else navigate("/voyages");
  }

  return (
    <div className="auth-page">
      <h1>Créer un compte</h1>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <form onSubmit={handleSubmit} noValidate>
        <label className="label-column">
          Email
          <input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label>
          Mot de passe
          <div style={{ display: "flex", gap: 8 }}>
            <input 
              type={showPassword ? "text" : "password"}
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" className="cta" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? "Masquer" : "Voir"}
            </button>
          </div>
        </label>

        <button className="cta" type="submit" disabled={loading}>
          {loading ? "Création..." : "S'inscrire"}
        </button>
      </form>

      <hr />

      <button className="cta" onClick={() => loginWithOAuth("google")}>
        Continuer avec Google
      </button>

      <button className="cta" onClick={() => loginWithOAuth("github")}>
        Continuer avec GitHub
      </button>

      <p>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}
