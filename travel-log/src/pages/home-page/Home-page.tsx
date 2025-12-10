import { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";

interface Item {
  id: number;
  title: string;
  description: string;
  user_id: string;
}

function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

    const fetchItems = async () => {
        setLoading(true);
        // Appel au back à faire
        setLoading(false);
    };

  useEffect(() => {
    const loadItems = async () => {
      await fetchItems();
    };
    loadItems();
  }, []);

  return (
    <div className="home-page">
      <Header />
      <main>
        <div className="content">
          <h1>Accueil</h1>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="items-list">
              {items.map((item) => (
                <div key={item.id} className="item-card">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;