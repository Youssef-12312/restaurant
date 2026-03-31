import { useRef } from "react";
import "../styles/slider.css";
import { Link } from "react-router-dom";

const categories = [
{ img: "/slider/1.webp" },
{ img: "/slider/2.webp" },
{ img: "/slider/3.webp" },
{ img: "/slider/4.webp" },
{ img: "/slider/5.webp" },
{ img: "/slider/6.webp" },
];

export default function CategorySlider() {
  const sliderRef = useRef();

  const scroll = (direction) => {
    const scrollAmount = 250;
    if (direction === "right") {
      sliderRef.current.scrollLeft += scrollAmount;
    } else {
      sliderRef.current.scrollLeft -= scrollAmount;
    }
  };

  return (
    <div className="category-section">
      <h2>استكشف قائمتنا</h2>

      <div className="slider-wrapper">
        <button className="arrow right" onClick={() => scroll("right")}>
          ›
        </button>

        <div className="slider" ref={sliderRef}>
          {categories.map((cat, index) => (
            <div className="card" key={index}>
              <img src={cat.img} alt="category" />
            </div>
          ))}
        </div>


      </div>
        <Link to="/menu">
      <button className="menu-btn-slider">عرض القائمة كاملة</button>
    </Link>
    </div>
  );
}