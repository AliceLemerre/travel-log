import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import './InfoEtapes.css';

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

interface Tag {
  id: number;
  titre: string;
}

function EtapeDetailPage() {
  const { voyageId, etapeId } = useParams();
  const navigate = useNavigate();

  const [etape, setEtape] = useState<Etape | null>(null);
  const [medias, setMedias] = useState<Media[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!etapeId || !voyageId) return;

    async function loadAll() {
      setLoading(true);

      const { data: etapeData } = await supabase
        .from("Etapes")
        .select("*")
        .eq("id", etapeId)
        .single();

      setEtape(etapeData || null);

      const { data: mediasData } = await supabase
        .from("Medias")
        .select("*")
        .eq("voyage_id", Number(voyageId))
        .eq("etape_id", Number(etapeId))
        .order("created_at", { ascending: true });

      setMedias(mediasData || []);

      const { data: tagsData } = await supabase
        .from("Tags_etapes")
        .select("Tags ( id, titre )")
        .eq("etape_id", Number(etapeId));

      setTags(
        tagsData?.map((row: any) => row.Tags).filter(Boolean) || []
      );

      setLoading(false);
    }

    loadAll();
  }, [etapeId, voyageId]);

  if (loading) {
    return (
      <>
        <Header />
        <main><p>Chargement...</p></main>
        <Footer />
      </>
    );
  }

  if (!etape) {
    return (
      <>
        <Header />
        <main>
          <p>Étape introuvable</p>
          <button
            className="cta cta-round"
            onClick={() => navigate(`/voyages/${voyageId}/edit`)}
          >
            ←
          </button>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <div className="etape-detail-page">
      <Header />

      <main>
        <div className="content card card-travel">
          <button
            className="cta cta-round"
            onClick={() => navigate(`/voyages/${voyageId}/edit`)}
          >
            ←
          </button>
          <h3>{etape.label}</h3>

          {etape.adresse && <p><strong>Adresse :</strong> {etape.adresse}</p>}
          {etape.pays && <p><strong>Pays :</strong> {etape.pays}</p>}
          {etape.region && <p><strong>Région :</strong> {etape.region}</p>}
          {etape.notes && <p><strong>Notes :</strong> {etape.notes}</p>}
          {etape.depenses !== null && (
            <p><strong>Dépenses :</strong> {etape.depenses} €</p>
          )}

          {tags.length > 0 && (
            <>
              <h2>Tags</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {tags.map((tag) => (
                  <span
                    key={tag.id}
                    style={{
                      padding: "4px 10px",
                      background: "#eee",
                      borderRadius: 12,
                      fontSize: 14,
                    }}
                  >
                    {tag.titre}
                  </span>
                ))}
              </div>
            </>
          )}

          {medias.length > 0 && (
            <>
              <h4>Médias</h4>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 10 }}>
                {medias.map((media) => (
                  <div key={media.id} style={{ textAlign: "center" }}>
                    <img
                      src={media.url}
                      alt={media.nom}
                      onClick={() => setSelectedMedia(media)}
                      style={{
                        width: 150,
                        height: 150,
                        objectFit: "cover",
                        cursor: "pointer",
                        borderRadius: 6,
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
            </>
          )}

          <div className="card-footer">
            <button
              className="cta"
              onClick={() =>
                navigate(`/voyages/${voyageId}/etapes/${etape.id}/edit`)
              }
            >
              Modifier
            </button>

            <button
              className="cta cta-danger"
              style={{ marginLeft: 8 }}
              onClick={() => navigate(`/voyages/${voyageId}/edit`)}
            >
              Retour au voyage
            </button>
          </div>
        </div>
      </main>

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
            style={{ maxWidth: "90%", maxHeight: "90%" }}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

export default EtapeDetailPage;
