import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.jpg"; // your image path

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-full">
      {/* Background Image */}
      <img
        src={heroImg}
        alt="Travel background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center text-center px-6">
        <div className="max-w-3xl text-white">
          <h1 className="text-4xl md:text-6xl leading-tight mb-4 font-fira">
            <span className="block font-light">Time for your</span>
            <span className="block font-semibold">next adventure</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-200 mb-8">
            Your own AI travel planner
          </p>

          <button
            onClick={() => navigate("/auth")}
            className="bg-orange-500 hover:bg-orange-600 transition px-10 py-4 rounded-full text-lg font-semibold shadow-lg"
          >
            PLAN NOW
          </button>
        </div>
      </div>
    </div>
  );
}
