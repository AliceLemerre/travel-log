import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import './TagListPage.css';

interface Tag {
  id: number;
  titre: string;
}

function TagListPage() {
  const navigate = useNavigate();

  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  async function loadTags() {
    setLoading(true);

    let query = supabase
      .from("Tags")
      .select("*")
      .order("titre", { ascending: true });

    if (search) {
      query = query.ilike("titre", `%${search}%`);
    }

    const { data } = await query;
    setTags(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadTags();
  }, [search]);

  async function confirmDelete() {
    if (!tagToDelete) return;

    await supabase.from("Tags").delete().eq("id", tagToDelete.id);
    setTagToDelete(null);
    loadTags();
  }

  return (
    <div className="tags-page">
      <Header />

      <main>
        <div className="content card card-travel">
          <header>
            <h3>Tags</h3>
            <button className="cta cta-round" onClick={() => navigate("/tags/new")}>
              +
            </button>
          </header>

          <input
            type="text"
            placeholder="Rechercher un tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {loading && <p>Chargement...</p>}
          {!loading && tags.length === 0 && <p>Aucun tag trouvé.</p>}

          <ul>
            {tags.map((tag) => (
              <li
                key={tag.id}
              >
                <strong>{tag.titre}</strong>

                <div>
                  <button
                    className="cta"
                    onClick={() => navigate(`/tags/${tag.id}/edit`)}
                  >
                    Modifier
                  </button>

                  <button
                    className="cta cta-danger"
                    onClick={() => setTagToDelete(tag)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>

      {tagToDelete && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div className="content card">
            <p>
              Supprimer le tag <strong>{tagToDelete.titre}</strong> ?
            </p>

            <div style={{ marginTop: 16 }}>
              <button className="cta" onClick={confirmDelete}>
                Oui, supprimer
              </button>

              <button
                className="cta"
                style={{ marginLeft: 8 }}
                onClick={() => setTagToDelete(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default TagListPage;
