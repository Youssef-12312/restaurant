import "../Styles/privacy.css";
import { images } from "../assets/Images/images.js";
import { useTranslation } from "react-i18next";

function PrivacyPolicy() {
  const { t } = useTranslation();
  const sections = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <main className="privacy-page">

      <section className="privacy-hero">
        <img src={images.logo} alt="Shelter logo" className="hero-logo" loading="lazy"/>
        <div className="privacy-hero__content">
          <p className="privacy-eyebrow">{t("privacy.eyebrow")}</p>
          <h1>{t("privacy.title")}</h1>
          <p className="privacy-subtitle">{t("privacy.subtitle")}</p>
        </div>
      </section>

      <section className="privacy-content">
        <div className="privacy-card">

          {sections.map((num) => (
            <div className="privacy-section" key={num}>
              <h2>{t(`privacy.sections.${num}.title`)}</h2>
              <p>{t(`privacy.sections.${num}.body`)}</p>
            </div>
          ))}

          <div className="privacy-note">
            <strong>{t("privacy.lastUpdated")}</strong> March 2026
          </div>

        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;