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

interface Etape {
  id: number;
  label: string;
  adresse: string | null;
  pays: string | null;
  region: string | null;
  notes: string | null;
  depenses: number | null;
}

function InfoVoyagePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: voyageData } = await supabase
        .from("Voyages")
        .select("*")
        .eq("id", id)
        .single();

      const { data: etapesData } = await supabase
        .from("Etapes")
        .select("*")
        .eq("voyage_id", id)
        .order("id", { ascending: true });

      setVoyage(voyageData);
      setEtapes(etapesData || []);
      setLoading(false);
    }

    loadData();
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

          <hr />

          <h2>Étapes</h2>

          {etapes.length === 0 && <p>Aucune étape enregistrée.</p>}

          <ul>
            {etapes.map((etape) => (
              <li key={etape.id}>
                <strong>{etape.label}</strong>
                {etape.pays && <span> – {etape.pays}</span>}
                <br />

                <button
                  onClick={() =>
                    navigate(`/voyages/${voyage.id}/etapes/${etape.id}`)
                  }
                >
                  Voir
                </button>

                <button
                  onClick={() =>
                    navigate(`/voyages/${voyage.id}/etapes/${etape.id}/edit`)
                  }
                >
                  Modifier
                </button>
              </li>
            ))}
          </ul>

          <br />

          <button onClick={() => navigate(`/voyages/${voyage.id}/edit`)}>
            Modifier le voyage
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
