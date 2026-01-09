import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";

interface Etape {
  id: number;
  label: string;
  adresse: string | null;
  pays: string | null;
  region: string | null;
  notes: string | null;
  depenses: number | null;
}

function EtapeDetailPage() {
  const { voyageId, etapeId } = useParams();
  const navigate = useNavigate();

  const [etape, setEtape] = useState<Etape | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!etapeId) return;

    async function loadEtape() {
      const { data } = await supabase
        .from("Etapes")
        .select("*")
        .eq("id", etapeId)
        .single();

      setEtape(data || null);
      setLoading(false);
    }

    loadEtape();
  }, [etapeId]);

  if (loading) {
    return (
      <div>
        <Header />
        <main>
          <p>Chargement...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!etape) {
    return (
      <div>
        <Header />
        <main>
          <p>Étape introuvable</p>
          <button className="cta cta-icon" onClick={() => navigate(`/voyages/${voyageId}/edit`)}>
            ←
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="etape-detail-page">
      <Header />

      <main>
        <div className="content card card-travel">
          <h1>{etape.label}</h1>

          {etape.adresse && <p><strong>Adresse :</strong> {etape.adresse}</p>}
          {etape.pays && <p><strong>Pays :</strong> {etape.pays}</p>}
          {etape.region && <p><strong>Région :</strong> {etape.region}</p>}
          {etape.notes && <p><strong>Notes :</strong> {etape.notes}</p>}
          {etape.depenses !== null && (
            <p><strong>Dépenses :</strong> {etape.depenses} €</p>
          )}

          <div style={{ marginTop: 20 }}>
            <button
              className="cta"
              onClick={() =>
                navigate(`/voyages/${voyageId}/etapes/${etape.id}/edit`)
              }
            >
              Modifier
            </button>

            {/* <button
             className="cta"
              onClick={() => navigate(`/voyages/${voyageId}/edit`)}
            >
              Retour au voyage
            </button> */}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EtapeDetailPage;
