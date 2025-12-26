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
  const [searchEtape, setSearchEtape] = useState("");

  async function loadEtapes(search = "") {
    if (!id) return;

    let query = supabase
      .from("Etapes")
      .select("*")
      .eq("voyage_id", Number(id));

    if (search) {
      query = query.ilike("label", `%${search}%`);
    }

    const { data } = await query;
    setEtapes(data || []);
  }

  useEffect(() => {
    if (!id) return;

    async function loadAll() {
      const { data } = await supabase
        .from("Voyages")
        .select("*")
        .eq("id", Number(id))
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

      await loadEtapes();
    }

    loadAll();
  }, [id]);

  useEffect(() => {
    loadEtapes(searchEtape);
  }, [searchEtape]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;

    if (["regions", "pays", "villes"].includes(name)) {
      const arr = value.split(",").map((s) => s.trim());
      setForm((f) => ({ ...f, [name]: arr }));
    } else if (["budget", "depenses"].includes(name)) {
      setForm((f) => ({ ...f, [name]: value ? Number(value) : null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (mode === "add") {
      const { error } = await supabase.from("Voyages").insert({
        ...form,
        user_id: user.id,
      });

      if (!error) navigate("/voyages");
    } else {
      const { error } = await supabase
        .from("Voyages")
        .update(form)
        .eq("id", Number(id));

      if (!error) navigate(`/voyages/${id}/edit`);
    }
  }

  async function deleteEtape(etapeId: number) {
    const confirmDelete = window.confirm("Supprimer cette étape ?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("Etapes").delete().eq("id", etapeId);
    if (!error) loadEtapes(searchEtape);
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
              <input type="text" name="label" value={form.label} onChange={handleChange} required />
            </label>

            <label>
              Régions
              <input type="text" name="regions" value={form.regions?.join(", ") || ""} onChange={handleChange} />
            </label>

            <label>
              Pays
              <input type="text" name="pays" value={form.pays?.join(", ") || ""} onChange={handleChange} />
            </label>

            <label>
              Villes
              <input type="text" name="villes" value={form.villes?.join(", ") || ""} onChange={handleChange} />
            </label>

            <label>
              Date de départ
              <input type="date" name="date_depart" value={form.date_depart || ""} onChange={handleChange} />
            </label>

            <label>
              Date d'arrivée
              <input type="date" name="date_arrivee" value={form.date_arrivee || ""} onChange={handleChange} />
            </label>

            <label>
              Budget
              <input type="number" name="budget" value={form.budget ?? ""} onChange={handleChange} />
            </label>

            <button className="cta" type="submit">
              {mode === "add" ? "Créer" : "Mettre à jour"}
            </button>
            <label>
              Dépenses
              <input type="number" name="depenses" value={form.depenses ?? ""} onChange={handleChange} />
            </label>

            <button type="submit">{mode === "add" ? "Créer" : "Mettre à jour"}</button>
          </form>

          {id && (
            <>
              <h2>Étapes</h2>

              <input
                type="text"
                placeholder="Rechercher une étape"
                value={searchEtape}
                onChange={(e) => setSearchEtape(e.target.value)}
              />

              <button onClick={() => navigate(`/voyages/${id}/etapes/new`)}>
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
                    <br />
                    <button onClick={() => navigate(`/voyages/${id}/etapes/${etape.id}`)}>
                      Détails
                    </button>
                    <button onClick={() => navigate(`/voyages/${id}/etapes/${etape.id}/edit`)}>
                      Modifier
                    </button>
                    <button onClick={() => deleteEtape(etape.id)}>Supprimer</button>
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
