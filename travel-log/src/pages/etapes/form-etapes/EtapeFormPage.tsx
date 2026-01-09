import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
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
          <h1>Modifier une étape</h1>

          <button
            className="cta cta-icon"
            onClick={() => navigate(`/voyages/${voyageId}/edit`)}
          >
            ←
          </button>

          <form onSubmit={handleSubmit}>
            <label>
              Nom de l'étape *
              <input
                type="text"
                name="label"
                value={form.label}
                onChange={handleChange}
              />
              {errors.label && <p className="error">{errors.label}</p>}
            </label>

            <label>Adresse
              <input name="adresse" value={form.adresse || ""} onChange={handleChange} />
            </label>

            <label>Pays
              <input name="pays" value={form.pays || ""} onChange={handleChange} />
            </label>

            <label>Région
              <input name="region" value={form.region || ""} onChange={handleChange} />
            </label>

            <label>Notes
              <textarea name="notes" value={form.notes || ""} onChange={handleChange} />
            </label>

            <label>Dépenses (€)
              <input type="number" name="depenses" value={form.depenses ?? ""} onChange={handleChange} />
            </label>

            {}
            <h2>Tags</h2>

            {allTags.length === 0 && <p>Aucun tag existant.</p>}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {allTags.map((tag) => (
                <label key={tag.id} style={{ display: "flex", gap: 6 }}>
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
              Mettre à jour
            </button>
          </form>

          {}
          <h2>Médias</h2>

          <input type="file" accept="image/*" onChange={handleUploadMedia} />
          {uploading && <p>Upload en cours...</p>}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {medias.map((media) => (
              <div key={media.id}>
                <img
                  src={media.url}
                  alt={media.nom}
                  style={{ width: 120, height: 120, objectFit: "cover" }}
                />
                <br />
                <button onClick={() => handleDeleteMedia(media.id)}>
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

