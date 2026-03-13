import { useTranslation } from "react-i18next";


function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const toggle = () => {
    const next = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      style={{
        background: "none",
        border: "1.5px solid currentColor",
        borderRadius: "999px",
        padding: "6px 14px",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        marginRight: "16px",
        color: "inherit",
        transition: "opacity 0.2s",
        marginLeft: "16px",
      }}
      aria-label="Switch language"
    >
       {t("nav.language")}
    </button>
  );
}

export default LanguageSwitcher;