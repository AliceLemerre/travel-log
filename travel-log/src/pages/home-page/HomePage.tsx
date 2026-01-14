import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient"; 
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import './HomePage.css'


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

interface Item {
  id: number;
  title: string;
  description: string;
  user_id: string;
}

function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
    const [voyages, setVoyages] = useState<Voyage[]>([]);
    const [tagsMap, setTagsMap] = useState<Record<number, Tag[]>>({});
    const [mediasMap, setMediasMap] = useState<Record<number, Media | null>>({});
    const [loading, setLoading] = useState(true);

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

  useEffect(() =>  {
    // fetchItems();
  }, []);
    


  return (
    <div className="home-page">
      <Header />
      <main>
        <div className="content">
          <section className="home-page-intro">
                <div className="home-page-intro-img home-page-intro-img-a">
                <img src="./src/assets/images/polaroid-1.png" alt="" />
                <p>Gardez un souvenir de chaque<br></br> étape de vos vacances</p>
                </div>
                <div className="home-page-intro-img home-page-intro-img-b">
                <img src="./src/assets/images/polaroid-2.png" alt="" />
                <p>Partagez vos aventures<br></br> avec vos proches</p>
                </div>
                <div className="home-page-intro-img home-page-intro-img-c">
                <img src="./src/assets/images/polaroid-3.png" alt="" />
                <p>Notez vos ressentis<br></br> au jour le jour</p>
                </div>
              </section>
          {loading ? (
            <div>
              <h3>Mes voyages</h3>
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
                  <div className="tags-section">
                    {tagsMap[voyage.id].map(tag => (
                      <span key={tag.id}>
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

                </footer>
              </li>
            ))}
          </ul>

            </div>
            
          ) : (
            <div>
              
            <div className="items-list">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            </div>

          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;