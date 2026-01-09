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
    loadMedias();
  }, [etapeId]);

  async function loadMedias() {
    if (!etapeId) return;
    const { data } = await getMediasByEtape(Number(etapeId));
    setMedias(data || []);
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

      if (!error) navigate(`/voyages/${voyageId}/edit`);
    }

    if (mode === "update") {
      const { error } = await supabase
        .from("Etapes")
        .update(form)
        .eq("id", etapeId);

      if (!error) navigate(`/voyages/${voyageId}/edit`);
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
    const confirmDelete = window.confirm("Supprimer ce média ?");
    if (!confirmDelete) return;

    await deleteMedia(mediaId);
    loadMedias();
  }

  return (
    <div className="etape-form-page form-voyages-page">
      <Header />

      <main>
        <div className="content card card-travel card-form">
          <h1>{mode === "add" ? "Ajouter une étape" : "Modifier une étape"}</h1>

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

            <button className="cta" type="submit">
              {mode === "add" ? "Créer" : "Mettre à jour"}
            </button>
          </form>

          {}
          {etapeId && (
            <>
              <h2>Médias</h2>

              <input
                type="file"
                accept="image/*"
                onChange={handleUploadMedia}
                disabled={uploading}
              />

              {uploading && <p>Upload en cours...</p>}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {medias.map((media) => (
                  <div key={media.id}>
                    <img
                      src={media.url}
                      alt={media.nom}
                      style={{
                        width: 120,
                        height: 120,
                        objectFit: "cover",
                      }}
                    />
                    <br />
                    <button onClick={() => handleDeleteMedia(media.id)}>
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default EtapeFormPage;
