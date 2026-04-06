import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { images } from "../assets/Images/images.js";
import "../styles/landing.css";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import FoodShowcase from "../components/FoodShowcase.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import CategorySlider from "../components/slider.jsx";  
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

function StatusBadge() {
  const [status, setStatus] = useState({ open: false, label: "..." });

useEffect(() => {
    function check() {
      const now    = new Date();
      const day    = now.getDay();                          // 0=Sun … 5=Fri … 6=Sat
      const mins   = now.getHours() * 60 + now.getMinutes();
      const openAt = day === 5 ? 14 * 60 : 10 * 60 + 30;  
      const closeAt = 21 * 60 + 30;                       
      const isOpen = mins >= openAt && mins < closeAt;
   
      const nextOpen = day === 4 ? "2:00 م" : "10:30 ص";
      setStatus({
        open: isOpen,
        label: isOpen ? "مفتوح الآن" : `مغلق · يفتح ${nextOpen}`,
      });
    }
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="hero-badge badge-tl">
      <span className={`sdot ${status.open ? "sdot-open" : "sdot-closed"}`} />
      {status.label}
    </div>
  );
}

const PhoneIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d96d12"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07
      A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.1 3.18a2 2 0 0 1 2-2.18h3
      a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09
      9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0
      2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const PinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#d96d12">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75
      7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62
      6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
  </svg>
);

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

        {/* Floating Badges */}
        <StatusBadge />





        {/* Logo */}
        <div className="hero-logo-wrap">
          <img src={images.logo} alt="Shelter logo" loading="lazy" />
        </div>

        <h1>Shelter</h1>
        <p className="tagline">{t("hero.tagline")}</p>
<div className="stat-chips">
  <div className="stat-chip">
    <strong>4.6</strong>
    <span className="chip-sub">{t("chip.rating")}</span>
  </div>

  <div className="stat-chip">{t("chip.fresh")}</div>

  <Link to="/menu" className="stat-chip stat-chip-link">
    {t("nav.viewMenu")}
  </Link>

  <a href="#footerID" className="stat-chip stat-chip-link">
    <PinIcon />
    <span>{t("chip.branches")}</span>
  </a>

  <div className="stat-chip">
    <PhoneIcon />
    17574
  </div>
</div>

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

      {/* Hotline Carousel */}
      <div className="hotline-marquee">
        <div className="marquee-row marquee-row-1">
          <MarqueeContent />
        </div>
        <div className="marquee-row marquee-row-2">
          <MarqueeContent />
        </div>
      </div>
      <CategorySlider/>
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

      <footer className="footer" id="footerID">
        <div className="footer-accent" />
        <div className="footer-container">

          <div className="footer-brand">
            <div className="footer-brand-icon">
              <img src={images.ramadan} alt="Logo" />
            </div>
            <div className="footer-brand-name">S H E L T E R</div>
            <p>{t("footer.description")}</p>
          </div>

          <div className="footer-links">
            <div className="footer-col-title">{t("Quick Links ")}</div>
            <Link to="/menu">{t("nav.viewMenu")}</Link>
          </div>

          <div className="footer-locations">
            <div className="footer-col-title">Our Branches</div>
            <a href="https://maps.app.goo.gl/ExfhJkUuegP9AdXs9" target="_blank"
              rel="noreferrer" className="footer-map-link">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75
                  7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62
                  6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
              </svg>
              الفرع الأول — المنصورة
            </a>
            <a href="https://maps.app.goo.gl/ES8wz8UCVS6uBnCg7" target="_blank"
              rel="noreferrer" className="footer-map-link">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75
                  7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62
                  6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
              </svg>
              الفرع الثاني — المنصورة
            </a>
          </div>

          <div className="footer-social">
            <div className="footer-col-title">{t("footer.followUs")}</div>
            <div className="social-icons">
              <a href="https://www.instagram.com/shelter.egy/" target="_blank"
                rel="noreferrer" className="social-btn">Instagram</a>
              <a href="https://www.facebook.com/Shelterhouseofcheese" target="_blank"
                rel="noreferrer" className="social-btn">Facebook</a>
              <a href="https://www.tiktok.com/@shelterhouseofcheese" target="_blank"
                rel="noreferrer" className="social-btn">TikTok</a>
              <a href="https://api.whatsapp.com/send/?phone=201033030430" target="_blank"
                rel="noreferrer" className="social-btn">WhatsApp</a>
            </div>
          </div>

        </div>

        <div className="footer-bottom">
          <p>{t("footer.rights")}</p>
          <p className="d">
            Developed by{" "}
            <a target="_blank" href="https://api.whatsapp.com/send/?phone=201007403490">
              Youssef Amr
            </a>
          </p>
          <Link to="/privacy" className="footer-policy-link">
            {t("footer.privacy")}
          </Link>
        </div>
      </footer>

      {/* WhatsApp FAB */}
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