import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import './HomePage.css'


function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <main>
        <div className="content">
          <section className="home-page-intro">
                <div className="home-page-intro-img home-page-intro-img-a">
                <img src="/assets/images/polaroid-1.png" alt="" />
                <p>Gardez un souvenir de chaque<br></br> étape de vos vacances</p>
                </div>
                <div className="home-page-intro-img home-page-intro-img-b">
                <img src="/assets/images/polaroid-2.png" alt="" />
                <p>Partagez vos aventures<br></br> avec vos proches</p>
                </div>
                <div className="home-page-intro-img home-page-intro-img-c">
                <img src="/assets/images/polaroid-3.png" alt="" />
                <p>Notez vos ressentis<br></br> au jour le jour</p>
                </div>
              </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;