import { images } from "../assets/Images/images.js";
import "../Styles/menu.css";
import { useTranslation } from "react-i18next";

function MenuCard({ item, addToCart }) {
  const { t } = useTranslation();

  return (
    <div className="menu-card">
      <div className="menu-card__image-wrapper">
        <img
          className="menu-card__img"
          src={images[item.category] || images.placeholder}
          alt={item.name}
          loading="lazy"
        />
      </div>

      <div className="menu-card__body">
        <h3 className="menu-card__name">{item.name}</h3>
        <p className="menu-card__description">{item.description}</p>

        <div className="menu-card__footer">
          <span className="menu-card__price">
            $
            {item.price
              ? item.price.toFixed(2)
              : Object.values(item.prices || {})[0]?.toFixed?.(2) || "0.00"}
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