import Navbar from "./Navbar";
import RecentItineraries from "./RecentItineraries";
import FeatureCarousel from "./FeatureCarousel";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f1e6]">
      <Navbar />

      <div className="px-10 py-8">
        {/* Greeting + Search */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-semibold">
            Hello Ann!
          </h1>

          <input
            placeholder="Ask AI to create itinerary"
            className="w-96 px-6 py-3 rounded-full border shadow-sm"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-10">
          <RecentItineraries />
          <FeatureCarousel />
        </div>
      </div>
    </div>
  );
}
