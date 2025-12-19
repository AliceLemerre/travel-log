import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient"; 
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";

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

function ListVoyagePage() {
  const [voyages, setVoyages] = useState<Voyage[]>([]);
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
        <div className="content">
          <h1>Mes voyages</h1>

          <button onClick={() => navigate("/voyages/new")}>
            Nouveau voyage
          </button>

          <div className="filters" style={{ margin: "1em 0" }}>
            <input
              type="text"
              placeholder="Recherche par nom"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <input
              type="date"
              placeholder="Date départ min"
              value={filterStart || ""}
              onChange={(e) => setFilterStart(e.target.value || null)}
            />
            <input
              type="date"
              placeholder="Date arrivée max"
              value={filterEnd || ""}
              onChange={(e) => setFilterEnd(e.target.value || null)}
            />

            <input
              type="text"
              placeholder="Filtrer par région"
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filtrer par pays"
              value={filterPays}
              onChange={(e) => setFilterPays(e.target.value)}
            />
            <input
              type="text"
              placeholder="Filtrer par ville"
              value={filterVille}
              onChange={(e) => setFilterVille(e.target.value)}
            />

            <button onClick={() => setSortAsc((v) => !v)}>
              Trier par label {sortAsc ? "↑" : "↓"}
            </button>

            <button onClick={resetFilters} style={{ marginLeft: "8px" }}>
              Réinitialiser les filtres
            </button>
          </div>

          {/* Equivalent du if */}
          {loading && <p>Chargement...</p>}
          {!loading && voyages.length === 0 && <p>Aucun voyage trouvé.</p>}

          <ul>
            {voyages.map((voyage) => (
              <li key={voyage.id}>
                <strong>{voyage.label}</strong>
                <br />
                {(voyage.date_depart || voyage.date_arrivee) && (
                  <span>
                    {voyage.date_depart ?? ""} {voyage.date_depart && voyage.date_arrivee ? "→" : ""} {voyage.date_arrivee ?? ""}
                  </span>
                )}
                <br /><br />

                <button onClick={() => navigate(`/voyages/${voyage.id}`)}>
                  Détails
                </button>
                <button onClick={() => navigate(`/voyages/${voyage.id}/edit`)}>
                  Modifier
                </button>
                <button onClick={() => deleteVoyage(voyage.id)}>Supprimer</button>
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
