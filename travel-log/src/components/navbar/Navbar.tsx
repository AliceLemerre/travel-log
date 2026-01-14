import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import './Navbar.css'

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Navbar({ isOpen }: NavbarProps) {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* <button className="menu-toggle" onClick={onToggle}>
          Menu
        </button> */}

        <input className="checkbox" type="checkbox" />
        <div className="hamburger-lines">
        <span className="line line1"></span>
        <span className="line line2"></span>
        <span className="line line3"></span>
        </div>
    

        <div className={`menu-items nav-links ${isOpen ? "open" : ""}`}>
          {user && (
            <>
              <Link to="/voyages" className="nav-link">
                 Mes voyages
              </Link>

              <Link to="/voyages/new" className="nav-link">
                Nouveau voyage
              </Link>
            </>
            

           
          )}

          {user ? (
            <>
            <div className="nav-dropdown">
              <a
                className="nav-link"
                onClick={() => setShowMenu(!showMenu)}
              >
                Paramètres
              </a>
              

              {showMenu && (
                <div className="account-menu nav-links">
                  <Link to="/tags" className="menu-item nav-link">
                    Liste des Tags
                  </Link>
                  <input type="checkbox" id="dark-mode-toggle"></input>
                  <label htmlFor="dark-mode-toggle" className="toggle"></label>
                </div>
              )}
              </div>

              <button className="menu-item cta cta-danger logout" onClick={logout}>
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button className="nav-link cta">Connexion</button>
              </Link>

              <Link to="/signup">
                <button className="nav-link cta">Inscription</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
