import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hero.jpg";
import palmTree from "../assets/palmtree.png";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <img src={heroImg} alt="Travel background" className="hero-img" />
      <div className="hero-overlay" />

      <div className="hero-inner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <img src={palmTree} alt="Palm tree" className="trippy-palm" />
        <span className="trippy-logo trippy-hero-large">Trippy</span>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="block font-light hero-beige">Time for your</span>
            <span className="block font-semibold hero-beige">next adventure</span>
          </h1>

          <p className="mb-8 text-lg md:text-2xl text-gray-200">
            Your own AI travel planner
          </p>

          <button onClick={() => navigate("/auth")} className="cta-btn">Plan my trip</button>
        </div>
      </div>
    </section>
  );
}
