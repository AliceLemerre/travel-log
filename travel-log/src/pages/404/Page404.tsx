import { useNavigate } from "react-router-dom";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

export default function Page404() {
  const navigate = useNavigate();

  return (
    <div className="page-404">
      <Header />

      <main>
        <div className="content" style={{ textAlign: "center" }}>
          <h1>404</h1>
          <h2>Page introuvable</h2>

          <p>
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>

          <button onClick={() => navigate("/")}>
            Retour à l'accueil
          </button>

          <button onClick={() => navigate("/voyages")}>
            Mes voyages
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
