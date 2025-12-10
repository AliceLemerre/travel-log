import { useState } from "react";
import Navbar from "../navbar/Navbar";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <h1>Titre</h1>
        </div>
        <Navbar isOpen={isMenuOpen} onToggle={toggleMenu} />
      </div>
    </header>
  );
}

export default Header;