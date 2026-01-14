import "./Footer.css"

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} - Tous droits réservés</p>
      </div>
    </footer>
  );
}

export default Footer;