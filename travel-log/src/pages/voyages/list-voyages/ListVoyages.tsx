import { useEffect, useState } from "react";
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

  useEffect(() => {
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

      if (error) {
        console.error("Erreur", error);
      } else {
        setVoyages(data || []);
      }

      setLoading(false);
    }

    loadVoyages();
  }, []);

  return (
    <div className="list-voyages-page">
      <Header />

      <main>
        <div className="content">
          <h1>Mes voyages</h1>

          {loading && <p>Chargement...</p>}

          {!loading && voyages.length === 0 && (
            <p>Aucun voyage enregistré.</p>
          )}

          <ul>
            {voyages.map((voyage) => (
              <li key={voyage.id}>
                <strong>{voyage.label}</strong>  
                <br />
                {voyage.date_depart} - {voyage.date_arrivee}
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
