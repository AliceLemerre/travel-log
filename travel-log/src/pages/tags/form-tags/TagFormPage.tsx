import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import './TagFormPage.css';

function TagFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const mode = id ? "update" : "add";

  const [titre, setTitre] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function loadTag() {
      const { data } = await supabase
        .from("Tags")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitre(data.titre);
      }
    }

    loadTag();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!titre.trim()) {
      setError("Le titre est obligatoire");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (mode === "add") {
      await supabase.from("Tags").insert({
        titre,
        user_id: user.id,
      });
    }

    if (mode === "update") {
      await supabase
        .from("Tags")
        .update({ titre })
        .eq("id", id);
    }

    navigate("/tags");
  }

  return (
    <div className="tag-form-page">
      <Header />

      <main>
        <div className="content card card-travel">
          <div className="card-header">
            <h3>{mode === "add" ? "Ajouter un tag" : "Modifier le tag"}</h3>

            <button
              className="cta cta-round"
              onClick={() => navigate("/tags")}
            >
              ←
            </button>
          </div>

          <form onSubmit={handleSubmit} className="card-travel-create tag-create">
            <label className="label-column">
              Titre
              <input
                type="text"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
              />
            </label>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <button className="cta" type="submit">
              {mode === "add" ? "Créer" : "Mettre à jour"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default TagFormPage;
