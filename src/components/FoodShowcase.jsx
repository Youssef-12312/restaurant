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
    img: "/coverPhoto.webp",
    title: "Crispy Fried Chicken",
    sub: "Golden. Juicy. Unforgettable.",
  },
  {
    img: "/cover.webp",
    title: "Loaded Burgers",
    sub: "Stacked high. Melted cheese in every bite.",
  },
  {
    img: "/coverPhoto3.webp",
    title: "Cheese Overload",
    sub: "Because more cheese is always the answer.",
  },
  {
    img: "/coverPhoto4.webp",
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