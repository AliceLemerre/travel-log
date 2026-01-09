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
}

interface Tag {
  id: number;
  titre: string;
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
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  function validateForm() {
    const newErrors: { label?: string } = {};
    if (!form.label.trim()) newErrors.label = "Nom obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

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
          selectedTags.map((tagId) => ({
            tag_id: tagId,
            voyage_id: Number(id),
          }))
        );
      }

      navigate(`/voyages/${id}/edit`);
    }
  }

  return (
    <div className="form-voyages-page">
      <Header />

      <main>
        <div className="content card card-travel card-form">
          <h3>{mode === "add" ? "Créer un voyage" : "Modifier un voyage"}</h3>

          <form onSubmit={handleSubmit}>
            <label>
              Nom *
              <input name="label" value={form.label} onChange={handleChange} />
              {errors.label && <p className="error">{errors.label}</p>}
            </label>

            <label>
              Régions
              <input
                name="regions"
                value={form.regions?.join(", ") || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Pays
              <input
                name="pays"
                value={form.pays?.join(", ") || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Villes
              <input
                name="villes"
                value={form.villes?.join(", ") || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Date départ
              <input
                type="date"
                name="date_depart"
                value={form.date_depart || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Date arrivée
              <input
                type="date"
                name="date_arrivee"
                value={form.date_arrivee || ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Budget
              <input
                type="number"
                name="budget"
                value={form.budget ?? ""}
                onChange={handleChange}
              />
            </label>

            <label>
              Dépenses
              <input
                type="number"
                name="depenses"
                value={form.depenses ?? ""}
                onChange={handleChange}
              />
            </label>

            {mode === "update" && (
              <>
                <h4>Tags</h4>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {allTags.map((tag) => (
                    <label key={tag.id}>
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => toggleTag(tag.id)}
                      />{" "}
                      {tag.titre}
                    </label>
                  ))}
                </div>
              </>
            )}

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

export default FormVoyagePage;

