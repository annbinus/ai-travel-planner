import Navbar from "./Navbar";
import RecentItineraries from "./RecentItineraries";
import FeatureCarousel from "./FeatureCarousel";
import "../../styles/themes.css";

export default function Home() {
  return (
    <>
      {/* Navbar outside the page container */}
      <Navbar />

      {/* Main page content */}
      <div className="page">
        {/* Greeting + Search */}
        <div className="flex-between mb-10">
          <h1 className="text-4xl font-semibold">Hello Ann!</h1>
        </div>

        {/* Main Content */}
        <div className="grid-3">
          <RecentItineraries />
          <FeatureCarousel />
        </div>
      </div>
    </>
  );
}
