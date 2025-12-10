import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface NavbarProps {
  isOpen: boolean;
  onToggle: () => void;
}

function Navbar({ isOpen, onToggle }: NavbarProps) {
  const [user, setUser] = useState<unknown>(null);
  const [showMenu, setShowMenu] = useState(false);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  useEffect(() => {
    const loadItems = async () => {
      await checkUser();
    };
    loadItems();
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <button className="menu-toggle" onClick={onToggle}>
          Menu
        </button>
        
        <div className={`nav-links ${isOpen ? "open" : ""}`}>
          {user ? (
            <>
              <button className="nav-link" onClick={() => setShowMenu(!showMenu)}>
                Mon Compte
              </button>
              
              {showMenu && (
                <div className="account-menu">
                  <button className="menu-item" onClick={() => {}}>
                    Liste des Tags
                  </button>
                  <button className="menu-item" onClick={() => {}}>
                    Mon Profil
                  </button>
                  <button className="menu-item logout" onClick={handleLogout}>
                    Déconnexion
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <button className="nav-link">Connexion</button>
              <button className="nav-link">Inscription</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;