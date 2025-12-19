import { useState } from "react";
import Navbar from "../navbar/Navbar";
import { Link } from "react-router-dom";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to="/" className="navbar-title">
            <h1>Travel log</h1>
          </Link>
        </div>
        <Navbar isOpen={isMenuOpen} onToggle={toggleMenu} />
      </div>
    </header>
  );
}

export default Header;