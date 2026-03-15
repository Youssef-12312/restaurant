import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/FoodShowcase.css";

/**
 * FoodShowcase
 * - Slideshow بصور أكل بتتبدل أوتوماتيك
 * - فيديو نار في الخلفية
 * - لما يجيب صورك من assets استبدل الـ SLIDES بالصور بتاعتك
 */

const SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=1200&q=80",
    title: "Crispy Fried Chicken",
    sub: "Golden. Juicy. Unforgettable.",
  },
  {
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80",
    title: "Loaded Burgers",
    sub: "Stacked high. Melted cheese in every bite.",
  },
  {
    img: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=1200&q=80",
    title: "Cheese Overload",
    sub: "Because more cheese is always the answer.",
  },
  {
    img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=1200&q=80",
    title: "Crispy Strips",
    sub: "Perfectly seasoned. Perfectly fried.",
  },
];

function FoodShowcase() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading]   = useState(false);

  // تبديل أوتوماتيك كل 3.5 ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % SLIDES.length);
        setFading(false);
      }, 500);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const goTo = (i) => {
    if (i === current) return;
    setFading(true);
    setTimeout(() => { setCurrent(i); setFading(false); }, 400);
  };

  return (
    <section className="showcase">



      <div className="showcase__overlay" />

      {/* الصورة الحالية */}
      <img
        className={`showcase__img${fading ? " showcase__img--fade" : ""}`}
        src={SLIDES[current].img}
        alt={SLIDES[current].title}
      />

      {/* النص */}
      <div className={`showcase__text${fading ? " showcase__text--fade" : ""}`}>
        <span className="showcase__eyebrow">Shelter House of Cheese</span>
        <h2 className="showcase__title">{SLIDES[current].title}</h2>
        <p className="showcase__sub">{SLIDES[current].sub}</p>
        <Link to="/menu" className="showcase__cta">Order Now</Link>
      </div>

      {/* Dots */}
      <div className="showcase__dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`showcase__dot${current === i ? " showcase__dot--active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

    </section>
  );
}

export default FoodShowcase;