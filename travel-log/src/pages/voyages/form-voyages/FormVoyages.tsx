import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";

interface Voyage {
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

function FormVoyagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mode = id ? "update" : "add";

  const [form, setForm] = useState<Voyage>({
    label: "",
    regions: null,
    pays: null,
    villes: null,
    date_depart: null,
    date_arrivee: null,
    budget: null,
    depenses: null,
  });

  const [etapes, setEtapes] = useState<Etape[]>([]);

  async function loadEtapes() {
    const { data } = await supabase
      .from("Etapes")
      .select("*")
      .eq("voyage_id", id);

    setEtapes(data || []);
  }

  useEffect(() => {
    if (!id) return;

    async function loadAll() {
      const { data } = await supabase
        .from("Voyages")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setForm({
          label: data.label,
          regions: data.regions,
          pays: data.pays,
          villes: data.villes,
          date_depart: data.date_depart,
          date_arrivee: data.date_arrivee,
          budget: data.budget,
          depenses: data.depenses,
        });
      }

      const { data: etapesData } = await supabase
        .from("Etapes")
        .select("*")
        .eq("voyage_id", Number(id));

      setEtapes(etapesData || []);
    }

    loadAll();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Vous devez être connecté.");
      return;
    }

    if (mode === "add") {
      const { data, error } = await supabase
        .from("Voyages")
        .insert({
          ...form,
          user_id: user.id,
        })
        .select()
        .single();

      if (!error && data) {
        navigate(`/voyages/${data.id}/edit`);
      }
    }

    if (mode === "update") {
      const { error } = await supabase
        .from("Voyages")
        .update(form)
        .eq("id", id);

      if (!error) {
        navigate(`/voyages/${id}/edit`);
      }
    }
  }

  async function deleteEtape(etapeId: number) {
    const confirmDelete = window.confirm("Supprimer cette étape ?");
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("Etapes")
      .delete()
      .eq("id", etapeId);

    if (!error) {
      loadEtapes();
    }
  }

  return (
    <div className="form-voyages-page">
      <Header />

      <main>
        <div className="content card card-travel card-form">
          <h2>
            {mode === "add" ? "Créer un voyage" : "Modifier un voyage"}
          </h2>

          <form onSubmit={handleSubmit}>
            <label>
              Nom du voyage
              <input
                type="text"
                name="label"
                value={form.label}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Date de départ
              <input
                type="date"
                name="date_depart"
                value={form.date_depart || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Date d'arrivée
              <input
                type="date"
                name="date_arrivee"
                value={form.date_arrivee || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Budget (€)
              <input
                type="number"
                name="budget"
                value={form.budget ?? ""}
                onChange={handleChange}
              />
            </label>

            <button className="cta" type="submit">
              {mode === "add" ? "Créer" : "Mettre à jour"}
            </button>
          </form>

          {id && (
            <>
              <h2>Étapes</h2>

              <button className="cta" onClick={() => navigate(`/voyages/${id}/etapes/new`)}>
                Ajouter une étape
              </button>

              <ul className="content card-travel-preview">
                {etapes.map((etape) => (
                  <li className="content card-travel-preview-content" key={etape.id}>
                    <strong>{etape.label}</strong>

                  <footer className="card-footer">
                    <button
                      onClick={() =>
                        navigate(
                          `/voyages/${id}/etapes/${etape.id}`
                        )
                      }
                    >
                      Détails
                    </button>
                    <button
                      className="cta"
                      onClick={() =>
                        navigate(
                          `/voyages/${id}/etapes/${etape.id}/edit`
                        )
                      }
                    >
                      Modifier
                    </button>
                    <button className="cta" onClick={() => deleteEtape(etape.id)}>
                      Supprimer
                    </button>
                  </footer>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FormVoyagePage;
