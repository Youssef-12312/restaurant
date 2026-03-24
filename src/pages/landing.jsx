import { Link } from "react-router-dom";
import { images } from "../assets/Images/images.js";
import "../styles/landing.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import FoodShowcase from "../components/FoodShowcase.jsx";


const MARQUEE_ITEMS = Array.from({ length: 12 }, (_, i) => i);

function MarqueeContent() {
  return (
    <>
      {MARQUEE_ITEMS.map((_, i) => (
        <div className="marquee-item" key={i}>
          <span className="hotline">📞 17574</span>
          <img src={images.logo} alt="Shelter logo" loading="lazy" />
        </div>
      ))}
    </>
  );
}

function Landing() {
  const { t } = useTranslation();

  return (
    <main className="landing">

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <img src={images.logo} alt="Shelter logo" loading="lazy" />
            <span>Shelter</span>
          </div>
          <div className="nav-links">
            <Link to="/menu" className="menu-btn">
              {t("nav.viewMenu")}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <img src={images.logo} alt="Shelter logo" className="hero-logo" loading="lazy" />
        <h1>Shelter</h1>
        <p className="tagline">{t("hero.tagline")}</p>
        <p className="hero-text">{t("hero.text")}</p>
        <div className="hero-buttons">
          <Link to="/menu">
            <button className="primary-btn">{t("hero.viewMenu")}</button>
          </Link>
          <button className="secondary-btn">
            <a href="tel:17574" className="call-link">
              {t("hero.callUs")}
            </a>
          </button>
        </div>
      </section>
      
      <div className="hotline-marquee up">
        <div className="marquee-row marquee-row-1 up">
          <MarqueeContent />
        </div>
        <div className="marquee-row marquee-row-2 up">
          <MarqueeContent />
        </div>
      </div>
      
      {/* Food Showcase */}
      <FoodShowcase />

      {/* Hotline Carousel*/ }
      <div className="hotline-marquee">
        <div className="marquee-row marquee-row-1">
          <MarqueeContent />
        </div>
        <div className="marquee-row marquee-row-2">
          <MarqueeContent />
        </div>
      </div>

      {/* About */}
      <section id="about" className="about">
        <div className="about-text">
          <h2>{t("about.title")} <span className="shelter">Shelter</span></h2>
          <p>{t("about.body")}</p>
        </div>
        <div className="about-img">
          <img src={images.about} alt="About Shelter" loading="lazy" />
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <img src={images.ramadan} alt="Shelter logo" className="footer-logo" loading="lazy" />
            <p>{t("footer.description")}</p>
          </div>
          <div className="footer-links">
            <Link to="/menu">{t("nav.viewMenu")}</Link>
          </div>
          <div className="footer-locations">
            <h4>Our Branches</h4>
                    <p className="footer-address">
                      
                              <a
                      href="https://maps.app.goo.gl/ExfhJkUuegP9AdXs9"
                      target="_blank"
                      rel="noreferrer"
                      className="footer-map-link"
                    >
                      📍  الفرع الأول ، المنصورة(اضغط لفتح الموقع)
                    </a>
                    </p>

                    <a
                      href="https://maps.app.goo.gl/ES8wz8UCVS6uBnCg7"
                      target="_blank"
                      rel="noreferrer"
                      className="footer-map-link"
                    >
                      📍 الفرع الثاني ، المنصورة (اضغط لفتح الموقع)
                    </a>
                  </div>
          <div className="footer-social">
            <h4>{t("footer.followUs")}</h4>
            <div className="social-icons">
              <a href="https://www.instagram.com/shelter.egy/" target="_blank" rel="noreferrer" className="social-btn">Instagram</a>
              <a href="https://www.facebook.com/Shelterhouseofcheese" target="_blank" rel="noreferrer" className="social-btn">Facebook</a>
              <a href="https://www.tiktok.com/@shelterhouseofcheese" target="_blank" rel="noreferrer" className="social-btn">TikTok</a>
              <a href="https://api.whatsapp.com/send/?phone=201033030430" target="_blank" rel="noreferrer" className="social-btn">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t("footer.rights")}</p>
        </div>
        <p className="powerd-name">Powerd by : <a target="_blank" href="https://api.whatsapp.com/send/?phone=201007403490">Youssef Amr</a> </p>
        <div className="footer-legal">
          <Link to="/privacy" className="footer-policy-link">
            {t("footer.privacy")}
          </Link>
        </div>
      </footer>

    </main>
  );
}

export default Landing;