import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.jpg";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative h-screen w-full">
      {/* Background */}
      <img
        src={heroImg}
        alt="Travel background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
        <div className="max-w-3xl text-white">
          <h1 className="mb-4 text-4xl md:text-6xl leading-tight font-fira">
            <span className="block font-light">Time for your</span>
            <span className="block font-semibold">next adventure</span>
          </h1>

          <p className="mb-8 text-lg md:text-2xl text-gray-200">
            Your own AI travel planner
          </p>

          <button
            onClick={() => navigate("/auth")}
            className="rounded-full bg-orange-500 px-10 py-4 text-lg font-semibold shadow-lg transition hover:bg-orange-600"
          >
            PLAN NOW
          </button>
        </div>
      </div>
    </section>
  );
}
