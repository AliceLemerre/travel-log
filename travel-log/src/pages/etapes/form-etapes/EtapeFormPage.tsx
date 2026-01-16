import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import './EtapeFormPage.css';
import {
  addMedia,
  getMediasByEtape,
  deleteMedia,
} from "../../../services/mediaService";
import { fileToBase64 } from "../../../services/fileToBase64";

interface Etape {
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

  const [errors, setErrors] = useState<{ label?: string }>({});
  const [medias, setMedias] = useState<Media[]>([]);
  const [uploading, setUploading] = useState(false);

  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

  // éxécute code après rendu du composant Reacy
  useEffect(() => {
    if (!etapeId) return;

    loadEtape();
    loadMedias();
    loadTags();
    loadEtapeTags();
  }, [etapeId]);

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

  async function loadMedias() {
    if (!etapeId) return;
    const { data } = await getMediasByEtape(Number(etapeId));
    setMedias(data || []);
  }

  async function loadTags() {
    const { data } = await supabase
      .from("Tags")
      .select("*")
      .order("titre", { ascending: true });

    setAllTags(data || []);
  }

  async function loadEtapeTags() {
    if (!etapeId) return;

    const { data } = await supabase
      .from("Tags_etapes")
      .select("tag_id")
      .eq("etape_id", etapeId);

    setSelectedTagIds(data?.map((t) => t.tag_id) || []);
  }

  function validateForm() {
    const newErrors: { label?: string } = {};
    if (!form.label.trim()) {
      newErrors.label = "Le nom de l’étape est obligatoire";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleChange(
    // attribut name de l’input et valeur saisie par l’utilisateur
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    // ...f Copie toutes les propriétés existantes du formulaire
    // name clé dynamique, met à jour uniquement le champ correspondant
    setForm((f) => ({ ...f, [name]: value }));
  }

  function toggleTag(tagId: number) {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;

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
      await supabase.from("Etapes").update(form).eq("id", etapeId);

      await supabase.from("Tags_etapes").delete().eq("etape_id", etapeId);

      if (selectedTagIds.length > 0) {
        const rows = selectedTagIds.map((tagId) => ({
          tag_id: tagId,
          etape_id: Number(etapeId),
        }));

        await supabase.from("Tags_etapes").insert(rows);
      }

      navigate(`/voyages/${voyageId}/edit`);
    }
  }

  async function handleUploadMedia(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    if (!e.target.files || !e.target.files[0] || !etapeId) return;

    const file = e.target.files[0];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    const base64 = await fileToBase64(file);

    await addMedia({
      nom: file.name,
      url: base64,
      voyage_id: Number(voyageId),
      etape_id: Number(etapeId),
      user_id: user.id,
    });

    setUploading(false);
    loadMedias();
  }

  async function handleDeleteMedia(mediaId: number) {
    if (!window.confirm("Supprimer ce média ?")) return;
    await deleteMedia(mediaId);
    loadMedias();
  }

  return (
    <div className="etape-form-page form-voyages-page">
      <Header />

      <main>
        <div className="content card card-travel card-form">
          <header className="card-header">

          <h3>{mode === "add" ? "Ajouter une étape" : "Modifier une étape"}</h3>

          <button className="cta cta-round" onClick={() => navigate(`/voyages/${voyageId}/edit`)}>
             ←
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
              {errors.label && <p className="error">{errors.label}</p>}
            </label>

            <label className="label-column">Adresse
              <input type="text" name="adresse" value={form.adresse || ""} onChange={handleChange} />
            </label>

            <label className="label-column">Pays
              <input type="text" name="pays" value={form.pays || ""} onChange={handleChange} />
            </label>

            <label className="label-column">Région
              <input type="text" name="region" value={form.region || ""} onChange={handleChange} />
            </label>

            <label className="label-column">Notes
              <textarea name="notes" value={form.notes || ""} onChange={handleChange} />
            </label>

            <label className="label-column">Dépenses (€)
              <input type="number" name="depenses" value={form.depenses ?? ""} onChange={handleChange} />
            </label>

           
            {}
           

            <div className="tags-section">
               <h4>Tags</h4>

            {allTags.length === 0 && <p>Aucun tag existant.</p>}
              {allTags.map((tag) => (
                <label key={tag.id} className="tags-section-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTagIds.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                  {tag.titre}
                </label>
              ))}
            </div>

            <button className="cta" type="submit">
               {mode === "add" ? "Créer" : "Mettre à jour"}
            </button>
          </form>

          {}
          <h4>Médias</h4>

          <input type="file" accept="image/*" onChange={handleUploadMedia} />
          {uploading && <p>Upload en cours...</p>}

          <div className="medias-section">
            {medias.map((media) => (
              <div key={media.id}>
                <img
                  src={media.url}
                  alt={media.nom}
                  style={{ width: 120, height: 120, objectFit: "cover" }}
                />
                <br />
                <button className="cta cta-danger" onClick={() => handleDeleteMedia(media.id)}>
                  Supprimer
                </button>
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EtapeFormPage;