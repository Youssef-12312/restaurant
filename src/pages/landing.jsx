import { Link } from "react-router-dom";
import { images } from "../assets/Images/images.js";
import "../styles/landing.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import FoodShowcase from "../components/FoodShowcase.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

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

<footer className="footer">
  <div className="footer-accent" />
  <div className="footer-container">

    <div className="footer-brand">
      <div className="footer-brand-icon"><img src={images.ramadan} alt="Logo" /></div>
      <div className="footer-brand-name">S H E L T E R</div>
      <p>{t("footer.description")}</p>
    </div>

    <div className="footer-links">
      <div className="footer-col-title">{t("Quick Links ")}</div>
      <Link to="/menu">{t("nav.viewMenu")}</Link>
    </div>

    <div className="footer-locations">
      <div className="footer-col-title">Our Branches</div>
      <a href="https://maps.app.goo.gl/ExfhJkUuegP9AdXs9" target="_blank" rel="noreferrer" className="footer-map-link">
        <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
        الفرع الأول — المنصورة
      </a>
      <a href="https://maps.app.goo.gl/ES8wz8UCVS6uBnCg7" target="_blank" rel="noreferrer" className="footer-map-link">
        <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
        الفرع الثاني — المنصورة
      </a>
    </div>

    <div className="footer-social">
      <div className="footer-col-title">{t("footer.followUs")}</div>
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
    <p className="powerd-name">Powered by <a target="_blank" href="https://api.whatsapp.com/send/?phone=201007403490">Youssef Amr</a></p>
    <Link to="/privacy" className="footer-policy-link">{t("footer.privacy")}</Link>
  </div>
</footer>
<a
  href="https://api.whatsapp.com/send/?phone=201033030430"
  target="_blank"
  rel="noreferrer"
  aria-label="WhatsApp"
  style={{
    position: "fixed",
    right: "20px",
    bottom: "20px",
    width: "58px",
    height: "58px",
    borderRadius: "50%",
    backgroundColor: "#25D366",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    boxShadow: "0 10px 25px rgba(0,0,0,0.22)",
    zIndex: 9999,
  }}
>
  <FontAwesomeIcon icon={faWhatsapp} size="xl" />
</a>
    </main>
  );
}

export default Landing;