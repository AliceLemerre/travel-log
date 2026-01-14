import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import './FormVoyages.css'

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
  adresse?: string | null;
  pays?: string | null;
  region?: string | null;
  notes?: string | null;
  depenses?: number | null;
}

interface Tag {
  id: number;
  titre: string;
}

interface Media {
  id: number;
  nom: string;
  url: string;
  isMain: boolean | null;
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
  const [errors, setErrors] = useState<{ label?: string }>({});

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);

  const [medias, setMedias] = useState<Media[]>([]);
  const [selectedMainMedia, setSelectedMainMedia] = useState<number | null>(null);

  async function loadEtapes(search = "") {
    if (!id) return;

    let query = supabase.from("Etapes").select("*").eq("voyage_id", Number(id));
    if (search) query = query.ilike("label", `%${search}%`);

    const { data } = await query;
    setEtapes(data || []);
  }

  async function loadTags() {
    const { data } = await supabase.from("Tags").select("id, titre");
    setAllTags(data || []);
  }

  async function loadVoyageTags() {
    if (!id) return;

    const { data } = await supabase
      .from("Tags_voyage")
      .select("tag_id")
      .eq("voyage_id", Number(id));

    setSelectedTags(data?.map((t) => t.tag_id) || []);
  }

  async function loadMedias() {
    if (!id) return;

    const { data } = await supabase
      .from("Medias")
      .select("*")
      .eq("voyage_id", Number(id));

    setMedias(data || []);
    const mainMedia = data?.find((m) => m.isMain)?.id || null;
    setSelectedMainMedia(mainMedia);
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
      await loadTags();
      await loadVoyageTags();
      await loadMedias();
    }

    loadAll();
  }, [id]);

  useEffect(() => {
    loadEtapes(searchEtape);
  }, [searchEtape]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    if (["regions", "pays", "villes"].includes(name)) {
      setForm((f) => ({ ...f, [name]: value.split(",").map((v) => v.trim()) }));
    } else if (["budget", "depenses"].includes(name)) {
      setForm((f) => ({ ...f, [name]: value ? Number(value) : null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function toggleTag(tagId: number) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  function validateForm() {
    const newErrors: { label?: string } = {};
    if (!form.label.trim()) newErrors.label = "Le nom du voyage est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (mode === "add") {
      const { data, error } = await supabase
        .from("Voyages")
        .insert({ ...form, user_id: user.id })
        .select()
        .single();

      if (!error && data) navigate(`/voyages/${data.id}/edit`);
    }

    if (mode === "update") {
      const { error } = await supabase
        .from("Voyages")
        .update(form)
        .eq("id", Number(id));

      if (error) return;

      await supabase.from("Tags_voyage").delete().eq("voyage_id", Number(id));

      if (selectedTags.length > 0) {
        await supabase.from("Tags_voyage").insert(
          selectedTags.map((tagId) => ({ tag_id: tagId, voyage_id: Number(id) }))
        );
      }

      if (selectedMainMedia !== null) {

        await supabase.from("Medias").update({ isMain: false }).eq("voyage_id", Number(id));

        await supabase.from("Medias").update({ isMain: true }).eq("id", selectedMainMedia);
      }

      navigate(`/voyages/${id}/edit`);
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
          <h3>{mode === "add" ? "Créer un voyage" : "Modifier un voyage"}</h3>

          <form className="card-travel-create" onSubmit={handleSubmit}>
            <label className="label-column">
              Nom du voyage
              <input type="text" name="label" value={form.label} onChange={handleChange} required />
              {errors.label && <p className="error">{errors.label}</p>}
            </label>

            <label className="label-column">
              Régions
              <input type="text" name="regions" value={form.regions?.join(", ") || ""} onChange={handleChange} />
            </label>

            <label className="label-column">
              Pays
              <input type="text" name="pays" value={form.pays?.join(", ") || ""} onChange={handleChange} />
            </label>

            <label className="label-column">
              Villes
              <input type="text" name="villes" value={form.villes?.join(", ") || ""} onChange={handleChange} />
            </label>

            <label className="label-column">
              Date de départ
              <input type="date" name="date_depart" value={form.date_depart || ""} onChange={handleChange} />
            </label>

            <label className="label-column">
              Date d'arrivée
              <input type="date" name="date_arrivee" value={form.date_arrivee || ""} onChange={handleChange} />
            </label>

            <label className="label-column">
              Budget
              <input type="number" name="budget" value={form.budget ?? ""} onChange={handleChange} />
            </label>

            <label className="label-column">
              Dépenses
              <input type="number" name="depenses" value={form.depenses ?? ""} onChange={handleChange} />
            </label>

            {mode === "update" && (
              <>

                <div className="tags-section">  
                  <h4>Tags</h4>
                
                  {allTags.map((tag) => (
                    <label key={tag.id} className="tags-section-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                      />{" "}
                      {tag.titre}
                    </label>
                  ))}
                </div>

                <h4>Médias du voyage</h4>
                <div className="medias-section">
                  {medias.map((media) => (
                    <div key={media.id}>
                      <img
                        src={media.url}
                        alt={media.nom}
                        title={media.nom}
                        style={{
                          border: media.id === selectedMainMedia ? "0.5px solid black" : "1px solid #ccc",
                        }}
                        onClick={() => setSelectedMainMedia(media.id)}
                      />
                      {/* <p>{media.nom}</p> */}
                    </div>
                  ))}
                </div>
              </>
            )}
            <div className="end-button">
             <button className="cta" type="submit">{mode === "add" ? "Créer" : "Mettre à jour"}</button>
            </div>
          </form>

          {id && (
            <>
              <h4>Étapes</h4>

              <div className="steps-section">
              <input
                type="text"
                placeholder="Rechercher une étape"
                value={searchEtape}
                onChange={(e) => setSearchEtape(e.target.value)}
              />

              <button className="cta" onClick={() => navigate(`/voyages/${id}/etapes/new`)}>
                Ajouter une étape
                {/* <img className="cta-icon" src="./src/assets/images/add.svg" alt="" /> */}
              </button>
              </div>

              <ul className="content card-travel-preview">
                {etapes.map((etape) => (
                  <li className="content card-travel-preview-content" key={etape.id}>
                    <strong>{etape.label}</strong>

                    <footer className="card-footer">
                      <button className="cta" onClick={() => navigate(`/voyages/${id}/etapes/${etape.id}`)}>
                        Détails
                      </button>
                      <button className="cta" onClick={() => navigate(`/voyages/${id}/etapes/${etape.id}/edit`)}>
                        Modifier
                      </button>
                      <button className="cta cta-danger" onClick={() => deleteEtape(etape.id)}>
                        Supprimer
                        {/* <img className="cta-icon" src="./src/assets/images/close.svg" alt="" /> */}
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
