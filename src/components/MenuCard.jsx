
import "../styles/menu.css";
import { useTranslation } from "react-i18next";

function MenuCard({ item, addToCart, onClick }) {
  const { t, i18n } = useTranslation();

  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";

  const getText = (value) => {
    if (typeof value === "string") return value;
    if (!value || typeof value !== "object") return "";
    return value[lang] || value.ar || value.en || "";
  };

const getPrice = () => {

  if (typeof item.price === "number") {
    return item.price.toFixed(2);
  }


  if (item.prices && typeof item.prices === "object") {

    if (item.prices.large) return item.prices.large.toFixed(2);
    if (item.prices.medium) return item.prices.medium.toFixed(2);
    if (item.prices.small) return item.prices.small.toFixed(2);
  }

  return "0.00";
};

  return (
    <div className="menu-card" onClick={onClick}>
      <div className="menu-card__image-wrapper">
        <img
          className="menu-card__img"
        src={`/images/${item.id}.webp`}
        alt={getText(item.name)}
        loading="lazy"
        />
      </div>

      <div className="menu-card__body">
        <h3 className="menu-card__name">{getText(item.name)}</h3>
        <p className="menu-card__description">{getText(item.description)}</p>

        <div className="menu-card__footer">
          <span className="menu-card__price">
            {getPrice()} EGP
          </span>

          <button className="menu-card__btn" onClick={() => addToCart(item)}>
            {t("menu.addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MenuCard;