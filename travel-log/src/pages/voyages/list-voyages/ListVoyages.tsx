import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient"; 
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";

interface Voyage {
  id: number;
  label: string;
  regions: string[] | null;
  pays: string[] | null;
  villes: string[] | null;
  date_depart: string | null;
  date_arrivee: string | null;
  budget: number | null;
  depenses: number | null;
}

function ListVoyagePage() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadVoyages() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("Voyages")
      .select("*")
      .eq("user_id", user.id);
      
    if (error) console.error("Erreur", error);
    else setVoyages(data || []);

    setLoading(false);
  }

  useEffect(() => {
    async function loadAllVoyage() {
      loadVoyages();
    }
    loadAllVoyage();
  }, []);

  async function deleteVoyage(id: number) {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer ce voyage ?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("Voyages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erreur suppression :", error);
      return;
    }

    loadVoyages(); 
  }

  return (
    <div className="list-voyages-page">
      <Header />
      <main>
        <div className="content card card-travel">
          <h2>Mes voyages</h2>

          <button onClick={() => navigate("/voyages/new")}>
            Nouveau voyage
          </button>

          {loading && <p>Chargement...</p>}

          {!loading && voyages.length === 0 && (
            <p>Aucun voyage enregistré.</p>
          )}

          <ul className="card card-travels">
            {voyages.map((voyage) => (
              <li key={voyage.id} className="card-travel card-list">
                <strong>{voyage.label}</strong>
                <br />
                {voyage.date_depart} → {voyage.date_arrivee}
                <br /><br />

                <footer className="card-footer">

                  <button
                    onClick={() => navigate(`/voyages/${voyage.id}`)}
                  >
                    Détails
                  </button>

                  <button 
                    className="cta"
                    onClick={() => navigate(`/voyages/${voyage.id}/edit`)}
                  >
                    Modifier
                  </button>

                  <button
                    className="cta"
                    onClick={() => deleteVoyage(voyage.id)}
                  >
                    Supprimer
                  </button>
                </footer>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default ListVoyagePage;
