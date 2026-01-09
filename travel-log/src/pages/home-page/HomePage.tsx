import { useState, useEffect } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import './HomePage.css'
import ListVoyagePage from "../../pages/voyages/list-voyages/ListVoyages";


interface Item {
  id: number;
  title: string;
  description: string;
  user_id: string;
}

function HomePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetchItems();
  }, []);

//   const fetchItems = async () => {
//     setLoading(true);
//     // Appel au back à faire
//     setLoading(false);
//   };

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