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

  useEffect(() => {
    if (!id) return;

    async function loadVoyage() {
      const { data, error } = await supabase
        .from("Voyages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Erreur chargement du voyage :", error);
      } else if (data) {
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
    }

    loadVoyage();
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
      const { error } = await supabase.from("Voyages").insert({
        ...form,
        user_id: user.id,
      });

      if (error) {
        console.error("Erreur création :", error);
      } else {
        navigate("/voyages");
      }
    }

    if (mode === "update") {
      const { error } = await supabase
        .from("Voyages")
        .update(form)
        .eq("id", id);

      if (error) {
        console.error("Erreur update :", error);
      } else {
        navigate("/voyages");
      }
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
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default FormVoyagePage;
