import { useState } from "react";
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

  return (
    <div className="col-span-2 bg-white rounded-2xl p-6 shadow relative">
      {slides[index]}

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-gray-700" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
