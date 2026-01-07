import { useEffect, useState } from "react";
import "../../styles/themes.css";

import SavedDestinations from "./slides/SavedDestinations";
import ExplorePlaces from "./slides/ExplorePlaces";
import UploadVideos from "./slides/UploadVideos";

const slides = [
  <SavedDestinations />,
  <ExplorePlaces />,
  <UploadVideos />
];

export default function FeatureCarousel() {
  const [index, setIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPrevIndex(index);
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [index]);

  const goTo = (i) => {
    setPrevIndex(index);
    setIndex(i);
  };

  return (
    <div className="card card-wide card-carousel carousel-container">
        <div className="carousel-inner">
            <div key={prevIndex} className="carousel-slide slide-out">
            {slides[prevIndex]}
            </div>

            <div key={index} className="carousel-slide slide-in">
            {slides[index]}
            </div>
        </div>


      {/* Dots */}
      <div className="carousel-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`dot ${i === index ? "dot-active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
