import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import './EtapeFormPage.css';

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

  // éxécute code après rendu du composant Reacy
  useEffect(() => {
    if (!etapeId) return;

    async function loadEtape() {
      const { data } = await supabase
        .from("Etapes")
        .select("*")
        .eq("id", etapeId)
        .single();

      // single retourne les valeurs dans un seul objet au lieu d'un array

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
    // attribut name de l’input et valeur saisie par l’utilisateur
    const { name, value } = e.target;
    // ...f Copie toutes les propriétés existantes du formulaire
    // name clé dynamique, met à jour uniquement le champ correspondant
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
    <div className="etape-form-page form-voyages-page">
      <Header />

      <main>
        <div className="content card card-travel card-form">
        <header className="card-header">

          <h3>{mode === "add" ? "Ajouter une étape" : "Modifier une étape"}</h3>

          <button onClick={() => navigate(`/voyages/${voyageId}/edit`)}>
            Retour au voyage
          </button>
        </header>


          <form onSubmit={handleSubmit}>
            <label className="label-column">
              Nom de l'étape
              <input
                type="text"
                name="label"
                value={form.label}
                onChange={handleChange}
                required
              />
            </label>

            <label className="label-column">
              Adresse
              <input
                type="text"
                name="adresse"
                value={form.adresse || ""}
                onChange={handleChange}
              />
            </label>

            <label className="label-column">
              Pays
              <input
                type="text"
                name="pays"
                value={form.pays || ""}
                onChange={handleChange}
              />
            </label>

            <label className="label-column">
              Région
              <input
                type="text"
                name="region"
                value={form.region || ""}
                onChange={handleChange}
              />
            </label>

            <label className="label-column">
              Notes
              <textarea
                name="notes"
                value={form.notes || ""}
                onChange={handleChange}
              />
            </label>

            <label className="label-column">
              Dépenses (€)
              <input
                type="number"
                name="depenses"
                value={form.depenses ?? ""}
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

export default EtapeFormPage;

