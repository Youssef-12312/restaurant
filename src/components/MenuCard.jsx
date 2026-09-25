
import "../styles/menu.css";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { getItemBasePrice, getItemVariants, toText } from "../utils/menuSchema.js";

function MenuCard({ item, addToCart, onClick }) {
  const { t, i18n } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);

  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
  const itemImage = item?.imageUrl || "";
  const itemName = toText(item?.name, lang);
  const itemDescription = toText(item?.description, lang);
  const variants = getItemVariants(item);
  const price = getItemBasePrice(item);

  return (
    <div className="menu-card" onClick={onClick}>
      <div className="menu-card__image-wrapper">
        {imageFailed || !itemImage ? (
          <div className="menu-card__img menu-card__img--placeholder" aria-label={itemName}>
            <span aria-hidden="true">🍽️</span>
          </div>
        ) : (
          <img
            className="menu-card__img"
            src={itemImage}
            alt={itemName}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="menu-card__body">
        <h3 className="menu-card__name">{itemName}</h3>
        <p className="menu-card__description">{itemDescription}</p>

        <div className="menu-card__footer">
          <span className="menu-card__price">
            {variants.length > 1
              ? variants.map((variant) => `${variant.label?.[lang] || variant.id}: ${Number(variant.price).toFixed(2)} EGP`).join(" / ")
              : `${Number(price || 0).toFixed(2)} EGP`}
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