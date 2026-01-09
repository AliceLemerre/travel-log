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

interface Media {
  id: number;
  nom: string;
  url: string;
}

function InfoVoyagePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [voyage, setVoyage] = useState<Voyage | null>(null);
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [medias, setMedias] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      setLoading(true);

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

      const { data: mediasData } = await supabase
        .from("Medias")
        .select("*")
        .eq("voyage_id", id)
        .order("created_at", { ascending: true });

      setVoyage(voyageData || null);
      setEtapes(etapesData || []);
      setMedias(mediasData || []);
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
        <div className="content card card-travel">
          <div className="card-travel-top">
            <header className="card-header">
              <button className="cta cta-icon" onClick={() => navigate("/voyages")}>
                ←
              </button>

              <button
                className="cta card-header-cta"
                onClick={() => navigate(`/voyages/${voyage.id}/edit`)}
              >
                Modifier
              </button>
            </header>

            <h2>{voyage.label}</h2>

            {(voyage.date_depart || voyage.date_arrivee) && (
              <p className="card-dates">
                <span className="card-date">{voyage.date_depart ?? ""}</span>
                {voyage.date_depart && voyage.date_arrivee && " → "}
                <span className="card-date">{voyage.date_arrivee ?? ""}</span>
              </p>
            )}

            <p>
              {voyage.pays?.join(", ") || "Non renseigné"},{" "}
              {voyage.villes?.join(", ") || "Non renseigné"},{" "}
              {voyage.regions?.join(", ") || "Non renseigné"}
            </p>

            <p>
              <strong>Budget :</strong> {voyage.budget ?? "Non renseigné"} €
            </p>

            <p>
              <strong>Dépenses :</strong> {voyage.depenses ?? "0"} €
            </p>
          </div>

          {}
          {medias.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h2>Médias du voyage</h2>

              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginTop: 10,
                }}
              >
                {medias.map((media) => (
                  <div key={media.id} style={{ textAlign: "center" }}>
                    <img
                      src={media.url}
                      alt={media.nom}
                      title={media.nom}
                      onClick={() => setSelectedMedia(media)}
                      style={{
                        width: 160,
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                    />

                    <a
                      href={media.url}
                      download={media.nom}
                      className="cta"
                      style={{ marginTop: 6, display: "inline-block" }}
                    >
                      Télécharger
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          <div className="steps-section">
            <h2>Étapes</h2>

            {etapes.length === 0 && <p>Aucune étape enregistrée.</p>}

            <ul className="content card-travel-preview">
              {etapes.map((etape) => (
                <li className="content card-travel-preview-content" key={etape.id}>
                  <strong>{etape.label}</strong>
                  {etape.pays && <span> – {etape.pays}</span>}

                  <footer className="card-footer">
                    <button
                      className="cta"
                      onClick={() =>
                        navigate(`/voyages/${voyage.id}/etapes/${etape.id}`)
                      }
                    >
                      Voir
                    </button>

                    <button
                      className="cta"
                      onClick={() =>
                        navigate(`/voyages/${voyage.id}/etapes/${etape.id}/edit`)
                      }
                    >
                      Modifier
                    </button>
                  </footer>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {}
      {selectedMedia && (
        <div
          onClick={() => setSelectedMedia(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <img
            src={selectedMedia.url}
            alt={selectedMedia.nom}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: 12,
            }}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default InfoVoyagePage;
