import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function InfoVoyagePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVoyage() {
      const { data, error } = await supabase
        .from("Voyages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error("Erreur chargement :", error);
      else setVoyage(data);

      setLoading(false);
    }

    loadVoyage();
  }, [id]);

  if (loading) return <p>Chargement...</p>;

  if (!voyage) return <p>Voyage introuvable.</p>;

  return (
    <div className="info-voyage-page">
      <Header />

      <main>
        <div className="content">
          <h1>{voyage.label}</h1>

          <p>
            <strong>Dates :</strong> {voyage.date_depart} → {voyage.date_arrivee}
          </p>

          <p>
            <strong>Budget :</strong> {voyage.budget ?? "Non renseigné"} €
          </p>

          <p>
            <strong>Dépenses :</strong> {voyage.depenses ?? "Aucune"} €
          </p>

          <p>
            <strong>Pays :</strong> {voyage.pays?.join(", ") || "Non renseigné"}
          </p>

          <p>
            <strong>Villes :</strong> {voyage.villes?.join(", ") || "Non renseigné"}
          </p>

          <p>
            <strong>Régions :</strong> {voyage.regions?.join(", ") || "Non renseigné"}
          </p>

          <br />

          <button onClick={() => navigate(`/voyages/${voyage.id}/edit`)}>
            Modifier
          </button>

          <button onClick={() => navigate("/voyages")}>
             Retour à la liste
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default InfoVoyagePage;
