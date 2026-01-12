import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient"; 
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import './ListVoyages.css';

interface Voyage {
  id: number;
  label: string;
  regions: string[] | null;
  pays: string[] | null;
  villes: string[] | null;
  date_depart: string | null;
  date_arrivee: string | null;
  budget: number | null;
  depenses: number | null;
}

interface Tag {
  id: number;
  titre: string;
}

interface Media {
  id: number;
  url: string;
  isMain: boolean | null;
  nom: string;
}

function ListVoyagePage() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [tagsMap, setTagsMap] = useState<Record<number, Tag[]>>({});
  const [mediasMap, setMediasMap] = useState<Record<number, Media | null>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStart, setFilterStart] = useState<string | null>(null);
  const [filterEnd, setFilterEnd] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState("");
  const [filterPays, setFilterPays] = useState("");
  const [filterVille, setFilterVille] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const navigate = useNavigate();

  async function loadVoyages() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    let query = supabase.from("Voyages").select("*").eq("user_id", user.id);

    // Match only rows where `column` matches `pattern` case-insensitively.
    if (search.trim()) query = query.ilike("label", `%${search}%`);
    // Match only rows where `column` is greater than or equal to `value`.
    if (filterStart) query = query.gte("date_depart", filterStart);
    // Match only rows where `column` is less than or equal to `value`.
    if (filterEnd) query = query.lte("date_arrivee", filterEnd);
    if (filterRegion) query = query.contains("regions", [filterRegion]);
    if (filterPays) query = query.contains("pays", [filterPays]);
    if (filterVille) query = query.contains("villes", [filterVille]);

    query = query.order("label", { ascending: sortAsc });

    const { data, error } = await query;

    if (error) console.error("Erreur", error);
    else setVoyages(data || []);

    if (data && data.length > 0) {
      const voyageIds = data.map(v => v.id);
      const { data: tagsData } = await supabase
        .from("Tags_voyage")
        .select("voyage_id, Tags(id, titre)")
        .in("voyage_id", voyageIds);

      const map: Record<number, Tag[]> = {};
      tagsData?.forEach((t: any) => {
        if (!map[t.voyage_id]) map[t.voyage_id] = [];
        if (t.Tags) map[t.voyage_id].push(t.Tags);
      });
      setTagsMap(map);

      const { data: mediasData } = await supabase
        .from("Medias")
        .select("*")
        .in("voyage_id", voyageIds)
        .eq("isMain", true);

      const mediaMap: Record<number, Media | null> = {};
      voyageIds.forEach((id) => {
        mediaMap[id] = mediasData?.find((m: any) => m.voyage_id === id) || null;
      });
      setMediasMap(mediaMap);

    } else {
      setTagsMap({});
      setMediasMap({});
    }

    setLoading(false);
  }

  // est appelé à chaque fois qu'une dépendance change -> la liste en dessous
  useEffect(() => {
    loadVoyages();
  }, [search, filterStart, filterEnd, filterRegion, filterPays, filterVille, sortAsc]);

  async function deleteVoyage(id: number) {
    const confirmDelete = window.confirm(
      "Voulez-vous vraiment supprimer ce voyage ?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("Voyages").delete().eq("id", id);
    if (error) console.error("Erreur suppression :", error);
    else loadVoyages();
  }

  const resetFilters = () => {
    setSearch("");
    setFilterStart(null);
    setFilterEnd(null);
    setFilterRegion("");
    setFilterPays("");
    setFilterVille("");
    setSortAsc(true);
  };

  return (
    <div className="list-voyages-page">
      <Header />
      <main>
        <div className="content card card-travel">

          <header className="card-header card-travel-header">
            <h3>Mes voyages</h3>

            <button className="cta cta-round" title="ajouter un voyage" onClick={() => navigate("/voyages/new")}>
            <img className="cta-icon" src="./src/assets/images/add.svg" alt="" />
            </button>
          </header>


          <section className="filters-section" >
              <p>Filtrer les résultats</p>
              <input className="checkbox arrow" type="checkbox" />
              <br />
          <div className="filters">

            <label className="label-column">
              Recherche par titre
              <input
                type="text"
                placeholder="titre du voyage"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <label className="label-column">
              Date de début
                <input
                  type="date"
                  value={filterStart || ""}
                  onChange={(e) => setFilterStart(e.target.value || null)}
                />
            </label>

            <label className="label-column">
              Date de fin
              <input
                type="date"
                value={filterEnd || ""}
                onChange={(e) => setFilterEnd(e.target.value || null)}
              />
            </label>

            <label className="label-column">
              Filtrer par région
              <input
                type="text"
                placeholder="région"
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
              />
            </label>

            <label className="label-column">
              Filtrer par pays
              <input
                type="text"
                placeholder="pays"
                value={filterPays}
                onChange={(e) => setFilterPays(e.target.value)}
              />
            </label>

            <label className="label-column">
              Filtrer par ville
              <input
                type="text"
                placeholder="ville"
                value={filterVille}
                onChange={(e) => setFilterVille(e.target.value)}
              />
            </label>


            <button className="filter-cta" onClick={() => setSortAsc((v) => !v)}>
              Trier par label {sortAsc ? "↑" : "↓"}
            </button>

            <button className="filter-cta" onClick={resetFilters} style={{ marginLeft: "8px" }}>
              Réinitialiser les filtres
            </button>
          </div>
          </section>


          {/* Equivalent du if */}
          {loading && <p>Chargement...</p>}
          {!loading && voyages.length === 0 && <p>Aucun voyage trouvé.</p>}

          <ul className="content card-travel-preview">
            {voyages.map((voyage) => (
              <li key={voyage.id} className="card-travel-preview-content">

                {/* affichage de l'image principale */}
                {mediasMap[voyage.id] && mediasMap[voyage.id]?.url && (
                  <div>
                    <img
                      src={mediasMap[voyage.id]?.url}
                      alt={mediasMap[voyage.id]?.nom}
                    />
                  </div>
                )}

                <h4>{voyage.label}</h4>
                {(voyage.date_depart || voyage.date_arrivee) && (
                  <span>
                    {voyage.date_depart ?? ""} {voyage.date_depart && voyage.date_arrivee ? "→" : ""} {voyage.date_arrivee ?? ""}
                  </span>
                )}
                <br /><br />

                {/* affichage des tags */}
                {tagsMap[voyage.id] && tagsMap[voyage.id].length > 0 && (
                  <div>
                    {tagsMap[voyage.id].map(tag => (
                      <span key={tag.id} style={{ padding: "2px 8px", background: "#eee", borderRadius: 12, fontSize: 12 }}>
                        {tag.titre}
                      </span>
                    ))}
                  </div>
                )}

                <footer className="card-footer">

                  <button
                    className="cta"
                    onClick={() => navigate(`/voyages/${voyage.id}`)}
                  >
                    Détails
                  </button>
                  <button 
                    className="cta"
                    onClick={() => navigate(`/voyages/${voyage.id}/edit`)}
                  >
                    Modifier
                  </button>

                  <button
                    className="cta cta-danger"
                    onClick={() => deleteVoyage(voyage.id)}
                  >
                    Supprimer
                  </button>
                </footer>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ListVoyagePage;
