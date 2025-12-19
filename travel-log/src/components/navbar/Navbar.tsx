import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Navbar({ isOpen, onToggle }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* <button className="menu-toggle" onClick={onToggle}>
          Menu
        </button> */}

        <div className={`nav-links ${isOpen ? "open" : ""}`}>
          {user && (
            <>
              <Link to="/voyages">
                <button className="nav-link">Mes voyages</button>
              </Link>

              <Link to="/voyages/new">
                <button className="nav-link">Nouveau voyage</button>
              </Link>
            </>
          )}

          {user ? (
            <>
              <button
                className="nav-link"
                onClick={() => setShowMenu(!showMenu)}
              >
                Mon Compte
              </button>

              {showMenu && (
                <div className="account-menu">
                  <button className="menu-item">Liste des Tags</button>
                  <button className="menu-item">Mon Profil</button>
                  <button className="menu-item logout" onClick={logout}>
                    Déconnexion
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="nav-link">Connexion</button>
              </Link>

              <Link to="/signup">
                <button className="nav-link">Inscription</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
