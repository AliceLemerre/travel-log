import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";

interface Etape {
  label: string;
  adresse: string | null;
  pays: string | null;
  region: string | null;
  notes: string | null;
  depenses: number | null;
}

function EtapeFormPage() {
  const { voyageId, etapeId } = useParams();
  const navigate = useNavigate();

  const mode = etapeId ? "update" : "add";

  const [form, setForm] = useState<Etape>({
    label: "",
    adresse: "",
    pays: "",
    region: "",
    notes: "",
    depenses: null,
  });

  useEffect(() => {
    if (!etapeId) return;

    async function loadEtape() {
      const { data } = await supabase
        .from("Etapes")
        .select("*")
        .eq("id", etapeId)
        .single();

      if (data) {
        setForm({
          label: data.label,
          adresse: data.adresse,
          pays: data.pays,
          region: data.region,
          notes: data.notes,
          depenses: data.depenses,
        });
      }
    }

    loadEtape();
  }, [etapeId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (mode === "add") {
      const { error } = await supabase.from("Etapes").insert({
        ...form,
        voyage_id: voyageId,
        user_id: user.id,
      });

      if (!error) {
        navigate(`/voyages/${voyageId}/edit`);
      }
    }

    if (mode === "update") {
      const { error } = await supabase
        .from("Etapes")
        .update(form)
        .eq("id", etapeId);

      if (!error) {
        navigate(`/voyages/${voyageId}/edit`);
      }
    }
  }

  return (
    <div className="etape-form-page">
      <Header />

      <main>
        <div className="content">
          <h1>{mode === "add" ? "Ajouter une étape" : "Modifier une étape"}</h1>

          <form onSubmit={handleSubmit}>
            <label>
              Nom de l'étape
              <input
                type="text"
                name="label"
                value={form.label}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Adresse
              <input
                type="text"
                name="adresse"
                value={form.adresse || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Pays
              <input
                type="text"
                name="pays"
                value={form.pays || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Région
              <input
                type="text"
                name="region"
                value={form.region || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Notes
              <textarea
                name="notes"
                value={form.notes || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Dépenses (€)
              <input
                type="number"
                name="depenses"
                value={form.depenses ?? ""}
                onChange={handleChange}
              />
            </label>

            <button type="submit">
              {mode === "add" ? "Créer" : "Mettre à jour"}
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EtapeFormPage;
